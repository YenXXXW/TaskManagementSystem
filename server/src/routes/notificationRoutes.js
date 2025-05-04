const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');

router.get('/:id', getNotifications);

router.patch('/read/:id', markAsRead);

module.exports = router;
