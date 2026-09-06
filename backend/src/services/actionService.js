'use strict'

const { prisma } = require('../lib/prisma')
const { ZONE_NAME_MAP } = require('./zoneService')

async function createAction({ zoneId, label, deviceStates, source }) {
  const zoneName = ZONE_NAME_MAP[zoneId]
  const zone = await prisma.zone.findUnique({
    where: { name: zoneName }
  })

  if (!zone) {
    const err = new Error(`Zone not found: ${zoneId}`)
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const actionLog = await prisma.actionLog.create({
    data: {
      zoneId: zone.id,
      source,
      label,
      deviceStates,
      executedAt: new Date(),
      status: 'PENDING'
    }
  })

  return {
    id: actionLog.id,
    ts: actionLog.executedAt.toISOString(),
    zoneId,
    label: actionLog.label,
    deviceStates: actionLog.deviceStates,
    source: actionLog.source,
    status: actionLog.status
  }
}

async function getActionHistory(frontendZoneId, { limit = 50, offset = 0, status }) {
  const zoneName = ZONE_NAME_MAP[frontendZoneId]
  const zone = await prisma.zone.findUnique({
    where: { name: zoneName }
  })

  if (!zone) {
    return { data: [], total: 0, limit, offset }
  }

  const where = { zoneId: zone.id }
  if (status) {
    where.status = status
  }

  const [logs, total] = await Promise.all([
    prisma.actionLog.findMany({
      where,
      orderBy: { executedAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.actionLog.count({ where })
  ])

  return {
    data: logs.map(log => ({
      id: log.id,
      zoneId: frontendZoneId,
      label: log.label,
      deviceStates: log.deviceStates,
      executedAt: log.executedAt.toISOString(),
      status: log.status,
      source: log.source
    })),
    total,
    limit,
    offset
  }
}

module.exports = {
  createAction,
  getActionHistory
}