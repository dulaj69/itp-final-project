const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  getUserPayments,
  processPayment,
  getPaymentHistory,
  createPaymentIntent,
  updatePaymentStatus,
  processRefund
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
router.post('/create-intent', protect, createPaymentIntent);
router.post('/:orderId/complete', protect, updatePaymentStatus);

// Refund route - admin only
router.post('/refund/:orderId', protect, admin, processRefund);

module.exports = router; 