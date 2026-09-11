import { apiClient } from '../api/client'
import {
  getLiveBufferSeed,
  METRIC_KEYS,
  ZONES,
} from '../mock/mockData'

export async function fetchZones() {
  const zones = await apiClient.get('/zones')
  return Object.fromEntries(zones.map((zone) => [zone.id, zone]))
}

export async function fetchMetricHistory({ zoneId, metricKey, rangeValue, anchorValue }) {
  const params = new URLSearchParams({ metric: metricKey, range: rangeValue })
  if (anchorValue !== undefined && anchorValue !== null) {
    params.set('anchorValue', String(anchorValue))
  }
  return apiClient.get(`/zones/${zoneId}/telemetry/history?${params.toString()}`)
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
