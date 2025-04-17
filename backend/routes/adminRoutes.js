const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getAllPayments,
  getAllUsers,
  updateOrderStatus,
  cancelOrder,
  cancelOrderWithRefund,
  rejectRefundRequest
} = require('../controllers/adminController');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/payments', protect, admin, getAllPayments);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.put('/orders/:id/cancel', protect, admin, cancelOrder);
router.put('/orders/:id/cancel-with-refund', protect, admin, cancelOrderWithRefund);
router.post('/orders/:id/reject-refund', protect, admin, rejectRefundRequest);

module.exports = router; 