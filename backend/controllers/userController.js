const User = require('../models/User');
const mongoose = require('mongoose');

// Validation middleware
const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  next();
};

const validateUpdateData = (req, res, next) => {
  const { name, email } = req.body;
  const errors = {};

  // Name validation
  if (name && !/^[A-Za-z\s]+$/.test(name)) {
    errors.name = 'Name must contain only letters and spaces';
  }

  // Email validation
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

exports.getAllUsers = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add search functionality
    const searchQuery = req.query.search ? {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(searchQuery)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { 'createdAt': -1 } }
      })
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { 'createdAt': -1 } }
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Validate update data
    const errors = {};
    if (name && !/^[A-Za-z\s]+$/.test(name)) {
      errors.name = 'Name must contain only letters and spaces';
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export validation middleware
exports.validateUserId = validateUserId;
exports.validateUpdateData = validateUpdateData; 