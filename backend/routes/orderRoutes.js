const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// Routes will be implemented based on order functionality
router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router; 