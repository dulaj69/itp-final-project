const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
require('./models/Product');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
  console.log('Routes registered successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 