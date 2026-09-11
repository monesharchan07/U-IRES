import { apiClient } from '../api/client'

export async function applyAction({ zoneId, label, deviceStates, source = 'auto' }) {
  const res = await apiClient.post('/control/actions', { zoneId, label, deviceStates, source })
  const primary = deviceStates[0] || { device: 'none', state: 'IDLE' }
  if (res.record && !res.record.device) {
    res.record = {
      ...res.record,
      device: primary.device,
      state: primary.state,
    }
  }
  return res
}

export async function resumeAutomation(zoneId) {
  return apiClient.post(`/zones/${zoneId}/resume`)
}
