const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { sendPaymentReceipt } = require('../utils/emailService');

exports.processPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, cardDetails } = req.body;

    // Find the order and populate user details
    const order = await Order.findById(orderId).populate('user', 'email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify amount matches order total
    if (amount !== order.totalAmount) {
      return res.status(400).json({ 
        message: 'Payment amount does not match order total' 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId: `TXN${Date.now()}`
    });

    // Update order payment status
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    await order.save();

    // Send payment receipt email
    await sendPaymentReceipt(order, payment, order.user.email);

    res.status(201).json({
      message: 'Payment processed successfully and receipt sent',
      payment: {
        ...payment.toObject(),
        order: order
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find().populate('orderId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'orderId',
        select: 'orderNumber totalAmount status',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .lean();

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payments with order and user details
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        select: 'orderNumber totalAmount status',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort('-createdAt')
      .lean();

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payments by user ID
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ 'orderId.user': req.params.userId })
      .populate({
        path: 'orderId',
        select: 'orderNumber totalAmount status',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort('-createdAt')
      .lean();

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 