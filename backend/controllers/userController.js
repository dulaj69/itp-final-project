const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') 
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { 'createdAt': -1 } }
      })
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
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