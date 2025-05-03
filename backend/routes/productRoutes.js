const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  createProduct, 
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct 
} = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
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

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Product Route accessed: ${req.method} ${req.url}`);
  next();
});

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', protect, admin, upload.single('image'), createProduct);
router.put('/:id', protect, admin, upload.single('image'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Update product image separately
router.put('/:id/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const Product = require('../models/Product');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete old image if exists
    if (product.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Set new image URL
    const imageUrl = `/uploads/products/${req.file.filename}`;
    product.imageUrl = imageUrl;
    
    const updatedProduct = await product.save();
    res.json({ success: true, imageUrl, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product image:', error);
    res.status(500).json({ message: 'Error updating product image', error: error.message });
  }
});

module.exports = router; 