const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    processPayment, 
    getPaymentHistory, 
    getPaymentById 
} = require('../controllers/paymentController');

// Payment routes
router.get('/', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);
router.post('/process', protect, processPayment);

module.exports = router; 