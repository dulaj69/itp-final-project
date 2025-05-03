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
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import HomePage from './pages/Home/HomePage';
import AddProductPage from './pages/admin/products/AddProductPage';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <BrowserRouter>
            <CssBaseline />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes with Dashboard Layout */}
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/order/new" element={<OrderForm />} />
                <Route path="/track/:orderId" element={<OrderTracking />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/shipping" element={<ShippingTracking />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products/new" element={<AdminRoute><AddProductPage /></AdminRoute>} />
              </Route>
              
              {/* Routes with different layouts */}
              <Route path="/create-order" element={<CreateOrder />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/payment/:orderId" element={<PaymentPage />} />
              
              {/* Admin redirect */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
