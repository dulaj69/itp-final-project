const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer'],
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancellationDate: {
    type: Date,
    default: null
  },
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'processed', 'rejected'],
    default: 'not_applicable'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payment information
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true
});

// Remove the pre-validate hook and keep only one pre-save hook
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotals and total amount in one go
    let total = 0;
    this.items.forEach(item => {
      item.subtotal = item.price * item.quantity;
      total += item.subtotal;
    });
    this.totalAmount = total;
  }
  next();
});

// Method to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.orderStatus);
};

// Method to cancel order
orderSchema.methods.cancel = function(reason) {
  if (this.canBeCancelled()) {
    this.orderStatus = 'cancelled';
    this.cancellationReason = reason;
    this.cancellationDate = new Date();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Order', orderSchema); 