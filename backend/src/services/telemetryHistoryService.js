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

async function fetchLatestZoneState(frontendZoneId) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) {
    const err = new Error(`Invalid zone: ${frontendZoneId}`)
    err.code = 'INVALID_ZONE'
    err.status = 400
    throw err
  }

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    select: { id: true, capacity: true }
  })

  if (!zone) {
    const err = new Error(`Zone not found: ${frontendZoneId}`)
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const latestTelemetry = await prisma.zoneTelemetry.findFirst({
    where: { zoneId: zone.id },
    orderBy: { timestamp: 'desc' }
  })

  if (!latestTelemetry) {
    const err = new Error(`No telemetry data available for zone ${frontendZoneId}`)
    err.code = 'INSUFFICIENT_DATA'
    err.status = 422
    err.details = { zoneId: frontendZoneId, message: 'No telemetry records found' }
    throw err
  }

  const actuatorStates = await prisma.actuatorState.findMany({
    where: { zoneId: zone.id }
  })

  const fanState = actuatorStates.find(a => a.device === 'fan')?.state?.state || 'OFF'
  const lightState = actuatorStates.find(a => a.device === 'light')?.state?.state || 'OFF'

  return {
    zoneId: frontendZoneId,
    temperature: latestTelemetry.temperature ?? null,
    humidity: latestTelemetry.humidity ?? null,
    occupancy: latestTelemetry.occupancy ?? 0,
    networkHealth: latestTelemetry.networkHealth ?? 0,
    estimatedPower: latestTelemetry.estimatedPower ?? 0,
    fanState,
    lightState,
    capacity: zone.capacity,
    timestamp: latestTelemetry.timestamp.toISOString()
  }
}

async function tryFetchPredictions(frontendZoneId, horizonHours = 6) {
  try {
    const predictionService = require('./predictionService')
    const metrics = ['temperature', 'humidity', 'occupancy', 'power', 'network']
    const predictions = {}

    for (const metric of metrics) {
      try {
        const history = await fetchHistoryForPrediction(frontendZoneId, metric, 24)
        const result = predictionService.forecastMetric(history, metric, horizonHours, 1)
        predictions[metric] = {
          forecast: result.forecast.map(f => ({ t: f.t, pv: f.pv })),
          current: result.current,
          confidence: result.confidence
        }
      } catch (metricErr) {
        if (metricErr.code === 'INSUFFICIENT_DATA') {
          predictions[metric] = { error: 'INSUFFICIENT_DATA', pointsAvailable: metricErr.details?.pointsAvailable }
        } else {
          throw metricErr
        }
      }
    }

    return { horizonHours, metrics: predictions }
  } catch (err) {
    return { horizonHours, metrics: {}, error: err.message }
  }
}

module.exports = {
  fetchHistoryForPrediction,
  fetchLatestZoneState,
  tryFetchPredictions,
  METRIC_MAP
}