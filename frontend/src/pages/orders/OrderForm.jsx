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
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Chip,
  Badge,
  CircularProgress,
  Fade,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart,
  LocalShipping,
  Delete as DeleteIcon,
  Home as HomeIcon,
  CheckCircle,
  Payment as PaymentIcon,
  LocationOn,
  ArrowForward
} from '@mui/icons-material';
import api from '../../services/api';
import StripePayment from '../../components/Payment/StripePayment';

const validateZipCode = (country, zipCode) => {
  const patterns = {
    'India': /^[1-9][0-9]{5}$/,
    'Sri Lanka': /^[1-9][0-9]{4}$/
  };
  return patterns[country]?.test(zipCode) || false;
};

// Validation regexes
const validateStateProvince = (value) => /^[A-Za-z\s]+$/.test(value);
const validateCity = (value) => /^[A-Za-z\s]+$/.test(value);
const validateStreetAddress = (value) => /^.{5,}$/.test(value);

const OrderForm = ({ onSubmit }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [step, setStep] = useState('order'); // 'order' or 'payment'
  const [orderData, setOrderData] = useState({
    items: [],
    paymentMethod: 'credit_card',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  const [zipError, setZipError] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [addressErrors, setAddressErrors] = useState({
    street: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchProducts();
    
    // Load cart items from localStorage if they exist
    const savedItems = localStorage.getItem('orderItems');
    const savedTotal = localStorage.getItem('orderTotal');
    
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setOrderData(prev => ({
            ...prev,
            items: parsedItems
          }));
        }
      } catch (err) {
        console.error('Error parsing saved order items:', err);
      }
    }
    
    if (savedTotal) {
      setOrderTotal(parseFloat(savedTotal));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate address fields
    let errors = { street: '', city: '', state: '' };
    let hasError = false;
    if (!validateStreetAddress(orderData.shippingAddress.street)) {
      errors.street = 'Street address must be at least 5 characters.';
      hasError = true;
    }
    if (!validateCity(orderData.shippingAddress.city)) {
      errors.city = 'City must only contain letters and spaces.';
      hasError = true;
    }
    if (!validateStateProvince(orderData.shippingAddress.state)) {
      errors.state = 'State/Province must only contain letters and spaces.';
      hasError = true;
    }
    setAddressErrors(errors);
    if (hasError) return;

    const isValidZip = validateZipCode(
      orderData.shippingAddress.country,
      orderData.shippingAddress.postalCode
    );

    const requiredFields = [
      'street',
      'city',
      'state',
      'country',
      'postalCode'
    ];

    const missingFields = requiredFields.filter(
      field => !orderData.shippingAddress[field]
    );

    if (missingFields.length > 0) {
      setError('Please fill in all required shipping fields');
      return;
    }

    if (!isValidZip) {
      setError(`Invalid postal code for ${orderData.shippingAddress.country}`);
      return;
    }

    // Validate if products are selected
    if (!orderData.items.some(item => item.product)) {
      setError('Please select at least one product');
      return;
    }

    setLoading(true);
    try {
      // Include the total amount in the order data
      const orderPayload = {
        ...orderData,
        totalAmount: orderTotal || calculateTotal()
      };
      
      const response = await api.post('/orders', orderPayload);
      setOrderId(response.data._id);
      setStep('payment');
      
      localStorage.removeItem('orderItems');
      localStorage.removeItem('orderTotal');
      localStorage.removeItem('cart');
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
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        price: selectedProduct?.price || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderData({ ...orderData, items: newItems });
  };

  const handleAddressChange = (field, value) => {
    let error = '';
    if (field === 'street') {
      if (!validateStreetAddress(value)) {
        error = 'Street address must be at least 5 characters.';
      }
    }
    if (field === 'city') {
      if (!validateCity(value)) {
        error = 'City must only contain letters and spaces.';
      }
    }
    if (field === 'state') {
      if (!validateStateProvince(value)) {
        error = 'State/Province must only contain letters and spaces.';
      }
    }
    setAddressErrors(prev => ({ ...prev, [field]: error }));
    if (field === 'postalCode') {
      const isValid = validateZipCode(orderData.shippingAddress.country, value);
      setZipError(isValid ? '' : `Invalid ${orderData.shippingAddress.country} postal code`);
    }
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

  const nextStep = () => {
    setActiveStep(1);
  };

  const prevStep = () => {
    setActiveStep(0);
  };

  const steps = ['Select Products', 'Shipping Information'];

  if (step === 'payment' && orderId) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <PaymentIcon fontSize="large" />
            <Typography variant="h5">
              Complete Payment
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your order has been created successfully. Please complete the payment to finalize your order.
            </Alert>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              bgcolor: theme.palette.grey[50],
              p: 3,
              borderRadius: 2,
              mb: 3
            }}>
              <Typography variant="subtitle1">Order Total:</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
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
    <Box sx={{ 
      width: '100%',
      maxWidth: 1000,
      mx: 'auto',
      pb: 6
    }}>
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCart fontSize="large" />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Create New Order
            </Typography>
          </Box>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4, 
              py: 2,
              px: 1,
              bgcolor: theme.palette.grey[50],
              borderRadius: 2
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={handlePlaceOrder}>
            {activeStep === 0 ? (
              <Fade in={activeStep === 0}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}>
                      <ShoppingCart fontSize="small" />
                      Products
                      {orderData.items.some(item => item.product) && (
                        <Chip 
                          size="small" 
                          label={`${orderData.items.filter(item => item.product).length} selected`}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {orderData.items.map((item, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              boxShadow: theme.shadows[4],
                              transform: 'translateY(-2px)'
                            },
                            border: '1px solid',
                            borderColor: item.product ? 
                              `${theme.palette.primary.main}30` : theme.palette.grey[200]
                          }}
                          elevation={item.product ? 2 : 1}
                        >
                          <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={5}>
                              <TextField
                                select
                                fullWidth
                                label="Product"
                                value={item.product}
                                onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                                required
                              >
                                {products.map((product) => (
                                  <MenuItem key={product._id} value={product._id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                      <Typography>{product.name}</Typography>
                                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                                        Rs.{product.price}
                                      </Typography>
                                    </Box>
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
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                InputProps={{
                                  inputProps: { min: 1 },
                                  startAdornment: (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleQuantityChange(index, -1)}
                                      sx={{ color: theme.palette.grey[600] }}
                                    >
                                      <RemoveIcon fontSize="small" />
                                    </IconButton>
                                  ),
                                  endAdornment: (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleQuantityChange(index, 1)}
                                      sx={{ color: theme.palette.primary.main }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  ),
                                }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                disabled
                                label="Subtotal"
                                value={`Rs.${(
                                  (products.find(p => p._id === item.product)?.price || 0) * 
                                    item.quantity
                                ).toFixed(2)}`}
                                sx={{ 
                                  bgcolor: theme.palette.grey[50],
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                              <IconButton 
                                color="error"
                                onClick={() => handleRemoveItem(index)}
                                disabled={orderData.items.length <= 1}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: theme.palette.error.light + '20'
                                  },
                                  borderRadius: 2
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 4,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50]
                  }}>
                    <Typography variant="h6">
                      Subtotal:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      Rs.{calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={nextStep}
                      endIcon={<ArrowForward />}
                      disabled={!orderData.items.some(item => item.product)}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 8,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                      }}
                    >
                      Continue to Shipping
                    </Button>
                  </Box>
                </Box>
              </Fade>
            ) : (
              <Fade in={activeStep === 1}>
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 500,
                    color: theme.palette.text.primary
                  }}>
                    <LocalShipping fontSize="small" />
                    Shipping Information
                  </Typography>
                  
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    mb: 4,
                    border: '1px solid',
                    borderColor: theme.palette.grey[200]
                  }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label="Street Address"
                          value={orderData.shippingAddress.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          error={Boolean(addressErrors.street)}
                          helperText={addressErrors.street}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                          placeholder="123 Main Street"
                          InputProps={{
                            startAdornment: (
                              <LocationOn color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="City"
                          value={orderData.shippingAddress.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          error={Boolean(addressErrors.city)}
                          helperText={addressErrors.city}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                          placeholder="Colombo"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="State/Province"
                          value={orderData.shippingAddress.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          error={Boolean(addressErrors.state)}
                          helperText={addressErrors.state}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                          placeholder="Western Province"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="Country"
                          value={orderData.shippingAddress.country}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Select a country</em>
                          </MenuItem>
                          <MenuItem value="India">India</MenuItem>
                          <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Postal Code"
                          value={orderData.shippingAddress.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          error={Boolean(zipError)}
                          helperText={zipError || (orderData.shippingAddress.country === 'India' ? 'Enter 6-digit PIN code' : 'Enter 5-digit postal code')}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                          placeholder={orderData.shippingAddress.country === 'India' ? '110001' : '00100'}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Box sx={{ 
                    bgcolor: theme.palette.grey[50], 
                    p: 3, 
                    borderRadius: 2, 
                    mb: 4,
                    border: '1px solid',
                    borderColor: theme.palette.grey[200]
                  }}>
                    <Typography variant="h6" gutterBottom>Order Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography color="text.secondary">
                          Products ({orderData.items.filter(item => item.product).length})
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography>Rs.{calculateTotal().toFixed(2)}</Typography>
                      </Grid>
                      
                      <Grid item xs={8}>
                        <Typography color="text.secondary">Shipping</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography>Free</Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={8}>
                        <Typography variant="h6">Total</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          Rs.{calculateTotal().toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={prevStep}
                      sx={{ 
                        px: 4,
                        borderRadius: 8
                      }}
                    >
                      Back to Products
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      disabled={loading}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 8,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderForm; 