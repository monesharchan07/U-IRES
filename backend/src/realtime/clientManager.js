'use strict'

const clients = new Map()
const heartbeats = new Map()

function normalizeZoneList(zoneParam) {
  if (!zoneParam) return ['A', 'B']
  const zones = zoneParam.split(',').map(z => z.trim().toUpperCase()).filter(z => z === 'A' || z === 'B')
  return zones.length > 0 ? zones : ['A', 'B']
}

function addClient(zoneParam, res) {
  const zones = normalizeZoneList(zoneParam)
  for (const zone of zones) {
    if (!clients.has(zone)) {
      clients.set(zone, new Set())
    }
    clients.get(zone).add(res)
  }

  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': ping\n\n')
    } catch (err) {
      removeClient(res)
    }
  }, 30000)

  heartbeats.set(res, heartbeatInterval)

  res.write(': connected - U-IRES real-time stream\n\n')
  res.write('retry: 3000\n\n')

  console.log(`[SSE] Client connected: zones=${zones.join(',')}, total clients=${getClientCount()}`)
}

function removeClient(res) {
  const heartbeatInterval = heartbeats.get(res)
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeats.delete(res)
  }

  for (const [, zoneClients] of clients) {
    if (zoneClients.has(res)) {
      zoneClients.delete(res)
    }
  }
}

function getClientsForZone(zoneId) {
  return clients.get(zoneId) || new Set()
}

function getAllZones() {
  return Array.from(clients.keys())
}

function getClientCount() {
  let count = 0
  for (const [, zoneClients] of clients) {
    count += zoneClients.size
  }
  return count
}

function closeAllClients() {
  for (const [, zoneClients] of clients) {
    for (const res of zoneClients) {
      try {
        res.end()
      } catch (err) {
        // ignore
      }
    }
  }
  clients.clear()

  for (const [, interval] of heartbeats) {
    clearInterval(interval)
  }
  heartbeats.clear()

  console.log('[SSE] All connections closed')
}

module.exports = {
  addClient,
  removeClient,
  getClientsForZone,
  getAllZones,
  getClientCount,
  closeAllClients,
  normalizeZoneList
}