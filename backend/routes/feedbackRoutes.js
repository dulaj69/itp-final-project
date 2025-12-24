const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);

// Admin routes
router.patch('/:id/thank', protect, isAdmin, feedbackController.updateFeedbackStatus);

module.exports = router; 