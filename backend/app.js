const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes); 