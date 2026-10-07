'use strict'

const { Router } = require('express')
const notificationController = require('../controllers/notificationController')
const { validateNotificationQuery, validateMarkRead, validateCreateNotification } = require('../middleware/validate')

const router = Router()

router.get('/', validateNotificationQuery, notificationController.getNotifications)
router.post('/', validateCreateNotification, notificationController.createNotification)
router.patch('/:id/read', validateMarkRead, notificationController.markNotificationRead)

module.exports = router