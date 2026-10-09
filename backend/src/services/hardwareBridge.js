'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP, REVERSE_ZONE_MAP } = require('./zoneService')
const realtime = require('../realtime')
const feedbackService = require('./feedbackService')

const VALID_DEVICE_TYPES = ['fan', 'light']
const VALID_STATES = ['ON', 'OFF']

let reconciliationInterval = null
const RECONCILIATION_INTERVAL_MS = 10 * 1000

function startReconciliationInterval() {
  if (reconciliationInterval) {
    return
  }
  reconciliationInterval = setInterval(async () => {
    try {
      await reconcileStaleSentActions()
    } catch (err) {
      console.error('[HardwareBridge] Reconciliation interval error:', err.message)
    }
  }, RECONCILIATION_INTERVAL_MS)
  reconciliationInterval.unref()
  console.log('[HardwareBridge] Started periodic stale SENT reconciliation (10s interval)')
}

function stopReconciliationInterval() {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval)
    reconciliationInterval = null
    console.log('[HardwareBridge] Stopped periodic stale SENT reconciliation')
  }
}

async function getNextCommand(frontendZoneId, deviceId) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) {
    const err = new Error('Invalid zone')
    err.code = 'INVALID_ZONE'
    err.status = 400
    throw err
  }

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    select: { id: true }
  })

  if (!zone) {
    const err = new Error('Zone not found')
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const now = new Date()
  const action = await prisma.$transaction(async (tx) => {
    const pendingAction = await tx.actionLog.findFirst({
      where: {
        zoneId: zone.id,
        status: 'PENDING'
      },
      orderBy: { executedAt: 'asc' }
    })

    if (!pendingAction) {
      return null
    }

    const claimedAction = await tx.actionLog.update({
      where: { 
        id: pendingAction.id,
        status: 'PENDING'
      },
      data: { 
        status: 'SENT',
        executedAt: now
      }
    })

    return claimedAction
  })

  if (!action) {
    return {
      hasCommand: false,
      nextPollMs: 1000
    }
  }

  return {
    hasCommand: true,
    command: {
      actionId: action.id,
      zoneId: frontendZoneId,
      deviceStates: action.deviceStates,
      issuedAt: action.executedAt.toISOString()
    }
  }
}

async function handleAck(payload, deviceId) {
  const { actionId, status, executedAt, deviceStates, error } = payload

  const action = await prisma.actionLog.findUnique({
    where: { id: actionId },
    include: { zone: true }
  })

  if (!action) {
    const err = new Error('Action not found')
    err.code = 'ACTION_NOT_FOUND'
    err.status = 404
    throw err
  }

  if (action.zoneId !== deviceId) {
    const err = new Error('Action zone does not match device zone')
    err.code = 'ACTION_WRONG_ZONE'
    err.status = 400
    throw err
  }

  const executedAtDate = new Date(executedAt)

  const result = await prisma.$transaction(async (tx) => {
    try {
      const updatedAction = await tx.actionLog.update({
        where: { 
          id: actionId,
          status: 'SENT'
        },
        data: {
          status,
          executedAt: executedAtDate
        }
      })

      if (status === 'ACKNOWLEDGED') {
        for (const ds of deviceStates) {
          if (ds.applied === true) {
            await tx.actuatorState.upsert({
              where: { zoneId_device: { zoneId: action.zoneId, device: ds.device } },
              create: {
                zoneId: action.zoneId,
                device: ds.device,
                state: { state: ds.state }
              },
              update: {
                state: { state: ds.state }
              }
            })
          }
        }
      }

      return updatedAction
    } catch (err) {
      if (err.code === 'P2025') {
        const validationErr = new Error('Action not found or not in SENT status')
        validationErr.code = 'ACTION_WRONG_STATUS'
        validationErr.status = 409
        throw validationErr
      }
      throw err
    }
  })

  const frontendZoneId = action.zone.name === 'Zone A' ? 'A' : 'B'

  realtime.publish('action.status', {
    actionId,
    zoneId: frontendZoneId,
    status,
    previousStatus: 'SENT',
    executedAt: executedAtDate.toISOString(),
    error: error || null
  }, actionId)

  if (status === 'ACKNOWLEDGED') {
    for (const ds of deviceStates) {
      if (ds.applied === true) {
        realtime.publish('actuator.updated', {
          zoneId: frontendZoneId,
          device: ds.device,
          state: ds.state,
          updatedAt: new Date().toISOString(),
          source: 'hardware'
        }, `actuator-${frontendZoneId}-${ds.device}`)
      }
    }

    setTimeout(() => {
      feedbackService.computeEffectiveness(actionId)
        .then(result => {
          if (!result.alreadyComputed) {
            console.log(`[Feedback] Auto-computed effectiveness for action ${actionId}: ${result.effectiveness}`)
          }
        })
        .catch(err => {
          console.warn(`[Feedback] Auto-computation failed for action ${actionId}:`, err.message)
        })
    }, 20 * 60 * 1000)
  }

  return {
    success: true,
    actionId,
    status,
    actuatorStateUpdated: status === 'ACKNOWLEDGED'
  }
}

async function reconcileStaleSentActions() {
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000)

  const staleActions = await prisma.actionLog.findMany({
    where: {
      status: 'SENT',
      executedAt: { lt: sixtySecondsAgo }
    },
    include: { zone: true }
  })

  for (const action of staleActions) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.actionLog.update({
          where: { id: action.id },
          data: {
            status: 'FAILED'
          }
        })
      })

      const frontendZoneId = action.zone.name === 'Zone A' ? 'A' : 'B'

      realtime.publish('action.status', {
        actionId: action.id,
        zoneId: frontendZoneId,
        status: 'FAILED',
        previousStatus: 'SENT',
        executedAt: new Date().toISOString(),
        error: 'Command timeout: ESP32 did not acknowledge within 60s'
      }, action.id)

      console.log(`[HardwareBridge] Marked stale action ${action.id} as FAILED (timeout)`)
    } catch (err) {
      console.error(`[HardwareBridge] Failed to reconcile stale action ${action.id}:`, err.message)
    }
  }

  return staleActions.length
}

async function reconcileStaleSentActionsOnStartup() {
  console.log('[HardwareBridge] Running startup reconciliation for stale SENT actions...')
  const count = await reconcileStaleSentActions()
  if (count > 0) {
    console.log(`[HardwareBridge] Reconciled ${count} stale SENT action(s) to FAILED`)
  }
  startReconciliationInterval()
}

module.exports = {
  getNextCommand,
  handleAck,
  reconcileStaleSentActions,
  reconcileStaleSentActionsOnStartup,
  startReconciliationInterval,
  stopReconciliationInterval
}