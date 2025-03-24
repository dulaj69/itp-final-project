import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  MenuItem,
  IconButton,
  useTheme,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart,
  LocalShipping,
  Delete as DeleteIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import api from '../../services/api';
import StripePayment from '../../components/Payment/StripePayment';

const OrderForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState('order'); // 'order' or 'payment'
  const [orderData, setOrderData] = useState({
    items: [
      {
        product: '',
        quantity: 1
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
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/orders', orderData);
      setOrderId(response.data._id);
      setStep('payment');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/order-confirmation/' + orderId);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
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

  const handleAddItem = () => {
    setOrderData({
      ...orderData,
      items: [
        ...orderData.items,
        {
          product: '',
          quantity: 1,
          price: 0
        }
      ]
    });
  };

  const handleQuantityChange = (index, change) => {
    const newItems = [...orderData.items];
    const newQuantity = Math.max(1, newItems[index].quantity + change);
    newItems[index] = { ...newItems[index], quantity: newQuantity };
    setOrderData({ ...orderData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    if (orderData.items.length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      const product = products.find(p => p._id === item.product);
      const price = product ? product.price : 0;
      return total + (price * item.quantity);
    }, 0);
  };

  if (step === 'payment' && orderId) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Complete Payment
            </Typography>
            <Divider sx={{ my: 2 }} />
            <StripePayment
              orderId={orderId}
              amount={calculateTotal()}
              onSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: theme.palette.grey[100],
        p: 4,
        overflow: 'auto'
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          margin: '0 auto',
          borderRadius: 3,
          boxShadow: theme.shadows[10]
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Create New Order
              </Typography>
            </Box>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HomeIcon />
            </IconButton>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handlePlaceOrder}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart fontSize="small" />
              Order Items
            </Typography>

            {orderData.items.map((item, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  mb: 2,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: theme.shadows[5] }
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      select
                      fullWidth
                      label="Product"
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} - ${product.price}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      InputProps={{
                        inputProps: { min: 1 },
                        startAdornment: (
                          <IconButton size="small" onClick={() => handleQuantityChange(index, -1)}>
                            <RemoveIcon />
                          </IconButton>
                        ),
                        endAdornment: (
                          <IconButton size="small" onClick={() => handleQuantityChange(index, 1)}>
                            <AddIcon />
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      disabled
                      label="Subtotal"
                      value={`$${(item.price * item.quantity).toFixed(2)}`}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton 
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      sx={{ 
                        '&:hover': { 
                          transform: 'scale(1.1)',
                          bgcolor: theme.palette.error.light 
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mb: 4 }}
            >
              Add Item
            </Button>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping fontSize="small" />
              Shipping Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Street Address"
                  value={orderData.shippingAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="City"
                  value={orderData.shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="State"
                  value={orderData.shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Postal Code"
                  value={orderData.shippingAddress.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Country"
                  value={orderData.shippingAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 'bold'
                }}
              >
                Place Order
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderForm; 