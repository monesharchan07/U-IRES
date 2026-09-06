'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('../services/zoneService')

const METRIC_MAP = {
  temperature: 'temperature',
  humidity: 'humidity',
  occupancy: 'occupancy',
  power: 'estimatedPower',
  network: 'networkHealth'
}

const RANGE_HOURS = {
  '1H': 1,
  '6H': 6,
  '12H': 12,
  '24H': 24,
  '7D': 168,
  '30D': 720
}

function formatLabel(timestamp, range) {
  const date = new Date(timestamp)
  if (range === '7D' || range === '30D') {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function getLatestTelemetry(req, res, next) {
  try {
    const { zoneId } = req.validated
    const zoneName = ZONE_NAME_MAP[zoneId]

    const zone = await prisma.zone.findUnique({
      where: { name: zoneName },
      select: { id: true }
    })

    if (!zone) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }

    const telemetry = await prisma.zoneTelemetry.findFirst({
      where: { zoneId: zone.id },
      orderBy: { timestamp: 'desc' }
    })

    if (!telemetry) {
      const err = new Error(`No telemetry data found for Zone ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }

    res.json({
      zoneId,
      timestamp: telemetry.timestamp.toISOString(),
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      occupancy: telemetry.occupancy,
      networkHealth: telemetry.networkHealth,
      estimatedPower: telemetry.estimatedPower
    })
  } catch (err) {
    next(err)
  }
}

async function getTelemetryHistory(req, res, next) {
  try {
    const { zoneId } = req.validated
    const { metric, range, anchorValue } = req.validated
    const zoneName = ZONE_NAME_MAP[zoneId]

    const zone = await prisma.zone.findUnique({
      where: { name: zoneName },
      select: { id: true }
    })

    if (!zone) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }

    const hours = RANGE_HOURS[range]
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const field = METRIC_MAP[metric]
    const telemetry = await prisma.zoneTelemetry.findMany({
      where: {
        zoneId: zone.id,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'asc' },
      select: {
        timestamp: true,
        [field]: true
      }
    })

    if (telemetry.length === 0) {
      return res.json([])
    }

    const points = telemetry.map(t => ({
      t: t.timestamp.getTime(),
      label: formatLabel(t.timestamp, range),
      value: t[field]
    }))

    if (anchorValue !== undefined && anchorValue !== null && !Number.isNaN(anchorValue) && points.length > 0) {
      points[points.length - 1].value = anchorValue
    }

    res.json(points)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getLatestTelemetry,
  getTelemetryHistory
}