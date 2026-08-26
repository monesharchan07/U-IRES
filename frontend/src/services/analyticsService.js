import { apiClient } from '../api/client'
import { getAnalyticsSummary } from '../mock/mockData'

const USE_MOCK_DATA = true

export async function fetchAnalytics() {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300))
    return getAnalyticsSummary()
  }
  return apiClient.get('/analytics/summary')
}
