import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import OrderForm from './components/OrderForm';
import PaymentForm from './components/PaymentForm';
import OrderTracking from './components/OrderTracking';
import OrderHistory from './components/OrderHistory';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<OrderForm />} />
            <Route path="/payment/:orderId" element={<PaymentForm />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/track/:orderId" element={<OrderTracking />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
