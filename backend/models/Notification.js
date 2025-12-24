const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  toWhom: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema); 