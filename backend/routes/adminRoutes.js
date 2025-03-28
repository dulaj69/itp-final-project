const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getAllPayments,
  getAllUsers,
  updateOrderStatus
} = require('../controllers/adminController');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/payments', protect, admin, getAllPayments);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

module.exports = router; 