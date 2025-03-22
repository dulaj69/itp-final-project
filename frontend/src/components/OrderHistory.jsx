import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                <p className="text-gray-600">
                  Status: <span className="font-medium">{order.orderStatus}</span>
                </p>
                <p className="text-gray-600">
                  Total: ${order.totalAmount}
                </p>
              </div>
              <div className="space-x-2">
                <Link
                  to={`/track/${order._id}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Track Order
                </Link>
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <ul className="list-disc list-inside">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.productName} x {item.quantity} - ${item.subtotal}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Ordered on: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory; 