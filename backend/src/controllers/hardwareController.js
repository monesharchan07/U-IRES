'use strict'

const hardwareBridge = require('../services/hardwareBridge')
const { validateAckPayload } = require('../middleware/deviceAuth')

async function getNextCommand(req, res, next) {
  try {
    const zone = req.validated?.zone || req.query.zone
    const device = req.device

    if (!zone || !['A', 'B'].includes(zone)) {
      const err = new Error('Invalid or missing zone parameter')
      err.code = 'VALIDATION_ERROR'
      err.status = 400
      err.details = { zone: ['Must be A or B'] }
      return next(err)
    }

    if (!device) {
      const err = new Error('Device not authenticated')
      err.code = 'UNAUTHENTICATED'
      err.status = 401
      return next(err)
    }

    const result = await hardwareBridge.getNextCommand(zone, device.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function acknowledgeCommand(req, res, next) {
  try {
    const payload = req.body
    const device = req.device

    const validation = validateAckPayload(payload)
    if (!validation.valid) {
      const err = new Error(validation.error)
      err.code = 'VALIDATION_ERROR'
      err.status = 400
      return next(err)
    }

    const result = await hardwareBridge.handleAck(payload, device.zoneId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function triggerReconciliation(req, res, next) {
  try {
    const count = await hardwareBridge.reconcileStaleSentActions()
    res.json({ success: true, reconciled: count })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getNextCommand,
  acknowledgeCommand,
  triggerReconciliation
}