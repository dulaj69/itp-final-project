const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// User order routes
router.get('/history', protect, orderController.getUserOrderHistory);
router.get('/pending-payments', protect, orderController.getPendingPayments);

// Special routes first (before any :id parameters)
router.get('/shipping-status', protect, orderController.getAllOrders);

// Regular routes
router.get('/', protect, orderController.getAllOrders);
router.post('/', protect, orderController.createOrder);
router.post('/email-receipt', protect, orderController.sendEmailReceipt);

// Parameter routes last
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id', protect, orderController.updateOrder);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router; 