const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  getUserPayments,
  processPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

// Get all payments (protected route)
router.get('/', protect, getAllPayments);

// Get specific payment by ID
router.get('/:id', protect, getPaymentById);

// Get all payments for a specific user
router.get('/user/:userId', protect, getUserPayments);

// Payment routes
router.post('/process', protect, processPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router; 