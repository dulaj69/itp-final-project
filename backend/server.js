const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
require('./models/Product');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
try {
  console.log('Registering routes...');
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/products', productRoutes);
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/sales', require('./routes/salesRoutes'));
  app.use('/api/orders', orderRoutes);
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/backup', require('./routes/backupRoutes'));
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  console.log('Routes registered successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 