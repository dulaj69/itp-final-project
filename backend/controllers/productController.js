const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');


const createProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Received product data:', {
      body: req.body,
      file: req.file ? `File received: ${req.file.originalname}` : 'No file'
    });

    const { name, description, price, category, stock, addDate, expiryDate } = req.body;
    
    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
    const parsedStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;
    
    console.log('Parsed product values:', { 
      name, 
      description: description || '', 
      price: parsedPrice, 
      category, 
      stock: parsedStock 
    });

    const productData = {
      name,
      description: description || '',
      price: parsedPrice,
      category,
      stock: parsedStock,
      addDate,
      expiryDate
    };

    if (req.file) {
      try {
        console.log(`Attempting to upload image: ${req.file.originalname}, size: ${req.file.size} bytes, path: ${req.file.path}`);
        
        // Validate the file exists and has content before uploading
        if (!fs.existsSync(req.file.path)) {
          throw new Error(`File does not exist at path: ${req.file.path}`);
        }
        
        const stats = fs.statSync(req.file.path);
        if (stats.size === 0) {
          throw new Error(`File at ${req.file.path} is empty (0 bytes)`);
        }
        
        const cloudinaryResult = await uploadToCloudinary(req.file.path);
        
        console.log('Cloudinary upload successful:', cloudinaryResult);
        
        productData.imageUrl = cloudinaryResult.url;
        productData.cloudinary = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url
        };
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        
        if (req.file && fs.existsSync(req.file.path)) {
          // Fallback to local storage if Cloudinary fails
          productData.imageUrl = `/uploads/products/${req.file.filename}`;
          console.log(`Fallback to local storage: ${productData.imageUrl}`);
        } else {
          console.warn('Could not use local fallback because file is not available');
        }
      }
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log('Product created successfully:', savedProduct._id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        message: 'Validation failed',
        validationErrors
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating product',
      error: error.message
    });
  }
});


const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, stock, status, addDate, expiryDate } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (status) product.status = status;
    if (addDate) product.addDate = addDate;
    if (expiryDate) product.expiryDate = expiryDate;
    
    if (req.file) {
      try {
        console.log(`Update: Attempting to upload image: ${req.file.originalname}, size: ${req.file.size} bytes, path: ${req.file.path}`);
        
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
      } catch (uploadError) {
        console.error('Error handling Cloudinary upload:', uploadError);
        
        if (req.file && fs.existsSync(req.file.path)) {
          if (product.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted previous local image: ${oldImagePath}`);
            }
          }
          
          product.imageUrl = `/uploads/products/${req.file.filename}`;
          console.log(`Fallback to local storage: ${product.imageUrl}`);
        } else {
          console.warn('Could not use local fallback because file is not available');
        }
      }
    }
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});


const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.cloudinary && product.cloudinary.public_id) {
      await deleteFromCloudinary(product.cloudinary.public_id);
    } 
    else if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
      const imagePath = path.join(__dirname, '..', 'public', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
}; 