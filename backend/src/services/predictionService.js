'use strict'

const METRIC_CONFIG = {
  temperature: { digits: 1 },
  humidity: { digits: 0 },
  occupancy: { digits: 0 },
  power: { digits: 0 },
  network: { digits: 0 }
}

function roundToDigits(value, digits) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function linearRegression(x, y) {
  const n = x.length
  if (n < 2) {
    return { slope: 0, intercept: y[0] || 0, r2: 0, residuals: [] }
  }

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
  const sumX2 = x.reduce((a, b) => a + b * b, 0)
  const sumY2 = y.reduce((a, b) => a + b * b, 0)

  const denominator = n * sumX2 - sumX * sumX
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0, residuals: [] }
  }

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n

  const yMean = sumY / n
  let ssRes = 0
  let ssTot = 0
  const residuals = []

  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * x[i]
    const residual = y[i] - predicted
    residuals.push(residual)
    ssRes += residual * residual
    ssTot += (y[i] - yMean) ** 2
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)), residuals }
}

function computeHourlyBaseline(history) {
  const hourlySums = new Array(24).fill(0)
  const hourlyCounts = new Array(24).fill(0)

  for (const point of history) {
    const hour = new Date(point.t).getHours()
    hourlySums[hour] += point.value
    hourlyCounts[hour] += 1
  }

  const baseline = new Array(24).fill(0)
  for (let h = 0; h < 24; h++) {
    if (hourlyCounts[h] > 0) {
      baseline[h] = hourlySums[h] / hourlyCounts[h]
    }
  }

  const globalMean = history.reduce((a, p) => a + p.value, 0) / history.length
  for (let h = 0; h < 24; h++) {
    if (hourlyCounts[h] === 0) {
      baseline[h] = globalMean
    }
  }

  const overallMean = baseline.reduce((a, b) => a + b, 0) / 24
  for (let h = 0; h < 24; h++) {
    baseline[h] = baseline[h] - overallMean
  }

  return baseline
}

function forecastMetric(history, metricKey, horizonHours = 6, stepHours = 1) {
  const validHistory = history.filter(p => p.value !== null && p.value !== undefined && !Number.isNaN(p.value))

  if (validHistory.length < 3) {
    const err = new Error('Insufficient historical data for prediction')
    err.code = 'INSUFFICIENT_DATA'
    err.status = 400
    err.details = { pointsAvailable: validHistory.length, minimumRequired: 3 }
    throw err
  }

  const sortedHistory = [...validHistory].sort((a, b) => a.t - b.t)
  const digits = METRIC_CONFIG[metricKey]?.digits ?? 0

  const timeWindowHours = 24
  const cutoffTime = Date.now() - timeWindowHours * 3600000
  const recentHistory = sortedHistory.filter(p => p.t >= cutoffTime)

  const firstTimestamp = sortedHistory[0].t
  const lastTimestamp = sortedHistory[sortedHistory.length - 1].t
  const totalTimeSpanHours = (lastTimestamp - firstTimestamp) / 3600000

  const useHistory = recentHistory.length >= 3 ? recentHistory : sortedHistory.slice(-Math.min(500, sortedHistory.length))

  const n = useHistory.length
  const baseTime = useHistory[0].t
  const x = useHistory.map(p => (p.t - baseTime) / 3600000)
  const y = useHistory.map(p => p.value)

  const { slope, intercept, r2, residuals } = linearRegression(x, y)

  const seasonalBaseline = computeHourlyBaseline(sortedHistory)
  const hasSeasonalData = totalTimeSpanHours >= 24

  const lastIndex = n - 1
  const lastValue = y[lastIndex]
  const lastX = x[lastIndex]

  const forecast = []
  for (let h = 1; h <= horizonHours; h++) {
    const futureX = lastX + h
    const trendValue = intercept + slope * futureX

    const forecastTime = lastTimestamp + h * 3600000
    const hourOfDay = new Date(forecastTime).getHours()
    const seasonalAdj = hasSeasonalData ? seasonalBaseline[hourOfDay] : 0

    const pv = roundToDigits(trendValue + seasonalAdj, digits)

    const dataRatio = Math.min(1, totalTimeSpanHours / 24)
    const fitQuality = Math.max(0, r2)
    const horizonPenalty = h * 3
    const confidence = Math.round(Math.max(50, Math.min(95, 60 + fitQuality * 25 + dataRatio * 15 - horizonPenalty)))

    forecast.push({
      t: forecastTime,
      label: new Date(forecastTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      value: null,
      pv,
      confidence
    })
  }

  const historicalWithPv = useHistory.map(p => ({
    t: p.t,
    label: new Date(p.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    value: roundToDigits(p.value, digits),
    pv: roundToDigits(p.value, digits)
  }))

  const bridgePoint = {
    t: lastTimestamp,
    label: new Date(lastTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    value: roundToDigits(lastValue, digits),
    pv: roundToDigits(lastValue, digits)
  }

  const modelMeta = {
    type: 'linear_trend_seasonal',
    n,
    slope: roundToDigits(slope, 6),
    r2: roundToDigits(r2, 3)
  }

  const overallConfidence = forecast.length > 0 ? forecast[forecast.length - 1].confidence : 50

  return {
    historical: historicalWithPv,
    bridge: bridgePoint,
    forecast,
    current: roundToDigits(lastValue, digits),
    forecastNext: forecast.length > 0 ? forecast[forecast.length - 1].pv : roundToDigits(lastValue, digits),
    confidence: overallConfidence,
    modelMeta
  }
}

module.exports = {
  forecastMetric,
  linearRegression,
  computeHourlyBaseline,
  roundToDigits,
  METRIC_CONFIG
}