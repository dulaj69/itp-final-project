const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Generate order number
    const orderNumber = `ORD${Date.now()}`;

    // Calculate total and get product details
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // If product ID is provided, fetch from database
      if (item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.product}` 
          });
        }
        orderItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price
        });
        totalAmount += product.price * item.quantity;
      } 
      // If direct product details are provided
      else if (item.productName && item.price) {
        orderItems.push({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        });
        totalAmount += item.price * item.quantity;
      } else {
        return res.status(400).json({
          message: 'Invalid item format. Requires either product ID or product details'
        });
      }
    }

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      totalAmount: totalAmount || req.body.totalAmount,
      paymentMethod,
      shippingAddress
    });

    // Populate user details and return
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders with user details
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price description')
      .sort('-createdAt')
      .lean();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    })
    .populate('user', 'name email')
    .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get orders by user ID
exports.getUserOrders = async (req, res) => {
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
};

// Cancel order
exports.cancelOrder = async (req, res) => {
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
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
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
};

// Get all orders for the current user
exports.getOrders = async (req, res) => {
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
}; 