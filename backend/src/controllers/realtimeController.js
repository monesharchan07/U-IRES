'use strict'

const realtime = require('../realtime')
const { validateZoneId } = require('../middleware/validate')

function handleSSE(req, res) {
  const zones = req.validated?.zoneId || 'A,B'
  
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  console.log('[SSE] handleSSE called, registering client for zones:', zones)

  realtime.clientManager.addClient(zones, res)

  const lastEventId = req.headers['last-event-id']
  if (lastEventId) {
    for (const zone of zones.split(',').map(z => z.trim().toUpperCase()).filter(z => z === 'A' || z === 'B')) {
      realtime.replay(zone, lastEventId, res)
    }
  }

  req.on('close', () => {
    realtime.clientManager.removeClient(res)
    console.log('[SSE] Client disconnected')
  })
}

const validateSSEZone = (req, res, next) => {
  const zoneParam = req.query.zone
  if (!zoneParam) {
    req.validated = { zoneId: 'A,B' }
    return next()
  }

  const zones = zoneParam.split(',').map(z => z.trim().toUpperCase())
  const validZones = zones.filter(z => z === 'A' || z === 'B')

  if (validZones.length === 0 || validZones.length !== zones.length) {
    const err = new Error(`Invalid zone parameter: ${zoneParam}. Must be 'A', 'B', or 'A,B'`)
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    err.details = { zone: [`Must be 'A', 'B', or 'A,B'`] }
    return next(err)
  }

  req.validated = { zoneId: validZones.join(',') }
  next()
}

module.exports = {
  handleSSE,
  validateSSEZone
}