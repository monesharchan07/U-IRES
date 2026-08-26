import { apiClient } from '../api/client'
import {
  getInitialZones,
  getMetricHistory,
  getLiveBufferSeed,
  nextTick,
  METRIC_KEYS,
  ZONES,
} from '../mock/mockData'

const USE_MOCK_DATA = true

export async function fetchZones() {
  if (USE_MOCK_DATA) {
    return getInitialZones()
  }
  return apiClient.get('/campus/zones')
}

export function tickZone(zone) {
  if (USE_MOCK_DATA) {
    return nextTick(zone)
  }
  return apiClient.post(`/campus/zones/${zone.id}/tick`, zone)
}

export async function fetchMetricHistory({ zoneId, metricKey, rangeValue, anchorValue }) {
  if (USE_MOCK_DATA) {
    return getMetricHistory({ zoneId, metricKey, rangeValue, anchorValue })
  }
  return apiClient.get(`/campus/history?zone=${zoneId}&metric=${metricKey}&range=${rangeValue}`)
}

export function seedLiveBuffers(intervalSec = 5) {
  const buffers = {}
  for (const z of ZONES) {
    buffers[z.id] = {}
    for (const key of METRIC_KEYS) {
      buffers[z.id][key] = getLiveBufferSeed(key, z.id, 30, intervalSec)
    }
  }
  return buffers
}

export function appendLivePoint(buffersForZone, zonesState, now = Date.now()) {
  const next = {}
  for (const key of METRIC_KEYS) {
    const arr = buffersForZone[key] || []
    const d = new Date(now)
    const point = {
      t: now,
      label: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
      value: zonesState[key],
    }
    next[key] = [...arr.slice(-29), point]
  }
  return next
}

export function getResourceIndicators(zones) {
  const list = Object.values(zones)
  const avgOccupancy = list.reduce((a, z) => a + z.occupancy, 0) / list.length
  const avgTemp = list.reduce((a, z) => a + z.temperature, 0) / list.length
  const avgHum = list.reduce((a, z) => a + z.humidity, 0) / list.length
  const netHealth = list.reduce((a, z) => a + z.networkHealth, 0) / list.length
  const power = list.reduce((a, z) => a + z.estimatedPower, 0)
  const comfort = Math.max(0, 100 - Math.abs(avgTemp - 23.5) * 10 - Math.abs(avgHum - 55) * 1.6 - Math.max(0, avgOccupancy - 5) * 2.5)
  const efficiency = Math.round(Math.min(99, comfort * 0.55 + netHealth * 0.3 + Math.max(0, 100 - power * 1.8) * 0.15))
  return { avgOccupancy, avgTemp, avgHum, netHealth, power, efficiency: Math.max(35, efficiency) }
}
