const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    validate: {
      validator: function(v) {
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: 'Name must contain only letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    validate: {
      validator: function(v) {
        return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{5,}$/.test(v);
      },
      message: 'Password must be at least 5 characters long and contain at least one number and one special character'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 