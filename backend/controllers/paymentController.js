const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { sendPaymentReceipt } = require('../utils/emailService');

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({ message: 'OrderId and amount are required' });
      }

      // Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { 
          orderId,
          userId: req.user._id.toString() 
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Payment Intent Error:', error);
      res.status(500).json({ message: 'Error creating payment intent' });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentIntentId } = req.body;

      if (!orderId || !paymentIntentId) {
        return res.status(400).json({ 
          message: 'Order ID and payment intent ID are required' 
        });
      }

      // Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }

      console.log('Updating payment status:', { orderId, paymentIntentId });

      // Find and update order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.metadata.orderId !== orderId) {
        return res.status(400).json({ 
          message: 'Payment intent does not match order' 
        });
      }

      // Create payment record
      const payment = await Payment.create({
        orderId,
        paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert from cents
        paymentMethod: 'STRIPE',
        status: 'completed'
      });

      // Update order status
      order.paymentStatus = 'paid';
      order.paymentIntentId = paymentIntentId;
      await order.save();

      res.json({ 
        message: 'Payment status updated successfully',
        payment 
      });
    } catch (error) {
      console.error('Payment Status Update Error:', error);
      res.status(500).json({ 
        message: 'Error updating payment status',
        error: error.message 
      });
    }
  },

  processPayment: async (req, res) => {
    try {
      const { orderId, amount, paymentMethod } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and amount are required'
        });
      }

      const order = await Order.findById(orderId).populate('user', 'email');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (paymentMethod === 'CASH') {
        // Handle cash on delivery
        const payment = await Payment.create({
          orderId,
          amount,
          paymentMethod: 'CASH',
          status: 'pending'
        });

        // Update order status
        order.paymentStatus = 'pending';
        order.orderStatus = 'processing';
        await order.save();

        // Send email confirmation
        let emailStatus = { sent: false, error: null };
        try {
          await sendPaymentReceipt(order, payment, order.user.email);
          emailStatus.sent = true;
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          emailStatus.error = emailError.message;
        }

        return res.status(200).json({
          success: true,
          message: 'Cash on delivery order confirmed',
          payment,
          emailStatus
        });
      } else {
        // For card payments, create a Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          metadata: { 
            orderId,
            userId: req.user._id.toString() 
          }
        });

        return res.json({
          success: true,
          clientSecret: paymentIntent.client_secret
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing payment',
        error: error.message
      });
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const payments = await Payment.find().populate('orderId');
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPaymentById: async (req, res) => {
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
  },

  // Get all payments with order and user details
  getAllPayments: async (req, res) => {
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
  },

  // Get payments by user ID
  getUserPayments: async (req, res) => {
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
  },

  completePayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentIntentId } = req.body;
      
      console.log('Payment completion started:', { orderId, paymentIntentId });

      const order = await Order.findById(orderId).populate('user', 'email');
      if (!order) {
        throw new Error('Order not found');
      }

      // Create payment record
      const payment = await Payment.create({
        orderId,
        amount: order.totalAmount,
        paymentMethod: 'stripe',
        status: 'completed',
        transactionId: paymentIntentId
      });

      // Update order status
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      await order.save();

      // Send email receipt
      let emailStatus = { sent: false, error: null };
      try {
        await sendPaymentReceipt(order, payment, order.user.email);
        emailStatus.sent = true;
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        emailStatus.error = emailError.message;
      }

      res.status(200).json({
        success: true,
        message: 'Payment completed successfully',
        payment: payment,
        emailStatus
      });

    } catch (error) {
      console.error('Payment completion error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: error
      });
    }
  },

  processRefund: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Find the order
      const order = await Order.findById(orderId).populate('user', 'name email');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Verify refund eligibility
      if (order.refundStatus !== 'pending') {
        return res.status(400).json({ 
          message: `This order does not have a pending refund request (current status: ${order.refundStatus})` 
        });
      }
      
      if (order.paymentStatus !== 'paid') {
        return res.status(400).json({ message: 'Only paid orders can be refunded' });
      }
      
      // Find the original payment
      const originalPayment = await Payment.findOne({ orderId: order._id });
      if (!originalPayment) {
        return res.status(404).json({ message: 'No payment record found for this order' });
      }
      
      // Process the refund
      try {
        // Create a new payment record for the refund
        const refundPayment = await Payment.create({
          orderId: order._id,
          amount: -order.totalAmount, // Negative amount to indicate refund
          paymentMethod: originalPayment.paymentMethod,
          status: 'completed',
          paymentIntentId: `REFUND-${originalPayment.paymentIntentId}`,
        });
        
        // Update the order
        order.refundStatus = 'processed';
        order.refundProcessedDate = new Date();
        await order.save();
        
        // Send email notification to the customer (if implemented)
        if (order.user && order.user.email) {
          // TODO: Implement refund notification email
          console.log(`Refund notification would be sent to ${order.user.email}`);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Refund processed successfully',
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            refundStatus: order.refundStatus,
            refundProcessedDate: order.refundProcessedDate
          },
          refund: refundPayment
        });
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        return res.status(500).json({
          message: 'Failed to process the refund payment',
          error: refundError.message
        });
      }
    } catch (error) {
      console.error('Error in processRefund:', error);
      return res.status(500).json({
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }
};

module.exports = paymentController; 