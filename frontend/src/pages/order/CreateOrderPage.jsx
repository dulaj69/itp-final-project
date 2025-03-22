import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [orderData, setOrderData] = useState({
    items: [
      {
        product: '',
        productName: '',
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
    }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        productName: selectedProduct.name,
        price: selectedProduct.price
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    setOrderData({ ...orderData, items: newItems });
  };

  const handleAddItem = () => {
    setOrderData({
      ...orderData,
      items: [
        ...orderData.items,
        {
          product: '',
          productName: '',
          quantity: 1,
          price: 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const handleAddressChange = (field, value) => {
    setOrderData({
      ...orderData,
      shippingAddress: {
        ...orderData.shippingAddress,
        [field]: value
      }
    });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/orders', {
        ...orderData,
        totalAmount: calculateTotal()
      });
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Order Items */}
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Order Items
          </Typography>

          {orderData.items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Product"
                  value={item.product}
                  onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  disabled
                  label="Subtotal"
                  value={(item.price * item.quantity).toFixed(2)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={orderData.items.length === 1}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}

          <Button onClick={handleAddItem} sx={{ mb: 3 }}>
            Add Item
          </Button>

          {/* Payment Method */}
          <TextField
            select
            fullWidth
            label="Payment Method"
            value={orderData.paymentMethod}
            onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
            sx={{ mb: 3 }}
          >
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="debit_card">Debit Card</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
          </TextField>

          {/* Shipping Address */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Shipping Address
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={orderData.shippingAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={orderData.shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={orderData.shippingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={orderData.shippingAddress.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={orderData.shippingAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Order Total */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6">
              Total Amount: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Order'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateOrderPage; 