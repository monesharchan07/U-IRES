'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('./zoneService')

const TEMP_HOT_THRESHOLD = 26.5
const FAN_TEMP_IMPACT_HOT = -1.8
const FAN_TEMP_IMPACT_NORMAL = -0.5

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function roundToInt(value) {
  return Math.round(value)
}

function estimateExpectedDelta(deviceStates, baselineTelemetry) {
  if (!deviceStates || deviceStates.length === 0) {
    return 0
  }

  const baselineTemp = baselineTelemetry?.temperature ?? null
  let expectedDelta = 0

  for (const ds of deviceStates) {
    if (ds.device === 'fan') {
      if (ds.state === 'ON') {
        if (baselineTemp !== null && baselineTemp > TEMP_HOT_THRESHOLD) {
          expectedDelta += FAN_TEMP_IMPACT_HOT
        } else {
          expectedDelta += FAN_TEMP_IMPACT_NORMAL
        }
      } else if (ds.state === 'OFF') {
        if (baselineTemp !== null && baselineTemp > TEMP_HOT_THRESHOLD) {
          expectedDelta += Math.abs(FAN_TEMP_IMPACT_HOT)
        } else {
          expectedDelta += Math.abs(FAN_TEMP_IMPACT_NORMAL)
        }
      }
    }
  }

  return round1(expectedDelta)
}

function getActionTypeLabel(deviceStates) {
  if (!deviceStates || deviceStates.length === 0) return 'action'
  const hasFan = deviceStates.some(d => d.device === 'fan')
  const hasLight = deviceStates.some(d => d.device === 'light')
  if (hasFan && hasLight) return 'airflow and lighting'
  if (hasFan) return 'airflow'
  if (hasLight) return 'lighting'
  return 'action'
}

function buildPolicyDelta(effectiveness, deviceStates) {
  const actionType = getActionTypeLabel(deviceStates)
  if (effectiveness === null) {
    return 'Insufficient data for policy adjustment'
  }
  if (effectiveness >= 85) {
    return `+0.04 reward weight on ${actionType} actions`
  }
  if (effectiveness >= 70) {
    return `+0.02 reward weight on ${actionType} actions`
  }
  if (effectiveness >= 50) {
    return '+0.00 (stable)'
  }
  return '-0.02 reward weight, explore alternatives'
}

function formatDeltaText(delta) {
  if (delta === 0) return 'Stable (±0.0 °C)'
  const sign = delta > 0 ? '+' : ''
  return `Temperature ${sign}${round1(delta)} °C`
}

function formatErrorText(observedDelta, expectedDelta) {
  if (expectedDelta === 0 && observedDelta === 0) return '±0.0 °C'
  if (expectedDelta === 0) return `${observedDelta > 0 ? '+' : ''}${round1(observedDelta)} °C`
  const error = round1(observedDelta - expectedDelta)
  const sign = error > 0 ? '+' : ''
  return `${sign}${error} °C`
}

