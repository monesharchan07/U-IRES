'use strict'

const { prisma } = require('../lib/prisma')

const ZONE_NAME_MAP = {
  A: 'Zone A',
  B: 'Zone B'
}

const REVERSE_ZONE_MAP = {
  'Zone A': 'A',
  'Zone B': 'B'
}

function mapZoneToFrontend(zone, telemetry, actuators, devices) {
  const zoneId = REVERSE_ZONE_MAP[zone.name]
  const latestTelemetry = telemetry
  const actuatorState = actuators || { fan: { state: 'OFF', updatedAt: null }, light: { state: 'OFF', updatedAt: null } }
  const hasOnlineSensor = devices?.some(d => d.deviceType === 'SENSOR_NODE' && d.status === 'ONLINE')

  const occupancy = latestTelemetry?.occupancy ?? 0
  const networkHealth = latestTelemetry?.networkHealth ?? 0

  return {
    id: zoneId,
    name: zone.name,
    location: zone.location,
    capacity: zone.capacity,
    controlMode: zone.controlMode,
    mapX: zone.mapX,
    mapY: zone.mapY,
    temperature: latestTelemetry?.temperature ?? null,
    humidity: latestTelemetry?.humidity ?? null,
    occupancy,
    occupancyLevel: occupancy >= 5 ? 'High' : 'Low',
    networkHealth,
    network: networkHealth >= 80 ? 'Good' : networkHealth >= 50 ? 'Fair' : 'Weak',
    estimatedPower: latestTelemetry?.estimatedPower ?? null,
    actuator: {
      fan: actuatorState.fan?.state ?? 'OFF',
      light: actuatorState.light?.state ?? 'OFF'
    },
    mode: zone.controlMode,
    connection: hasOnlineSensor ? 'online' : 'offline',
    lastUpdate: latestTelemetry?.timestamp?.toISOString() ?? zone.updatedAt.toISOString()
  }
}

async function getZoneByFrontendId(frontendZoneId) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) return null

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    include: {
      telemetry: {
        orderBy: { timestamp: 'desc' },
        take: 1
      },
      actuatorStates: true,
      devices: true
    }
  })

  if (!zone) return null

  const latestTelemetry = zone.telemetry[0] || null
  const actuators = {}
  for (const a of zone.actuatorStates) {
    actuators[a.device] = { state: a.state, updatedAt: a.updatedAt }
  }

  return mapZoneToFrontend(zone, latestTelemetry, actuators, zone.devices)
}

async function getAllZones() {
  const zones = await prisma.zone.findMany({
    include: {
      telemetry: {
        orderBy: { timestamp: 'desc' },
        take: 1
      },
      actuatorStates: true,
      devices: true
    },
    orderBy: { name: 'asc' }
  })

  return zones.map(z => {
    const latestTelemetry = z.telemetry[0] || null
    const actuators = {}
    for (const a of z.actuatorStates) {
      actuators[a.device] = { state: a.state, updatedAt: a.updatedAt }
    }
    return mapZoneToFrontend(z, latestTelemetry, actuators, z.devices)
  })
}

async function getZoneDevices(frontendZoneId) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) return null

  const zone = await prisma.zone.findUnique({
    where: { name: zoneName },
    select: { id: true }
  })

  if (!zone) return null

  const devices = await prisma.device.findMany({
    where: { zoneId: zone.id },
    select: {
      id: true,
      deviceType: true,
      status: true,
      lastPingAt: true
    },
    orderBy: { createdAt: 'asc' }
  })

  return devices.map(d => ({
    id: d.id,
    zoneId: frontendZoneId,
    deviceType: d.deviceType,
    status: d.status,
    lastPingAt: d.lastPingAt?.toISOString() ?? null
  }))
}

async function setZoneControlMode(frontendZoneId, mode) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  if (!zoneName) return null

  const zone = await prisma.zone.update({
    where: { name: zoneName },
    data: { controlMode: mode }
  })

  return zone
}

module.exports = {
  getAllZones,
  getZoneByFrontendId,
  getZoneDevices,
  setZoneControlMode,
  ZONE_NAME_MAP,
  REVERSE_ZONE_MAP
}