import { apiClient } from '../api/client'
import { computeSimulation } from '../mock/mockData'

const USE_MOCK_DATA = true

export async function runSimulation(inputs, currentState) {
  if (USE_MOCK_DATA) {
    await delay(650)
    return computeSimulation(inputs, currentState)
  }
  return apiClient.post('/intelligence/simulate', { inputs })
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
