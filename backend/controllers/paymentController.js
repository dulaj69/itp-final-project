const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.processPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify amount matches order total
    if (amount !== order.totalAmount) {
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId: Math.random().toString(36).substring(2, 15),
    });

    // Update order payment status
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    await order.save();

    // Return payment details with order info
    const populatedPayment = await Payment.findById(payment._id).populate('orderId');
    res.status(201).json(populatedPayment);
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
    const payment = await Payment.findById(req.params.id).populate('orderId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 