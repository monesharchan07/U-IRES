'use strict'

const { prisma } = require('../lib/prisma')
const realtime = require('../realtime')

const VALID_SEVERITIES = ['INFO', 'WARNING', 'CRITICAL']

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

async function createNotification({ severity, title, message }) {
  if (!VALID_SEVERITIES.includes(severity)) {
    const err = new Error(`Invalid severity: ${severity}. Must be one of: ${VALID_SEVERITIES.join(', ')}`)
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    throw err
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    const err = new Error('Title is required')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    throw err
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    const err = new Error('Message is required')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    throw err
  }

  const notification = await prisma.notification.create({
    data: {
      severity,
      title: title.trim(),
      message: message.trim(),
      isRead: false
    }
  })

  const createdNotification = {
    id: notification.id,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString()
  }

  try {
    realtime.publish('notification.created', createdNotification, notification.id)
  } catch (err) {
    console.warn('[SSE] Failed to publish notification.created:', err.message)
  }

  return createdNotification
}

module.exports = {
  getNotifications,
  markNotificationRead,
  createNotification
}