async function computeEffectiveness(actionLogId) {
  const actionLog = await prisma.actionLog.findUnique({
    where: { id: actionLogId },
    include: { zone: true }
  })

  if (!actionLog) {
    const err = new Error('ActionLog not found')
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  if (actionLog.effectivenessScore !== null && actionLog.effectivenessScore !== undefined) {
    return {
      alreadyComputed: true,
      effectiveness: actionLog.effectivenessScore,
      observedDelta: null,
      expectedDelta: null,
      baselineSummary: null,
      outcomeSummary: null,
      dataStatus: 'READY'
    }
  }

  const executedAt = new Date(actionLog.executedAt)
  const baselineStart = new Date(executedAt.getTime() - 5 * 60 * 1000)
  const baselineEnd = executedAt
  const outcomeStart = new Date(executedAt.getTime() + 1)
  const outcomeEnd = new Date(executedAt.getTime() + 20 * 60 * 1000)

  const [baselineTelemetry, outcomeTelemetry] = await Promise.all([
    prisma.zoneTelemetry.findMany({
      where: {
        zoneId: actionLog.zoneId,
        timestamp: { gte: baselineStart, lt: baselineEnd },
        temperature: { not: null }
      },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, temperature: true }
    }),
    prisma.zoneTelemetry.findMany({
      where: {
        zoneId: actionLog.zoneId,
        timestamp: { gt: outcomeStart, lte: outcomeEnd },
        temperature: { not: null }
      },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, temperature: true }
    })
  ])

  const MIN_SAMPLES = 10

  if (baselineTelemetry.length < MIN_SAMPLES || outcomeTelemetry.length < MIN_SAMPLES) {
    return {
      alreadyComputed: false,
      effectiveness: null,
      observedDelta: null,
      expectedDelta: null,
      baselineSummary: {
        start: baselineStart.toISOString(),
        end: baselineEnd.toISOString(),
        sampleCount: baselineTelemetry.length,
        avgTemperature: baselineTelemetry.length > 0
          ? round1(baselineTelemetry.reduce((a, b) => a + b.temperature, 0) / baselineTelemetry.length)
          : null
      },
      outcomeSummary: {
        start: outcomeStart.toISOString(),
        end: outcomeEnd.toISOString(),
        sampleCount: outcomeTelemetry.length,
        avgTemperature: outcomeTelemetry.length > 0
          ? round1(outcomeTelemetry.reduce((a, b) => a + b.temperature, 0) / outcomeTelemetry.length)
          : null
      },
      dataStatus: 'INSUFFICIENT_DATA',
      reason: `Insufficient telemetry data (baseline: ${baselineTelemetry.length}, outcome: ${outcomeTelemetry.length} samples, minimum: ${MIN_SAMPLES})`
    }
  }

  const meanBefore = baselineTelemetry.reduce((a, b) => a + b.temperature, 0) / baselineTelemetry.length
  const meanAfter = outcomeTelemetry.reduce((a, b) => a + b.temperature, 0) / outcomeTelemetry.length
  const observedDelta = round1(meanAfter - meanBefore)

  const baselineAvgTemp = round1(meanBefore)
  const expectedDelta = estimateExpectedDelta(actionLog.deviceStates, { temperature: baselineAvgTemp })

  let effectiveness
  if (expectedDelta === 0) {
    effectiveness = 70
  } else {
    const errorRatio = Math.abs(observedDelta - expectedDelta) / Math.abs(expectedDelta)
    effectiveness = roundToInt(clamp(100 - errorRatio * 100, 0, 100))
  }

  const expectedOutcome = {
    expectedDelta,
    baselineAvgTemp,
    observedDelta,
    computedAt: new Date().toISOString()
  }

  await prisma.actionLog.update({
    where: { id: actionLogId },
    data: {
      effectivenessScore: effectiveness,
      expectedOutcome
    }
  })

  return {
    alreadyComputed: false,
    effectiveness,
    observedDelta,
    expectedDelta,
    baselineSummary: {
      start: baselineStart.toISOString(),
      end: baselineEnd.toISOString(),
      sampleCount: baselineTelemetry.length,
      avgTemperature: baselineAvgTemp
    },
    outcomeSummary: {
      start: outcomeStart.toISOString(),
      end: outcomeEnd.toISOString(),
      sampleCount: outcomeTelemetry.length,
      avgTemperature: round1(meanAfter)
    },
    dataStatus: 'READY'
  }
}

