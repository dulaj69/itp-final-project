const Order = require('../models/Order');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Calculate subtotals and total amount
    const processedItems = items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price // Calculate subtotal for each item
    }));
    
    const totalAmount = processedItems.reduce((total, item) => total + item.subtotal, 0);

    const order = await Order.create({
      user: req.user._id,
      items: processedItems,
      totalAmount, // Include totalAmount
      paymentMethod,
      shippingAddress
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('payment')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('payment')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 