'use strict'

const clientManager = require('./clientManager')
const eventBuffer = require('./eventBuffer')

function formatSSE(eventName, data, eventId) {
  let message = ''
  if (eventId !== undefined && eventId !== null) {
    message += `id: ${eventId}\n`
  }
  message += `event: ${eventName}\n`
  message += `data: ${JSON.stringify(data)}\n\n`
  return message
}

function publish(eventName, data, eventId) {
  const zoneId = data?.zoneId
  const isGlobalEvent = !zoneId

  let targetZones = []
  if (isGlobalEvent) {
    targetZones = clientManager.getAllZones()
    if (targetZones.length === 0) {
      return 0
    }
  } else {
    const normalizedZone = zoneId.toUpperCase()
    if (normalizedZone !== 'A' && normalizedZone !== 'B') {
      console.warn(`[SSE] Invalid zoneId in event: ${zoneId}`)
      return 0
    }
    targetZones = [normalizedZone]
  }

  const message = formatSSE(eventName, data, eventId)
  let sentCount = 0

  for (const normalizedZone of targetZones) {
    const clients = clientManager.getClientsForZone(normalizedZone)
    if (clients.size === 0) {
      continue
    }

    for (const res of clients) {
      try {
        res.write(message)
        sentCount++
      } catch (err) {
        console.warn(`[SSE] Write failed for zone ${normalizedZone}:`, err.message)
        clientManager.removeClient(res)
      }
    }

    if (clients.size > 0) {
      eventBuffer.push(normalizedZone, { id: eventId, eventName, data, timestamp: Date.now() })
    }
  }

  return sentCount
}

function replay(zoneId, lastEventId, res) {
  const normalizedZone = zoneId.toUpperCase()
  if (normalizedZone !== 'A' && normalizedZone !== 'B') {
    return 0
  }

  const events = eventBuffer.getSince(normalizedZone, lastEventId)
  let sentCount = 0

  for (const event of events) {
    const message = formatSSE(event.eventName, event.data, event.id)
    try {
      res.write(message)
      sentCount++
    } catch (err) {
      console.warn(`[SSE] Replay write failed for zone ${normalizedZone}:`, err.message)
      break
    }
  }

  return sentCount
}

function getStats() {
  return {
    clients: clientManager.getClientCount(),
    zones: clientManager.getAllZones(),
    bufferSizes: {
      A: eventBuffer.getLatest('A') ? eventBuffer.MAX_EVENTS_PER_ZONE : 0,
      B: eventBuffer.getLatest('B') ? eventBuffer.MAX_EVENTS_PER_ZONE : 0
    }
  }
}

function closeAll() {
  clientManager.closeAllClients()
  eventBuffer.clear()
}

module.exports = {
  publish,
  replay,
  formatSSE,
  getStats,
  closeAll,
  clientManager,
  eventBuffer,
  publishActionStatus,
  publishActuatorUpdate
}

function publishActionStatus(actionId, zoneId, status, previousStatus, executedAt, error) {
  return publish('action.status', {
    actionId,
    zoneId,
    status,
    previousStatus,
    executedAt,
    error
  }, actionId)
}

function publishActuatorUpdate(zoneId, device, state, source = 'hardware') {
  return publish('actuator.updated', {
    zoneId,
    device,
    state,
    updatedAt: new Date().toISOString(),
    source
  }, `actuator-${zoneId}-${device}`)
}