async function getFeedbackCycle(actionLogId) {
  const actionLog = await prisma.actionLog.findUnique({
    where: { id: actionLogId },
    include: { zone: true }
  })

  if (!actionLog) {
    const err = new Error('ActionLog not found')
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const frontendZoneId = actionLog.zone.name === 'Zone A' ? 'A' : 'B'

  let computeResult
  if (actionLog.effectivenessScore !== null && actionLog.effectivenessScore !== undefined) {
    const executedAt = new Date(actionLog.executedAt)
    const baselineStart = new Date(executedAt.getTime() - 5 * 60 * 1000)
    const baselineEnd = executedAt
    const outcomeStart = new Date(executedAt.getTime() + 1)
    const outcomeEnd = new Date(executedAt.getTime() + 20 * 60 * 1000)

    const [baselineTelemetry, outcomeTelemetry] = await Promise.all([
      prisma.zoneTelemetry.findMany({
        where: {
          zoneId: actionLog.zoneId,
          timestamp: { gte: baselineStart, lt: baselineEnd },
          temperature: { not: null }
        },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true, temperature: true }
      }),
      prisma.zoneTelemetry.findMany({
        where: {
          zoneId: actionLog.zoneId,
          timestamp: { gt: outcomeStart, lte: outcomeEnd },
          temperature: { not: null }
        },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true, temperature: true }
      })
    ])

    const meanBefore = baselineTelemetry.length > 0
      ? baselineTelemetry.reduce((a, b) => a + b.temperature, 0) / baselineTelemetry.length
      : null
    const meanAfter = outcomeTelemetry.length > 0
      ? outcomeTelemetry.reduce((a, b) => a + b.temperature, 0) / outcomeTelemetry.length
      : null

    const observedDelta = (meanBefore !== null && meanAfter !== null)
      ? round1(meanAfter - meanBefore)
      : null
    const expectedDelta = actionLog.expectedOutcome?.expectedDelta ?? estimateExpectedDelta(actionLog.deviceStates, { temperature: meanBefore })

    computeResult = {
      effectiveness: actionLog.effectivenessScore,
      observedDelta,
      expectedDelta,
      baselineSummary: {
        start: baselineStart.toISOString(),
        end: baselineEnd.toISOString(),
        sampleCount: baselineTelemetry.length,
        avgTemperature: meanBefore !== null ? round1(meanBefore) : null
      },
      outcomeSummary: {
        start: outcomeStart.toISOString(),
        end: outcomeEnd.toISOString(),
        sampleCount: outcomeTelemetry.length,
        avgTemperature: meanAfter !== null ? round1(meanAfter) : null
      },
      dataStatus: 'READY'
    }
  } else {
    computeResult = await computeEffectiveness(actionLogId)
  }

  const primaryDevice = actionLog.deviceStates?.[0] || { device: 'none', state: 'IDLE' }

  const predicted = computeResult.expectedDelta !== null
    ? formatDeltaText(computeResult.expectedDelta)
    : 'Insufficient data for prediction'

  const actual = computeResult.observedDelta !== null
    ? formatDeltaText(computeResult.observedDelta)
    : 'Insufficient data for measurement'

  const error = (computeResult.observedDelta !== null && computeResult.expectedDelta !== null)
    ? formatErrorText(computeResult.observedDelta, computeResult.expectedDelta)
    : 'Insufficient data'

  const policyDelta = buildPolicyDelta(computeResult.effectiveness, actionLog.deviceStates)

  return {
    action: {
      id: actionLog.id,
      ts: actionLog.executedAt.toISOString(),
      zoneId: frontendZoneId,
      label: actionLog.label,
      deviceStates: actionLog.deviceStates,
      source: actionLog.source,
      device: primaryDevice.device,
      state: primaryDevice.state
    },
    predicted,
    actual,
    error,
    effectiveness: computeResult.effectiveness,
    policyDelta,
    telemetryWindow: {
      before: computeResult.baselineSummary,
      after: computeResult.outcomeSummary
    },
    dataStatus: computeResult.dataStatus
  }
}

async function getFeedbackHistory(frontendZoneId, { limit = 20, offset = 0 }) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) {
    const err = new Error(`Invalid zone: ${frontendZoneId}`)
    err.code = 'INVALID_ZONE'
    err.status = 400
    throw err
  }

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    select: { id: true }
  })

  if (!zone) {
    return { data: [], total: 0, limit, offset }
  }

  const [logs, total] = await Promise.all([
    prisma.actionLog.findMany({
      where: { zoneId: zone.id },
      orderBy: { executedAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.actionLog.count({ where: { zoneId: zone.id } })
  ])

  return {
    data: logs.map(log => ({
      id: log.id,
      zoneId: frontendZoneId,
      label: log.label,
      deviceStates: log.deviceStates,
      executedAt: log.executedAt.toISOString(),
      source: log.source,
      effectivenessScore: log.effectivenessScore,
      status: log.status
    })),
    total,
    limit,
    offset
  }
}

module.exports = {
  computeEffectiveness,
  getFeedbackCycle,
  getFeedbackHistory,
  estimateExpectedDelta,
  buildPolicyDelta,
  formatDeltaText,
  formatErrorText
}