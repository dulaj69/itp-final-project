const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAllUsers, getUserProfile } = require('../controllers/userController');

// Get all users (protected route)
router.get('/', protect, getAllUsers);

// Get single user profile
router.get('/:userId', protect, getUserProfile);

module.exports = router; 