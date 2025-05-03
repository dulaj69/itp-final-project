const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    // Log the received data for debugging
    console.log('Received product data:', {
      body: req.body,
      file: req.file ? 'File received' : 'No file'
    });

    const { name, description, price, category, stock } = req.body;
    
    // Parse numeric values if they're strings
    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
    const parsedStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;
    
    console.log('Parsed product values:', { 
      name, 
      description: description || '', 
      price: parsedPrice, 
      category, 
      stock: parsedStock 
    });

    // Create product data
    const productData = {
      name,
      description: description || '',
      price: parsedPrice,
      category,
      stock: parsedStock
    };

    // Handle image upload if present
    if (req.file) {
      productData.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    // Create and save the product
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log('Product created successfully:', savedProduct._id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors specifically
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

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, stock, status } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (status) product.status = status;
    
    // Handle image upload if present
    if (req.file) {
      // Delete old image if exists
      if (product.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      product.imageUrl = `/uploads/products/${req.file.filename}`;
    }
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product image if exists
    if (product.imageUrl) {
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