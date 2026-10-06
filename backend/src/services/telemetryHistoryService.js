'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('./zoneService')

const METRIC_MAP = {
  temperature: 'temperature',
  humidity: 'humidity',
  occupancy: 'occupancy',
  power: 'estimatedPower',
  network: 'networkHealth'
}

async function fetchHistoryForPrediction(frontendZoneId, metricKey, hours = 24) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) {
    const err = new Error(`Invalid zone: ${frontendZoneId}`)
    err.code = 'INVALID_ZONE'
    err.status = 400
    throw err
  }

  if (!METRIC_MAP[metricKey]) {
    const err = new Error(`Invalid metric: ${metricKey}`)
    err.code = 'INVALID_METRIC'
    err.status = 400
    throw err
  }

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    select: { id: true }
  })

  if (!zone) {
    const err = new Error(`Zone not found: ${frontendZoneId}`)
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const field = METRIC_MAP[metricKey]

  const telemetry = await prisma.zoneTelemetry.findMany({
    where: {
      zoneId: zone.id,
      timestamp: { gte: since },
      [field]: { not: null }
    },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      [field]: true
    }
  })

  return telemetry.map(t => ({
    t: t.timestamp.getTime(),
    value: t[field]
  }))
}

module.exports = {
  fetchHistoryForPrediction,
  METRIC_MAP
}