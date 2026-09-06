'use strict'

const { prisma } = require('../lib/prisma')

async function getNotifications({ limit = 20, offset = 0, read = 'all' }) {
  const where = {}
  if (read === 'true') where.isRead = true
  if (read === 'false') where.isRead = false

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { isRead: false } })
  ])

  return {
    data: notifications.map(n => ({
      id: n.id,
      severity: n.severity,
      title: n.title,
      message: n.message,
      ts: n.createdAt.toISOString(),
      read: n.isRead
    })),
    total,
    unreadCount
  }
}

async function markNotificationRead(notificationId, read) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  })

  if (!notification) {
    const err = new Error('Notification not found')
    err.code = 'NOT_FOUND'
    err.status = 404
    throw err
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: read }
  })

  return {
    id: updated.id,
    severity: updated.severity,
    title: updated.title,
    message: updated.message,
    ts: updated.createdAt.toISOString(),
    read: updated.isRead
  }
}

module.exports = {
  getNotifications,
  markNotificationRead
}