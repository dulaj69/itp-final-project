const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getAllPayments,
  getAllUsers,
  updateOrderStatus,
  cancelOrder,
  cancelOrderWithRefund,
  rejectRefundRequest,
  updateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/adminController');
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Quota = require('../models/Quota');
const Qitem = require('../models/Qitem');

// Configure storage for product images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'public/uploads/products';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/stats', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/payments', protect, admin, getAllPayments);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.put('/orders/:id/cancel', protect, admin, cancelOrder);
router.put('/orders/:id/cancel-with-refund', protect, admin, cancelOrderWithRefund);
router.post('/orders/:id/reject-refund', protect, admin, rejectRefundRequest);

// Admin product routes
router.post('/products', protect, admin, upload.single('image'), productController.createProduct);
router.get('/products', protect, admin, productController.getAllProducts);
router.get('/products/:id', protect, admin, productController.getProductById);
router.put('/products/:id', protect, admin, upload.single('image'), productController.updateProduct);
router.delete('/products/:id', protect, admin, productController.deleteProduct);

router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Quota routes
router.get('/quotas', protect, admin, async (req, res) => {
  try {
    const quotas = await Quota.find().sort({ createdAt: -1 });
    res.json(quotas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quotas', protect, admin, async (req, res) => {
  try {
    const quotaData = {
      ...req.body,
      quotaId: 'Q' + Date.now() + Math.random().toString(36).substr(2, 6)
    };
    const quota = new Quota(quotaData);
    await quota.save();
    res.status(201).json(quota);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/quotas/:id', protect, admin, async (req, res) => {
  try {
    const quota = await Quota.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json(quota);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/quotas/:id', protect, admin, async (req, res) => {
  try {
    const quota = await Quota.findByIdAndDelete(req.params.id);
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json({ message: 'Quota deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/quotas/:id', protect, admin, async (req, res) => {
  try {
    const quota = await Quota.findById(req.params.id);
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json(quota);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Qitem route for quota autocomplete
router.get('/qitems', protect, admin, async (req, res) => {
  try {
    const qitems = await Qitem.find({ availableItem: true });
    res.json(qitems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 