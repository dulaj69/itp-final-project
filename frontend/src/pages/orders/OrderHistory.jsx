import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  useTheme,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  History as HistoryIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return statusColors[status.toLowerCase()] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: theme.palette.grey[100],
        p: 4,
        overflow: 'auto'
      }}
    >
      <Card
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          borderRadius: 3,
          boxShadow: theme.shadows[10]
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Order History
              </Typography>
            </Box>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HomeIcon />
            </IconButton>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Order Number</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Order Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => (
                        <TableRow 
                          key={order._id}
                          hover
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: theme.palette.action.hover }
                          }}
                        >
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>
                            {order.items.map(item => 
                              `${item.productName} (${item.quantity})`
                            ).join(', ')}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                            ${order.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={order.orderStatus}
                              color={getStatusColor(order.orderStatus)}
                              size="small"
                              sx={{ fontWeight: 'medium' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={order.paymentStatus}
                              color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 'medium' }}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary"
                              onClick={() => navigate(`/track/${order._id}`)}
                              sx={{ 
                                '&:hover': { 
                                  transform: 'scale(1.1)',
                                  bgcolor: theme.palette.primary.light 
                                }
                              }}
                            >
                              <NavigateNextIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={orders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderHistory; 