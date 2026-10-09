'use strict'

const { prisma } = require('../lib/prisma')

const VALID_DEVICE_TYPES = ['fan', 'light']
const VALID_STATES = ['ON', 'OFF']

async function validateDevice(req, res, next) {
  try {
    const deviceId = req.headers['x-device-id'] || req.body?.deviceId || req.query?.deviceId
    const requestedZone = req.query?.zone || req.body?.zoneId

    if (!deviceId) {
      const err = new Error('Device ID required')
      err.code = 'DEVICE_ID_REQUIRED'
      err.status = 400
      return next(err)
    }

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true, zoneId: true, deviceType: true, status: true }
    })

    if (!device) {
      const err = new Error('Device not found')
      err.code = 'DEVICE_NOT_FOUND'
      err.status = 404
      return next(err)
    }

    if (device.deviceType !== 'SENSOR_NODE') {
      const err = new Error('Device is not a sensor node')
      err.code = 'DEVICE_WRONG_TYPE'
      err.status = 400
      return next(err)
    }

    if (device.status !== 'ONLINE') {
      const err = new Error('Device is offline')
      err.code = 'DEVICE_OFFLINE'
      err.status = 403
      return next(err)
    }

    if (requestedZone) {
      const { ZONE_NAME_MAP } = require('../services/zoneService')
      const zoneName = ZONE_NAME_MAP[requestedZone]
      if (zoneName) {
        const zone = await prisma.zone.findUnique({
          where: { name: zoneName },
          select: { id: true }
        })
        if (zone && device.zoneId !== zone.id) {
          const err = new Error('Zone mismatch')
          err.code = 'ZONE_MISMATCH'
          err.status = 400
          return next(err)
        }
      }
    }

    req.device = device
    next()
  } catch (err) {
    next(err)
  }
}

function validateDeviceStates(deviceStates) {
  if (!Array.isArray(deviceStates) || deviceStates.length === 0) {
    return { valid: false, error: 'deviceStates must be a non-empty array' }
  }

  for (const ds of deviceStates) {
    if (!ds.device || !VALID_DEVICE_TYPES.includes(ds.device)) {
      return { valid: false, error: `Invalid device: ${ds.device}. Must be 'fan' or 'light'` }
    }
    if (!ds.state || !VALID_STATES.includes(ds.state)) {
      return { valid: false, error: `Invalid state: ${ds.state}. Must be 'ON' or 'OFF'` }
    }
    if (ds.applied !== undefined && typeof ds.applied !== 'boolean') {
      return { valid: false, error: 'applied must be a boolean' }
    }
  }

  return { valid: true }
}

function validateAckPayload(payload) {
  if (!payload.actionId || typeof payload.actionId !== 'string') {
    return { valid: false, error: 'actionId is required and must be a string' }
  }

  if (!payload.status || !['ACKNOWLEDGED', 'FAILED'].includes(payload.status)) {
    return { valid: false, error: "status must be 'ACKNOWLEDGED' or 'FAILED'" }
  }

  if (!payload.executedAt || typeof payload.executedAt !== 'string') {
    return { valid: false, error: 'executedAt is required and must be an ISO8601 string' }
  }

  const executedAt = new Date(payload.executedAt)
  if (isNaN(executedAt.getTime())) {
    return { valid: false, error: 'executedAt must be a valid ISO8601 timestamp' }
  }

  const now = new Date()
  const fiveMinutes = 5 * 60 * 1000
  if (executedAt > new Date(now.getTime() + fiveMinutes)) {
    return { valid: false, error: 'executedAt cannot be more than 5 minutes in the future' }
  }

  const deviceStatesValidation = validateDeviceStates(payload.deviceStates)
  if (!deviceStatesValidation.valid) {
    return deviceStatesValidation
  }

  if (payload.status === 'FAILED') {
    if (!payload.error || typeof payload.error !== 'string' || payload.error.trim().length === 0) {
      return { valid: false, error: 'error message is required when status is FAILED' }
    }
    if (payload.error.length > 500) {
      return { valid: false, error: 'error message must not exceed 500 characters' }
    }
  }

  return { valid: true }
}

module.exports = {
  validateDevice,
  validateDeviceStates,
  validateAckPayload,
  VALID_DEVICE_TYPES,
  VALID_STATES
}