import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../../components/Order/OrderForm';
import StripePayment from '../../components/Payment/StripePayment';
import api from '../../services/api';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const handleOrderSubmit = async (data) => {
    try {
      const response = await api.post('/orders', data);
      setOrderId(response.data._id);
      setOrderData(data);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handlePaymentSuccess = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {!orderId ? (
          <>
            <Typography variant="h4" gutterBottom>
              Create New Order
            </Typography>
            <OrderForm onSubmit={handleOrderSubmit} />
          </>
        ) : (
          <StripePayment
            orderId={orderId}
            amount={orderData.totalAmount}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </Box>
    </Container>
  );
};

export default CreateOrder; 