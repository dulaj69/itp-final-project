import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OrderTracking = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState({});

  useEffect(() => {
    fetchOrderStatus();
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch order status:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-xl font-semibold mb-4">Order Status</h3>
      {/* Status tracking UI */}
    </div>
  );
};

export default OrderTracking; 