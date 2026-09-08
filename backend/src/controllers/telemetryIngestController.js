'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('../services/zoneService')
const realtime = require('../realtime')

async function ingest(req, res, next) {
  try {
    const data = req.validated

    const zoneName = ZONE_NAME_MAP[data.zoneId]
    if (!zoneName) {
      const err = new Error(`Zone not found: ${data.zoneId}`)
      err.code = 'ZONE_NOT_FOUND'
      err.status = 404
      return next(err)
    }

    const zone = await prisma.zone.findUnique({
      where: { name: zoneName },
      select: { id: true }
    })

    if (!zone) {
      const err = new Error(`Zone not found: ${data.zoneId}`)
      err.code = 'ZONE_NOT_FOUND'
      err.status = 404
      return next(err)
    }

    const device = await prisma.device.findUnique({
      where: { id: data.deviceId },
      select: { id: true, zoneId: true, deviceType: true, status: true }
    })

    if (!device) {
      const err = new Error(`Device not found: ${data.deviceId}`)
      err.code = 'DEVICE_NOT_FOUND'
      err.status = 404
      return next(err)
    }

    if (device.deviceType !== 'SENSOR_NODE') {
      const err = new Error(`Device ${data.deviceId} is not a sensor node`)
      err.code = 'DEVICE_WRONG_TYPE'
      err.status = 400
      return next(err)
    }

    if (device.zoneId !== zone.id) {
      const err = new Error(`Device ${data.deviceId} does not belong to zone ${data.zoneId}`)
      err.code = 'DEVICE_MISMATCH'
      err.status = 400
      return next(err)
    }

    if (device.status !== 'ONLINE') {
      const err = new Error(`Device ${data.deviceId} is ${device.status}`)
      err.code = 'DEVICE_OFFLINE'
      err.status = 403
      return next(err)
    }

    let timestamp
    if (data.timestamp) {
      const parsed = new Date(data.timestamp)
      if (Number.isNaN(parsed.getTime())) {
        const err = new Error('Invalid timestamp format')
        err.code = 'VALIDATION_ERROR'
        err.status = 400
        err.details = { fieldErrors: { timestamp: ['Invalid ISO 8601 datetime'] } }
        return next(err)
      }

      const now = new Date()
      const fiveMinutes = 5 * 60 * 1000
      if (parsed.getTime() > now.getTime() + fiveMinutes) {
        const err = new Error('Timestamp cannot be more than 5 minutes in the future')
        err.code = 'TIMESTAMP_OUT_OF_RANGE'
        err.status = 400
        return next(err)
      }

      timestamp = parsed
    } else {
      timestamp = new Date()
    }

    const receivedAt = new Date()

    const [telemetry] = await prisma.$transaction([
      prisma.zoneTelemetry.create({
        data: {
          zoneId: zone.id,
          timestamp,
          temperature: data.temperature ?? null,
          humidity: data.humidity ?? null,
          occupancy: data.occupancy ?? null,
          networkHealth: data.networkHealth ?? null,
          estimatedPower: null
        }
      }),
      prisma.device.update({
        where: { id: data.deviceId },
        data: { lastPingAt: receivedAt }
      })
    ])

    try {
      realtime.publish('telemetry.updated', {
        zoneId: data.zoneId,
        deviceId: data.deviceId,
        telemetryId: telemetry.id,
        timestamp: telemetry.timestamp.toISOString(),
        temperature: telemetry.temperature,
        humidity: telemetry.humidity,
        occupancy: telemetry.occupancy,
        networkHealth: telemetry.networkHealth,
        estimatedPower: telemetry.estimatedPower
      }, telemetry.id)
    } catch (err) {
      console.warn('[SSE] Failed to publish telemetry.updated:', err.message)
    }

    res.status(201).json({
      success: true,
      telemetryId: telemetry.id,
      zoneId: data.zoneId,
      deviceId: data.deviceId,
      timestamp: telemetry.timestamp.toISOString(),
      receivedAt: receivedAt.toISOString()
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  ingest
}