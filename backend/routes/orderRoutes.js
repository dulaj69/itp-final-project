const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllOrders,
  getOrderById,
  getUserOrders,
  createOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// Test route without protection first
router.get('/all', getAllOrders);  // Remove protect middleware temporarily
router.get('/user', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router; 