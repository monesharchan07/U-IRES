'use strict'

const MAX_EVENTS_PER_ZONE = 50

const buffers = {
  A: [],
  B: []
}

function push(zoneId, event) {
  const normalizedZone = zoneId.toUpperCase()
  if (!buffers[normalizedZone]) {
    buffers[normalizedZone] = []
  }
  buffers[normalizedZone].push(event)
  if (buffers[normalizedZone].length > MAX_EVENTS_PER_ZONE) {
    buffers[normalizedZone].shift()
  }
}

function getSince(zoneId, lastEventId) {
  const normalizedZone = zoneId.toUpperCase()
  const zoneBuffer = buffers[normalizedZone] || []
  if (!lastEventId) {
    return zoneBuffer
  }
  const index = zoneBuffer.findIndex(e => e.id === lastEventId)
  if (index === -1) {
    return zoneBuffer
  }
  return zoneBuffer.slice(index + 1)
}

function getLatest(zoneId) {
  const normalizedZone = zoneId.toUpperCase()
  const zoneBuffer = buffers[normalizedZone] || []
  return zoneBuffer[zoneBuffer.length - 1] || null
}

function clear() {
  buffers.A = []
  buffers.B = []
}

module.exports = {
  push,
  getSince,
  getLatest,
  clear,
  MAX_EVENTS_PER_ZONE
}