import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import api from '../../services/api';

const PaymentForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    cardDetails: {
      number: '',
      expiryDate: '',
      cvv: ''
    }
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.paymentStatus === 'paid') {
        navigate(`/track/${orderId}`);
        return;
      }
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const paymentRequest = {
        orderId,
        amount: order.totalAmount,
        paymentMethod: paymentData.paymentMethod,
        cardDetails: paymentData.cardDetails
      };

      await api.post('/payments/process', paymentRequest);
      navigate(`/track/${orderId}`);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm">
        <Alert severity="warning" sx={{ mt: 4 }}>Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Payment Details
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Order Summary</Typography>
            <Typography>Order Number: {order.orderNumber}</Typography>
            <Typography>Total Amount: ${order.totalAmount.toFixed(2)}</Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel>Payment Method</FormLabel>
              <RadioGroup
                value={paymentData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <FormControlLabel 
                  value="credit_card" 
                  control={<Radio />} 
                  label="Credit Card" 
                />
                <FormControlLabel 
                  value="debit_card" 
                  control={<Radio />} 
                  label="Debit Card" 
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Card Number"
                value={paymentData.cardDetails.number}
                onChange={(e) => handleInputChange('cardDetails.number', e.target.value)}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={paymentData.cardDetails.expiryDate}
                    onChange={(e) => handleInputChange('cardDetails.expiryDate', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    type="password"
                    value={paymentData.cardDetails.cvv}
                    onChange={(e) => handleInputChange('cardDetails.cvv', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Pay Now'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentForm; 