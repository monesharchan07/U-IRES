import { apiClient } from '../api/client'

export async function fetchFeedbackCycle(actionId) {
  return apiClient.get(`/intelligence/feedback/${actionId}`)
}

export async function fetchFeedbackHistory({ zoneId, limit = 20, offset = 0 }) {
  return apiClient.get(`/intelligence/feedback/history?zone=${zoneId}&limit=${limit}&offset=${offset}`)
}

export async function computeFeedback(actionId) {
  return apiClient.post(`/intelligence/feedback/${actionId}/compute`)
}