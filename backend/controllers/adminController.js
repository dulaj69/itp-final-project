const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalUsers, pendingOrders, pendingRefunds] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ refundStatus: 'pending' })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      pendingOrders,
      pendingRefunds
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();

    // Transform the data to match the updated schema with explicit refund fields
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      refundStatus: order.refundStatus || 'not_applicable',
      refundReason: order.refundReason || null,
      refundRequestDate: order.refundRequestDate || null,
      refundProcessedDate: order.refundProcessedDate || null,
      cancellationReason: order.cancellationReason || null,
      cancellationDate: order.cancellationDate || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    console.log(`Returning ${formattedOrders.length} orders including ${
      formattedOrders.filter(o => o.refundStatus === 'pending').length
    } pending refund requests`);
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort('-createdAt')
      .lean();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
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

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRefundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order has a pending refund request
    if (order.refundStatus !== 'pending') {
      return res.status(400).json({
        message: 'This order does not have a pending refund request'
      });
    }

    // Update order with rejected refund status
    order.refundStatus = 'rejected';
    order.refundProcessedDate = new Date();
    
    // Add rejection reason if provided
    if (reason) {
      order.notes = reason;
    }

    await order.save();

    // Send notification email to user if needed
    if (order.user && order.user.email) {
      console.log(`Refund rejection notification would be sent to ${order.user.email}`);
    }
    
    return res.json({
      success: true,
      message: 'Refund request rejected successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        refundStatus: order.refundStatus
      }
    });
  } catch (error) {
    console.error('Error rejecting refund request:', error);
    return res.status(500).json({
      message: 'Failed to reject refund request',
      error: error.message
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled in its current state' 
      });
    }

    // Cancel the order
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by admin';
    order.cancellationDate = new Date();

    // Check if payment has been made and needs refund
    if (order.paymentStatus === 'paid') {
      order.refundStatus = 'pending'; // Will be updated by the payment controller
      await order.save();

      // Return the order with a reminder that refund needs to be processed
      return res.json({
        order,
        message: 'Order cancelled. Please process the refund separately.',
        requiresRefund: true
      });
    } else {
      // No payment was made or payment failed
      await order.save();
      return res.json({
        order,
        message: 'Order cancelled successfully',
        requiresRefund: false
      });
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrderWithRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled in its current state' 
      });
    }

    // Cancel the order
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by admin';
    order.cancellationDate = new Date();

    // Check if payment has been made and needs refund
    if (order.paymentStatus === 'paid') {
      // Save order with pending refund status
      order.refundStatus = 'pending';
      await order.save();

      // Return the order with refund process message
      return res.json({
        order,
        message: 'Order cancelled and refund marked as pending. Process refund from the refund management screen.',
        requiresRefund: true
      });
    } else {
      // No payment was made or payment failed
      await order.save();
      return res.json({
        order,
        message: 'Order cancelled successfully',
        requiresRefund: false
      });
    }
  } catch (error) {
    console.error('Error cancelling order with refund:', error);
    res.status(500).json({ message: error.message });
  }
}; 