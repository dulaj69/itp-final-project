import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Alert,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Receipt,
  AccessTime,
  Email,
  ShoppingBag,
  LocationOn,
  Payment,
  Home as HomeIcon
} from '@mui/icons-material';
import api from '../../services/api';

const OrderConfirmation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleEmailReceipt = async () => {
    setEmailSending(true);
    try {
      console.log('Sending email receipt for order:', orderId);
      
      const response = await api.post('/orders/email-receipt', {
        orderId,
        email: order?.user?.email || order?.customerEmail,
        orderDetails: {
          orderNumber: order?.orderNumber,
          items: order?.items,
          totalAmount: order?.totalAmount,
          shippingAddress: order?.shippingAddress,
          orderDate: order?.createdAt
        }
      });
      
      console.log('Email receipt response:', response.data);

      if (response.data.success) {
        setEmailStatus({
          type: 'success',
          message: 'Receipt sent to your email successfully!'
        });
      } else {
        throw new Error(response.data.message || 'Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      setEmailStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send receipt. Please try again.'
      });
    } finally {
      setEmailSending(false);
      setTimeout(() => setEmailStatus(null), 5000);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        width="100vw"
        sx={{ background: 'linear-gradient(120deg, #f0f2ff 0%, #e6e9ff 100%)' }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        p: { xs: 2, md: 4 },
        '& .MuiCard-root': {
          overflow: 'visible'
        }
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2,
              animation: 'pulse 2s infinite'
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: '#fff' }} />
          </Box>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.dark">
            Order Confirmed!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for your purchase. Your order has been successfully placed.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ShoppingBag sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    Order Details
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Order Number
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {order?.orderNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      ${order?.totalAmount?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={3} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationOn sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    Shipping Information
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {order?.shippingAddress?.street}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.state}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {order?.shippingAddress?.zipCode}
                </Typography>
                
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6">
                    Estimated Delivery: 3-5 Business Days
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 4, 
                position: 'sticky', 
                top: 24,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Payment sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    Payment Status
                  </Typography>
                </Box>
                <Chip
                  label={order?.paymentStatus?.toUpperCase()}
                  color="success"
                  size="large"
                  sx={{ fontSize: '1.2rem', py: 3, width: '100%', mb: 3 }}
                />
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Receipt />}
                    onClick={() => window.print()}
                    sx={{ py: 2 }}
                  >
                    Print Receipt
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Email />}
                    onClick={handleEmailReceipt}
                    disabled={emailSending}
                    sx={{ py: 2 }}
                  >
                    {emailSending ? 'Sending...' : 'Email Receipt'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-section, #receipt-section * {
              visibility: visible;
            }
            #receipt-section {
              position: absolute;
              left: 0;
              top: 0;
            }
          }
        `}
      </style>
      
      {emailStatus && (
        <Snackbar
          open={Boolean(emailStatus)}
          autoHideDuration={5000}
          onClose={() => setEmailStatus(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={emailStatus.type} 
            onClose={() => setEmailStatus(null)}
            sx={{ width: '100%' }}
          >
            {emailStatus.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default OrderConfirmation; 