'use strict'

const notificationService = require('../services/notificationService')

async function getNotifications(req, res, next) {
  try {
    const { limit, offset, read } = req.validated
    const result = await notificationService.getNotifications({ limit, offset, read })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params
    const { read } = req.validated
    const notification = await notificationService.markNotificationRead(id, read)
    res.json(notification)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getNotifications,
  markNotificationRead
}