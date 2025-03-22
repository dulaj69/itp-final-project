const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Special routes first (before any :id parameters)
router.get('/shipping-status', protect, orderController.getShippingStatus);
router.get('/pending-payments', protect, orderController.getPendingPayments);

// Regular routes
router.get('/', protect, orderController.getOrders);
router.post('/', protect, orderController.createOrder);

// Parameter routes last
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router; 