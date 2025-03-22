import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Typography,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import StatsCard from '../components/StatsCard';
import OrdersTable from '../components/OrdersTable';
import UsersTable from '../components/UsersTable';
import PaymentsTable from '../components/PaymentsTable';

const DashboardPage = () => {
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

  const theme = useTheme();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [stats, users, orders, payments] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/orders'),
        api.get('/admin/payments')
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

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: theme.palette.grey[100],
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ p: 3, overflow: 'auto', height: 'calc(100vh - 76px)' }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <UserIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShoppingCart sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Orders</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.stats.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              bgcolor: theme.palette.warning.light,
              color: theme.palette.warning.contrastText,
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PaymentIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  ${data.stats.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              bgcolor: theme.palette.info.light,
              color: theme.palette.info.contrastText,
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <StatsIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Pending Orders</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.stats.pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Table Section */}
        <Paper 
          sx={{ 
            height: 'calc(100vh - 250px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.background.paper,
              px: 2,
              minHeight: 48
            }}
          >
            <Tab 
              label="Orders" 
              icon={<ShoppingCart />} 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              label="Users" 
              icon={<UserIcon />} 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              label="Payments" 
              icon={<PaymentIcon />} 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {tabValue === 0 && (
              <OrdersTable 
                orders={data.orders}
                onUpdateStatus={handleUpdateStatus}
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
      </Box>
    </Box>
  );
};

export default DashboardPage; 