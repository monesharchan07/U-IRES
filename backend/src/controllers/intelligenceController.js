'use strict'

const telemetryHistoryService = require('../services/telemetryHistoryService')
const predictionService = require('../services/predictionService')
const optimizerService = require('../services/optimizerService')
const { validate } = require('../middleware/validate')
const { z } = require('zod')

const metricKeySchema = z.enum(['temperature', 'humidity', 'occupancy', 'power', 'network'])
const horizonSchema = z.coerce.number().int().min(1).max(24).default(6)
const stepSchema = z.coerce.number().int().min(1).max(6).default(1)

const predictQuerySchema = z.object({
  zone: z.enum(['A', 'B']),
  metric: metricKeySchema,
  horizon: horizonSchema,
  step: stepSchema
})

const predictAllQuerySchema = z.object({
  zone: z.enum(['A', 'B']),
  horizon: horizonSchema,
  step: stepSchema
})

const optimizerQuerySchema = z.object({
  zone: z.enum(['A', 'B'])
})

function formatLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const METRIC_CFG = {
  temperature: { key: 'temperature', label: 'Temperature', short: 'TEMP', unit: '\u00B0C', digits: 1, icon: 'thermo' },
  humidity: { key: 'humidity', label: 'Humidity', short: 'HUM', unit: '%', digits: 0, icon: 'drop' },
  occupancy: { key: 'occupancy', label: 'Occupancy', short: 'OCC', unit: 'people', digits: 0, icon: 'users' },
  power: { key: 'power', label: 'Estimated Power', short: 'PWR', unit: 'W', digits: 0, icon: 'zap' },
  network: { key: 'network', label: 'Network Health', short: 'NET', unit: '%', digits: 0, icon: 'wifi' }
}

async function getModels(req, res, next) {
  try {
    res.json([
      {
        id: 'linear_trend_seasonal',
        name: 'Linear Trend + Seasonal Baseline',
        note: 'Deterministic baseline forecast using recent telemetry trend and hourly seasonal adjustment.'
      }
    ])
  } catch (err) {
    next(err)
  }
}

async function getPrediction(req, res, next) {
  try {
    const { zone, metric, horizon, step } = req.validated

    const history = await telemetryHistoryService.fetchHistoryForPrediction(zone, metric, 24)

    const result = predictionService.forecastMetric(history, metric, horizon, step)

    const combinedData = [
      ...result.historical,
      result.bridge,
      ...result.forecast
    ]

    res.json({
      metricKey: metric,
      cfg: METRIC_CFG[metric],
      data: combinedData,
      current: result.current,
      forecastNext: result.forecastNext,
      confidence: result.confidence,
      modelMeta: result.modelMeta
    })
  } catch (err) {
    if (err.code === 'INSUFFICIENT_DATA') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      })
    }
    next(err)
  }
}

async function getAllPredictions(req, res, next) {
  try {
    const { zone, horizon, step } = req.validated
    const metrics = ['temperature', 'humidity', 'occupancy', 'power', 'network']

    const results = {}

    for (const metric of metrics) {
      try {
        const history = await telemetryHistoryService.fetchHistoryForPrediction(zone, metric, 24)
        const result = predictionService.forecastMetric(history, metric, horizon, step)

        const combinedData = [
          ...result.historical,
          result.bridge,
          ...result.forecast
        ]

        results[metric] = {
          metricKey: metric,
          cfg: METRIC_CFG[metric],
          data: combinedData,
          current: result.current,
          forecastNext: result.forecastNext,
          confidence: result.confidence,
          modelMeta: result.modelMeta
        }
      } catch (metricErr) {
        if (metricErr.code === 'INSUFFICIENT_DATA') {
          results[metric] = {
            metricKey: metric,
            cfg: METRIC_CFG[metric],
            data: [],
            current: null,
            forecastNext: null,
            confidence: 0,
            modelMeta: {
              type: 'linear_trend_seasonal',
              n: metricErr.details?.pointsAvailable ?? 0,
              slope: 0,
              r2: 0
            },
            error: {
              code: metricErr.code,
              message: metricErr.message,
              details: metricErr.details
            }
          }
        } else {
          throw metricErr
        }
      }
    }

    res.json(results)
  } catch (err) {
    next(err)
  }
}

async function getOptimizerCandidates(req, res, next) {
  try {
    const { zone } = req.validated

    const currentState = await telemetryHistoryService.fetchLatestZoneState(zone)

    let predictions = null
    try {
      predictions = await telemetryHistoryService.tryFetchPredictions(zone, 6)
    } catch (predErr) {
      console.warn('[Optimizer] Prediction fetch failed, continuing without:', predErr.message)
    }

    const result = optimizerService.generateOptimizerResult(zone, currentState, predictions)

    res.json(result)
  } catch (err) {
    if (err.code === 'INSUFFICIENT_DATA') {
      return res.status(422).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      })
    }
    if (err.code === 'INVALID_ZONE' || err.code === 'NOT_FOUND') {
      return res.status(err.status || 400).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      })
    }
    next(err)
  }
}

module.exports = {
  getModels,
  getPrediction,
  getAllPredictions,
  getOptimizerCandidates,
  validatePredictQuery: validate(predictQuerySchema, 'query'),
  validatePredictAllQuery: validate(predictAllQuerySchema, 'query'),
  validateOptimizerQuery: validate(optimizerQuerySchema, 'query')
}