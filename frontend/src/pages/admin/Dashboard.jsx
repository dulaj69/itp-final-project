import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import api from '../../services/api';
import StatsCard from '../../components/admin/StatsCard';
import UsersTable from '../../components/admin/UsersTable';
import OrdersTable from '../../components/admin/OrdersTable';
import PaymentsTable from '../../components/admin/PaymentsTable';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      pendingOrders: 0
    },
    users: [],
    orders: [],
    payments: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [stats, users, orders, payments] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/orders'),
        api.get('/api/admin/payments')
      ]);

      setData({
        stats: stats.data,
        users: users.data,
        orders: orders.data,
        payments: payments.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={data.stats.totalUsers}
            icon={<UserIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Orders"
            value={data.stats.totalOrders}
            icon={<ShoppingCart />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`$${data.stats.totalRevenue.toFixed(2)}`}
            icon={<PaymentIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Orders"
            value={data.stats.pendingOrders}
            icon={<StatsIcon />}
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Orders" />
          <Tab label="Users" />
          <Tab label="Payments" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <OrdersTable 
              orders={data.orders}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
          {tabValue === 1 && (
            <UsersTable users={data.users} />
          )}
          {tabValue === 2 && (
            <PaymentsTable payments={data.payments} />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 