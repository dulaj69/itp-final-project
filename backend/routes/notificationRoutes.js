const express = require('express');
const router = express.Router();
const { getAllNotifications, createNotification, deleteNotification } = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);

module.exports = router; 