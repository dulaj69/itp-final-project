const mongoose = require('mongoose');

const quotaItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  unitWeight: {
    type: Number,
    required: true
  },
  weightUnit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'ml', 'l']
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const quotaSchema = new mongoose.Schema({
  quotaId: {
    type: String,
    required: true,
    unique: true
  },
  items: [quotaItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate quotaId and calculate totalPrice
quotaSchema.pre('save', function(next) {
  if (!this.quotaId) {
    // Generate quotaId: Q + timestamp + random string
    this.quotaId = 'Q' + Date.now() + Math.random().toString(36).substr(2, 6);
  }
  
  // Calculate totalPrice for each item
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
  });
  
  next();
});

module.exports = mongoose.model('Quota', quotaSchema); 