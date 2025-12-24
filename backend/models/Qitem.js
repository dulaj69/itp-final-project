const mongoose = require('mongoose');

const qitemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemQuantity: { type: Number, required: true }, // e.g., 50, 250
  itemPrice: { type: Number, required: true },
  availableItem: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Qitem', qitemSchema); 