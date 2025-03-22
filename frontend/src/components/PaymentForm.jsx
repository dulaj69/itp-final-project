import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const PaymentForm = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    try {
      await api.post('/payments/process', {
        orderId,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod
      });
      // Handle successful payment
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Process Payment</h2>
      {/* Payment form fields */}
    </div>
  );
};

export default PaymentForm; 