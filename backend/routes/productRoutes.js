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
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const Product = require('../models/Product');

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
    
    try {
      console.log(`Separate image update: Uploading image for product ${product._id}`);
      
      if (product.cloudinary && product.cloudinary.public_id) {
        console.log(`Deleting previous Cloudinary image: ${product.cloudinary.public_id}`);
        await deleteFromCloudinary(product.cloudinary.public_id);
      } 
      else if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted previous local image: ${oldImagePath}`);
        }
      }
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path);
      console.log('Cloudinary upload successful:', cloudinaryResult);
      
      product.imageUrl = cloudinaryResult.url;
      product.cloudinary = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.url
      };
      
      const updatedProduct = await product.save();
      res.json({ 
        success: true, 
        imageUrl: cloudinaryResult.url, 
        product: updatedProduct 
      });
    } catch (cloudinaryError) {
      console.error('Error with Cloudinary upload in separate image update:', cloudinaryError);
      
      if (req.file && fs.existsSync(req.file.path)) {
        if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
          const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        const imageUrl = `/uploads/products/${req.file.filename}`;
        product.imageUrl = imageUrl;
        product.cloudinary = { public_id: '', url: '' }; 
        const updatedProduct = await product.save();
        res.json({ 
          success: true, 
          imageUrl, 
          product: updatedProduct,
          note: 'Used local storage fallback due to Cloudinary error'
        });
      } else {
        throw new Error('Failed to upload image to Cloudinary and local fallback not available');
      }
    }
  } catch (error) {
    console.error('Error updating product image:', error);
    res.status(500).json({ message: 'Error updating product image', error: error.message });
  }
});

// Reserve stock when adding to cart
router.post('/:id/reserve', async (req, res) => {
  const { quantity } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock' });
  product.stock -= quantity;
  await product.save();
  res.json({ success: true, stock: product.stock });
});

// Release stock when removing from cart or abandoning cart
router.post('/:id/release', async (req, res) => {
  const { quantity } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.stock += quantity;
  await product.save();
  res.json({ success: true, stock: product.stock });
});

module.exports = router; 