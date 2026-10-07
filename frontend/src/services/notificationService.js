import { apiClient } from '../api/client'

export async function fetchNotifications({ limit = 20, offset = 0, read = 'all' } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    read
  })
  const response = await apiClient.get(`/notifications?${params.toString()}`)
  return response
}

export async function markNotificationRead(notificationId, read) {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`, { read })
  return response
}