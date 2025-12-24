import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  IconButton,
  Paper,
  Chip,
  Container,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Schedule,
  Inventory,
  CheckCircle,
  LocationOn,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ShippingTracking = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const steps = [
    { label: 'Pending', icon: <Schedule /> },
    { label: 'Processing', icon: <Inventory /> },
    { label: 'Shipped', icon: <LocalShipping /> },
    { label: 'Delivered', icon: <CheckCircle /> }
  ];

  useEffect(() => {
    if (!user?._id) {
      navigate('/login');
      return;
    }
    fetchShippingOrders();
  }, [user, navigate]);

  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/orders/user-shipping/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch shipping details');
      console.error('Error fetching shipping details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.label.toLowerCase() === status.toLowerCase());
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          width: '100%',
          position: 'relative',
          left: -100
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          p: 4,
          position: 'relative',
          left: -100
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 2, maxWidth: 800 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: theme.palette.grey[100],
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        left: -100
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1000px',
          mx: 'auto'
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalShipping sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  Shipping Status
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Dashboard />
              </IconButton>
            </Box>
          </Paper>

          {orders.map((order) => (
            <Paper 
              key={order._id}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2,
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.grey[300]}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationOn sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/track/${order._id}`)}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3
                      }}
                    >
                      Track Details
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Payment Status: 
                      <Chip 
                        label={order.paymentStatus}
                        color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="subtitle1">
                      Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong>
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Stepper 
                    activeStep={getStepIndex(order.orderStatus)} 
                    alternativeLabel
                    sx={{ 
                      my: 3,
                      '& .MuiStepLabel-root .Mui-completed': {
                        color: theme.palette.success.main
                      },
                      '& .MuiStepLabel-root .Mui-active': {
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    {steps.map((step) => (
                      <Step key={step.label}>
                        <StepLabel StepIconComponent={() => step.icon}>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ShippingTracking; 