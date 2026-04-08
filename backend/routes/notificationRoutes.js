const express = require('express');
const { createNotification, getNotifications, dismissNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createNotification)
  .get(protect, getNotifications);

router.route('/:id/dismiss')
  .delete(protect, dismissNotification);

module.exports = router;
