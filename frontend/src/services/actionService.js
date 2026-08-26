import { apiClient } from '../api/client'

const USE_MOCK_DATA = true

let actionSeq = 0

export async function applyAction({ zoneId, label, deviceStates, source = 'auto' }) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 900))
    actionSeq += 1
    const primary = deviceStates[0] || { device: 'none', state: 'IDLE' }
    return {
      success: true,
      record: {
        id: `act-${Date.now()}-${actionSeq}`,
        ts: new Date().toISOString(),
        zoneId,
        label,
        device: primary.device,
        state: primary.state,
        deviceStates,
        source,
      },
      message: `${label} — applied to Zone ${zoneId}`,
    }
  }
  return apiClient.post('/control/actions', { zoneId, label, deviceStates, source })
}

export async function resumeAutomation(zoneId) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 400))
    return { success: true, message: `Automation resumed for Zone ${zoneId}` }
  }
  return apiClient.post(`/control/zones/${zoneId}/resume`)
}
