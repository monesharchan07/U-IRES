import { apiClient } from '../api/client'
import { PREDICTION_MODELS, METRICS, METRIC_KEYS, getPredictionForMetric } from '../mock/mockData'

const USE_MOCK_DATA = true

export async function fetchModelComparison() {
  if (USE_MOCK_DATA) {
    return PREDICTION_MODELS
  }
  return apiClient.get('/intelligence/models')
}

export async function fetchPrediction({ zoneId, metricKey, currentValues }) {
  if (USE_MOCK_DATA) {
    return getPredictionForMetric(zoneId, metricKey, currentValues)
  }
  return apiClient.get(`/intelligence/predict?zone=${zoneId}&metric=${metricKey}`)
}

export async function fetchAllPredictions({ zoneId, currentValuesByMetric }) {
  if (USE_MOCK_DATA) {
    const out = {}
    for (const key of METRIC_KEYS) {
      out[key] = {
        ...getPredictionForMetric(zoneId, key, currentValuesByMetric?.[key]),
        cfg: METRICS[key],
      }
    }
    return out
  }
  return apiClient.get(`/intelligence/predict-all?zone=${zoneId}`)
}
