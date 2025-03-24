import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import OrderForm from './pages/orders/OrderForm';
import OrderTracking from './pages/orders/OrderTracking';
import OrderHistory from './pages/orders/OrderHistory';
import AdminDashboard from './pages/admin/dashboard/DashboardPage';
import Payments from './pages/payments/Payments';
import ShippingTracking from './pages/shipping/ShippingTracking';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CreateOrder from './pages/orders/CreateOrder';
import OrderConfirmation from './pages/orders/OrderConfirmation';
import Navbar from './components/Navigation/Navbar';
import PaymentPage from './pages/payments/PaymentPage';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AdminRoute = ({ children }) => {
  // Implement admin route logic here
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <BrowserRouter>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/order/new" element={<OrderForm />} />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/track/:orderId" element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={<Payments />} />
            <Route path="/shipping" element={<ShippingTracking />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
