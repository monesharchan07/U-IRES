import { apiClient } from '../api/client'
import { getOptimizerCandidates, pickRecommendation } from '../mock/mockData'

const USE_MOCK_DATA = true

export async function fetchCandidates(zones, zoneId) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 350))
    return getOptimizerCandidates(zones, zoneId)
  }
  return apiClient.get(`/intelligence/optimizer/candidates?zone=${zoneId}`)
}

export function recommend(candidates) {
  return pickRecommendation(candidates)
}
