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
  Chip
} from '@mui/material';
import {
  LocalShipping,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ShippingTracking = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const steps = [
    { label: 'Order Placed', icon: <PendingIcon color="primary" /> },
    { label: 'Processing', icon: <InventoryIcon color="primary" /> },
    { label: 'Shipped', icon: <ShippingIcon color="primary" /> },
    { label: 'Delivered', icon: <DeliveredIcon color="primary" /> }
  ];

  useEffect(() => {
    fetchShippingOrders();
  }, []);

  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/shipping-status');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch shipping details');
      console.error('Error fetching shipping details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const statusIndex = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3
    };
    return statusIndex[status.toLowerCase()] || 0;
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: theme.palette.grey[100],
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card sx={{ 
        m: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[10],
        height: 'calc(100vh - 48px)', // 48px accounts for the margin (24px * 2)
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ 
          p: 3,
          flexShrink: 0  // Header won't shrink
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShipping sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Shipping Tracking
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
                }
              }}
            >
              <HomeIcon />
            </IconButton>
          </Box>
        </CardContent>

        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          px: 3,
          pb: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.grey[500],
            },
          },
        }}>
          {orders.map((order) => (
            <Paper 
              key={order._id} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                '&:hover': { 
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Number: <strong>{order.orderNumber}</strong>
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Status: 
                    <Chip 
                      label={order.paymentStatus}
                      color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong>
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Stepper 
                activeStep={getStepIndex(order.orderStatus)} 
                alternativeLabel
                sx={{ 
                  mb: 3,
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

              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Order Items
              </Typography>

              <Grid container spacing={2}>
                {order.items.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: theme.palette.grey[50]
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default ShippingTracking; 