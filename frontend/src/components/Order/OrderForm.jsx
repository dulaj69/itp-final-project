import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../services/api';
import { useTheme } from '@mui/material/styles';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const OrderForm = ({ onSubmit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    items: [
      {
        product: '',
        quantity: 1,
        price: 0
      }
    ],
    paymentMethod: 'credit_card',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    totalAmount: 0
  });

  const theme = useTheme();

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      console.log('Products fetched:', response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const selectedProduct = products.find(p => p._id === e.target.value);
    if (selectedProduct) {
      const newItems = [...formData.items];
      newItems[0] = {
        ...newItems[0],
        product: selectedProduct._id,
        productName: selectedProduct.name,
        price: selectedProduct.price
      };
      const totalAmount = newItems[0].price * newItems[0].quantity;
      setFormData(prev => ({
        ...prev,
        items: newItems,
        totalAmount
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else if (name === 'quantity') {
      const newItems = [...formData.items];
      newItems[0] = { ...newItems[0], quantity: Number(value) };
      const totalAmount = newItems[0].price * Number(value);
      setFormData(prev => ({
        ...prev,
        items: newItems,
        totalAmount
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const PaymentSection = () => {
    return (
      <Card 
        elevation={3} 
        sx={{ 
          mt: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f7ff 100%)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 600,
              mb: 3
            }}
          >
            Payment Details
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 500,
                color: theme.palette.text.secondary,
                mb: 2
              }}
            >
              Test Card Details:
            </Typography>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: '#f8faff',
                border: '1px dashed #bdc8f0'
              }}
            >
              <Typography variant="body1" sx={{ color: '#666' }}>
                Card Number: <span style={{ color: '#2196f3' }}>4242 4242 4242 4242</span><br />
                Expiry: <span style={{ color: '#2196f3' }}>Any future date (MM/YY)</span><br />
                CVC: <span style={{ color: '#2196f3' }}>Any 3 digits</span>
              </Typography>
            </Card>
          </Box>

          <Box 
            sx={{ 
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              mb: 3,
              bgcolor: 'white',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    padding: '10px 0',
                  },
                  invalid: {
                    color: '#e53935',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
              Amount to Pay: ${formData.totalAmount.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              size="large"
              type="submit"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                }
              }}
            >
              Pay Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <TextField
                select
                required
                fullWidth
                label="Select Product"
                value={formData.items[0].product}
                onChange={handleProductChange}
                sx={{ mb: 2 }}
              >
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} - ${product.price}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="quantity"
                label="Quantity"
                type="number"
                value={formData.items[0].quantity}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="shipping.street"
                label="Street Address"
                value={formData.shippingAddress.street}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                name="shipping.city"
                label="City"
                value={formData.shippingAddress.city}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                name="shipping.state"
                label="State"
                value={formData.shippingAddress.state}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                name="shipping.postalCode"
                label="Postal Code"
                value={formData.shippingAddress.postalCode}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                name="shipping.country"
                label="Country"
                value={formData.shippingAddress.country}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <PaymentSection />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Total Amount: ${formData.totalAmount.toFixed(2)}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Complete Order
            </Button>
          </Box>
        </form>
      </Paper>
    </Elements>
  );
};

export default OrderForm; 