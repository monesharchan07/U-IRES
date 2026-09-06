'use strict'

const actionService = require('../services/actionService')

async function createAction(req, res, next) {
  try {
    const { zoneId, label, deviceStates, source } = req.validated
    const record = await actionService.createAction({ zoneId, label, deviceStates, source })
    res.status(201).json({
      success: true,
      record,
      message: `${label} — action queued for Zone ${zoneId}`
    })
  } catch (err) {
    next(err)
  }
}

async function getActionHistory(req, res, next) {
  try {
    const { zoneId } = req.validated
    const { limit, offset, status } = req.validated
    const result = await actionService.getActionHistory(zoneId, { limit, offset, status })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createAction,
  getActionHistory
}