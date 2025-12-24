import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Divider,
  Paper,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ArrowBack,
  ShoppingCart,
  ShoppingBag,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import headerImg from '../../assets/header_img.png';
import logo from '../../assets/logo.png';

import food1 from '../../assets/food_1.png';
import food2 from '../../assets/food_2.png';
import food3 from '../../assets/food_3.png';
import food4 from '../../assets/food_4.png';
import food5 from '../../assets/food_5.png';
import food6 from '../../assets/food_6.png';
import food7 from '../../assets/food_7.png';
import food8 from '../../assets/food_8.png';
import food9 from '../../assets/food_9.png';
import food10 from '../../assets/food_10.png';

import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, changeQuantity, removeFromCart, clearCart, error } = useCart();
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      const savedCart = localStorage.getItem('cart');
      console.log('Raw cart data from localStorage:', savedCart);
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        if (Array.isArray(parsedCart)) {
          console.log('Successfully loaded cart with', parsedCart.length, 'items');
          const validCart = parsedCart.filter(item => item && item.name && item.price && item.quantity);
          if (validCart.length > 0) {
            changeQuantity(validCart);
          } else {
            changeQuantity([]);
          }
          
          if (validCart.length !== parsedCart.length) {
            console.warn('Some cart items were filtered out due to missing data');
          }
        } else {
          console.error('Cart is not an array:', parsedCart);
          setError('Invalid cart data. Your cart has been reset.');
          localStorage.removeItem('cart');
          changeQuantity([]);
        }
      } else {
        console.log('No cart data found in localStorage');
        changeQuantity([]);
      }
    } catch (err) {
      console.error('Error parsing cart from localStorage:', err);
      setError('Error loading your cart. Your cart has been reset.');
      localStorage.removeItem('cart');
      changeQuantity([]);
    } finally {
      setLoading(false);
    }
  }, [changeQuantity]);

  const openDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/products/${itemToDelete._id || itemToDelete.id}/release`, { quantity: itemToDelete.quantity });
        removeFromCart(itemToDelete);
        setSnackbarMessage(`${itemToDelete.name} removed from cart`);
        setSnackbarOpen(true);
      } catch (err) {
        setError('Stock release failed: ' + (err.response?.data?.message || err.message));
      }
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setSnackbarMessage('Cart cleared successfully');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Stock release failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SPICE10') {
      setCouponApplied(true);
      setCouponDiscount(10); 
      setError('');
    } else {
      setCouponApplied(false);
      setCouponDiscount(0);
      setError('Invalid coupon code');
    }
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = couponApplied ? (subtotal * couponDiscount / 100) : 0;
  const shippingCost = subtotal > 0 ? 400 : 0;
  const total = subtotal - discountAmount + shippingCost;

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const orderItems = cart.map(item => ({
      product: item._id || item.id,
      quantity: item.quantity,
      price: item.price
    }));

    localStorage.setItem('orderItems', JSON.stringify(orderItems));
    localStorage.setItem('orderTotal', total.toString());
    
    navigate('/login');
  };

  const getItemImage = (item) => {
    if (item.image && typeof item.image === 'string' && item.image.startsWith('default-image-')) {
      const index = parseInt(item.image.replace('default-image-', ''), 10);
      const defaultImages = [food1, food2, food3, food4, food5, food6, food7, food8, food9, food10];
      if (index >= 0 && index < defaultImages.length) {
        return defaultImages[index];
      }
    }
    if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) return item.image;
    if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) return item.imageUrl;
    if (item.cloudinary && item.cloudinary.url && typeof item.cloudinary.url === 'string' && item.cloudinary.url.startsWith('http')) return item.cloudinary.url;
    return 'https://via.placeholder.com/60x60?text=Spice';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#ba6a34' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fff',
      pb: 6,
      width: '100vw',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Box 
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${headerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          width: '100%'
        }}
      >
        <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6, lg: 8 }, maxWidth: { xl: '1800px' }, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={logo} alt="Spice Logo" style={{ height: 50, filter: 'brightness(0) invert(1)' }} />
            <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 700 }}>
              Your Cart
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6, lg: 8 }, maxWidth: { xl: '1800px' }, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            component={Link}
            to="/"
            sx={{ color: '#ba6a34' }}
          >
            Continue Shopping
          </Button>
          {cart.length > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleClearCart}
              sx={{ color: 'error.main' }}
            >
              Clear Cart
            </Button>
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => {
              try {
                setLoading(true);
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                  const parsedCart = JSON.parse(savedCart);
                  if (Array.isArray(parsedCart)) {
                    changeQuantity(parsedCart);
                    setSnackbarMessage("Cart refreshed successfully");
                    setSnackbarOpen(true);
                  } else {
                    setError('Invalid cart data');
                  }
                } else {
                  changeQuantity([]);
                  setError('No cart data found');
                }
              } catch (err) {
                setError('Error refreshing cart');
              } finally {
                setLoading(false);
              }
            }}
            sx={{ color: '#555' }}
          >
            Refresh Cart
          </Button>
        </Box>

        {cart.length === 0 ? (
          <Paper sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center', 
            borderRadius: 2, 
            boxShadow: 3,
            mx: 'auto',
            maxWidth: '800px'
          }}>
            <ShoppingCart sx={{ fontSize: 80, color: '#ba6a34', opacity: 0.7, mb: 3 }} />
            <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Looks like you haven't added any spices to your cart yet.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/"
              size="large"
              sx={{ 
                bgcolor: '#ba6a34', 
                '&:hover': { bgcolor: '#9e5a2c' },
                px: 6,
                py: 1.5,
                borderRadius: 1,
                fontSize: '1rem'
              }}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Cart Items */}
            <Grid item xs={12} lg={8} xl={9}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                  Cart Items ({cart.length})
                </Typography>
                <Divider />
                
                <TableContainer sx={{ width: '100%' }}>
                  <Table sx={{ minWidth: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell width="40%">Product</TableCell>
                        <TableCell align="center" width="15%">Price</TableCell>
                        <TableCell align="center" width="20%">Quantity</TableCell>
                        <TableCell align="right" width="15%">Subtotal</TableCell>
                        <TableCell align="center" width="10%">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(cart.reduce((acc, item) => {
                        const quotaId = item.quotaId || 'default';
                        if (!acc[quotaId]) {
                          acc[quotaId] = {
                            items: [],
                            totalPrice: 0,
                            createdAt: item.createdAt || new Date().toISOString()
                          };
                        }
                        acc[quotaId].items.push(item);
                        acc[quotaId].totalPrice += item.price * item.quantity;
                        return acc;
                      }, {})).map(([quotaId, group]) => (
                        <React.Fragment key={quotaId}>
                          {group.items.map((item, index) => (
                            <TableRow key={item._id || item.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box 
                                    sx={{ 
                                      width: 60,
                                      height: 60,
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src={getItemImage(item)}
                                      alt={item.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    {item.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#ba6a34' }}>
                                  Rs.{item.price}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => changeQuantity(item, -1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                                    {item.quantity}
                                  </Typography>
                                  <IconButton 
                                    size="small"
                                    onClick={() => changeQuantity(item, 1)}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  Rs.{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton 
                                  color="error"
                                  size="small"
                                  onClick={() => openDeleteDialog(item)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, py: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  Group Total: Rs.{group.totalPrice.toFixed(2)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4} xl={3}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: 2, 
                height: '100%', 
                position: 'sticky', 
                top: 20 
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Order Summary
                </Typography>
                
                <List disablePadding>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Subtotal" />
                    <Typography variant="subtitle1">Rs.{subtotal.toFixed(2)}</Typography>
                  </ListItem>
                  
                  {couponApplied && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary={`Discount (${couponDiscount}%)`} />
                      <Typography variant="subtitle1" color="error.main">
                        -Rs.{discountAmount.toFixed(2)}
                      </Typography>
                    </ListItem>
                  )}
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Shipping" />
                    <Typography variant="subtitle1">Rs.{shippingCost.toFixed(2)}</Typography>
                  </ListItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ba6a34' }}>
                      Rs.{total.toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Coupon Code"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleApplyCoupon}
                      sx={{ 
                        borderColor: '#ba6a34',
                        color: '#ba6a34',
                        '&:hover': { borderColor: '#9e5a2c', bgcolor: 'rgba(186, 106, 52, 0.1)' }
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={handleCheckout}
                    sx={{ 
                      bgcolor: '#ba6a34', 
                      py: 1.5,
                      '&:hover': { bgcolor: '#9e5a2c' }
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Box>
              </Paper>
            </Grid>

          
          </Grid>
        )}
      </Container>
      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{itemToDelete?.name}" from your cart?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteItem} color="error">Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage; 