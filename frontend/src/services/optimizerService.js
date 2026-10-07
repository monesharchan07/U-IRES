import { apiClient } from '../api/client'

export async function fetchCandidates(zones, zoneId) {
  const response = await apiClient.get(`/intelligence/optimizer/candidates?zone=${zoneId}`)
  return response.candidates.map(c => ({
    id: c.id,
    label: c.label,
    deviceStates: c.deviceStates,
    score: c.score,
    impacts: c.impacts,
    viable: c.viable,
    reason: c.reason
  }))
}

export function recommend(candidates) {
  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  return sorted[0]
}
