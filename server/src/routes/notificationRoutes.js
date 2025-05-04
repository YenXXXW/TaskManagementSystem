const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');

router.get('/:id', getNotifications);

router.put('/read', markAsRead);

module.exports = router;
