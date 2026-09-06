'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('../services/zoneService')

async function getActuators(req, res, next) {
  try {
    const { zoneId } = req.validated
    const zoneName = ZONE_NAME_MAP[zoneId]

    const zone = await prisma.zone.findUnique({
      where: { name: zoneName },
      select: { id: true }
    })

    if (!zone) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }

    const actuatorStates = await prisma.actuatorState.findMany({
      where: { zoneId: zone.id }
    })

    const actuators = {
      fan: { state: 'OFF', updatedAt: null },
      light: { state: 'OFF', updatedAt: null }
    }

    for (const a of actuatorStates) {
      if (a.device === 'fan' || a.device === 'light') {
        actuators[a.device] = {
          state: a.state.state,
          updatedAt: a.updatedAt.toISOString()
        }
      }
    }

    res.json({
      zoneId,
      fan: actuators.fan,
      light: actuators.light
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getActuators
}