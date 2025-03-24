const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderReceipt } = require('../utils/emailUtils');
const { sendPaymentReceipt } = require('../utils/emailService');

const orderController = {
  // Get all orders
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create order
  createOrder: async (req, res) => {
    try {
      const { items, paymentMethod, shippingAddress } = req.body;
      const orderNumber = `ORD${Date.now()}`;
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (!product) {
            return res.status(404).json({ message: `Product not found: ${item.product}` });
          }
          orderItems.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price
          });
          totalAmount += product.price * item.quantity;
        } else if (item.productName && item.price) {
          orderItems.push({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          });
          totalAmount += item.price * item.quantity;
        } else {
          return res.status(400).json({
            message: 'Invalid item format'
          });
        }
      }

      const order = await Order.create({
        orderNumber,
        user: req.user?._id,
        items: orderItems,
        totalAmount,
        paymentMethod,
        shippingAddress
      });

      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('items.product', 'name price');

      res.status(201).json(populatedOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update order
  updateOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      );
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete order
  deleteOrder: async (req, res) => {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: 'Order deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Send email receipt
  sendEmailReceipt: async (req, res) => {
    try {
      const { orderId, email, orderDetails } = req.body;
      console.log('Attempting to send email receipt:', { orderId, email });

      const order = await Order.findById(orderId)
        .populate('user', 'email')
        .populate('items.product');

      if (!order) {
        console.log('Order not found:', orderId);
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log('Found order:', {
        orderNumber: order.orderNumber,
        email: email || order.user.email
      });

      const emailResult = await sendOrderReceipt({
        email: email || order.user.email,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderDate: order.createdAt
      });

      console.log('Email sent successfully:', emailResult);

      res.status(200).json({
        success: true,
        message: 'Receipt sent successfully'
      });
    } catch (error) {
      console.error('Send email receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send receipt',
        error: error.message
      });
    }
  },

  // Get orders by user ID
  getUserOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort('-createdAt');

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Cancel order
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!order.canBeCancelled()) {
        return res.status(400).json({ 
          message: 'Order cannot be cancelled in its current state' 
        });
      }

      const cancelled = order.cancel(req.body.reason);
      if (cancelled) {
        await order.save();
        res.json(order);
      } else {
        res.status(400).json({ message: 'Could not cancel order' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus: status },
        { new: true }
      ).populate('user', 'name email');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get all orders for the current user
  getOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort('-createdAt');

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getPendingPayments: async (req, res) => {
    try {
      const pendingOrders = await Order.find({
        user: req.user._id,
        paymentStatus: 'pending'
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

      // Return empty array instead of 404 if no orders found
      res.status(200).json(pendingOrders || []);
      
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      res.status(500).json({ 
        message: 'Error fetching pending payments',
        error: error.message 
      });
    }
  },

  getShippingStatus: async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user._id,
        paymentStatus: 'paid',
        orderStatus: { $in: ['processing', 'shipped'] }
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

      res.status(200).json(orders || []);
      
    } catch (error) {
      console.error('Error fetching shipping status:', error);
      res.status(500).json({ 
        message: 'Error fetching shipping status',
        error: error.message 
      });
    }
  }
};

module.exports = orderController; 