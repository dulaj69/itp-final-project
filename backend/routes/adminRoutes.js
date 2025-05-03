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
  rejectRefundRequest
} = require('../controllers/adminController');
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

module.exports = router; 