import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Payments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnpaidOrders();
  }, []);

  const fetchUnpaidOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/pending-payments');
      setUnpaidOrders(response.data);
    } catch (err) {
      setError('Failed to fetch pending payments');
      console.error('Error fetching pending payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.grey[100],
        py: 4,
        px: { xs: 2, sm: 4 },
        overflow: 'auto',
        position: 'relative',
        left: -80,
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Card sx={{ 
        width: '100%',
        maxWidth: 1200, 
        borderRadius: 3, 
        boxShadow: theme.shadows[10],
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ p: 4, flexGrow: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PaymentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Pending Payments
              </Typography>
            </Box>
            <IconButton
              onClick={() => navigate('/dashboard')}
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
              <Dashboard />
            </IconButton>
          </Box>
        </CardContent>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', px: 4, pb: 4 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.grey[100] }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unpaidOrders.map((order) => (
                  <TableRow 
                    key={order._id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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
                        label="Unpaid"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<NavigateNextIcon />}
                        onClick={() => navigate(`/payment/${order._id}`)}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: theme.palette.primary.main,
                          '&:hover': { 
                            bgcolor: theme.palette.primary.dark,
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        PAY NOW
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default Payments; 