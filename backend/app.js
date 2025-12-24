const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use(express.json()); 