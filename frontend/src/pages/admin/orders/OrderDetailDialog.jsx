import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import api from '../../../services/api';

const OrderDetailDialog = ({ open, order, onClose, refreshOrders }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'paid': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleCancelOrder = async (withRefund = false) => {
    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const endpoint = withRefund 
        ? `/api/admin/orders/${order._id}/cancel-with-refund` 
        : `/api/admin/orders/${order._id}/cancel`;
      
      const response = await api.put(endpoint, { 
        reason: cancellationReason 
      });

      setSuccess(response.data.message || 'Order cancelled successfully');
      refreshOrders();

      // If order was cancelled but needs manual refund processing
      if (response.data.requiresRefund && !withRefund) {
        setProcessingRefund(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(`/api/payments/refund/${order._id}`);
      
      setSuccess(response.data.message || 'Refund processed successfully');
      setProcessingRefund(false);
      refreshOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Order Details - {order.orderNumber}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
            <Typography>Name: {order.user?.name || 'N/A'}</Typography>
            <Typography>Email: {order.user?.email || 'N/A'}</Typography>
            <Typography>Order Date: {new Date(order.createdAt).toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Order Status</Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography mr={1}>Order Status:</Typography>
              <Chip 
                label={order.orderStatus} 
                color={getStatusColor(order.orderStatus)} 
                size="small" 
              />
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography mr={1}>Payment Status:</Typography>
              <Chip 
                label={order.paymentStatus} 
                color={getStatusColor(order.paymentStatus)} 
                size="small" 
              />
            </Box>
            {order.refundStatus && order.refundStatus !== 'not_applicable' && (
              <Box display="flex" alignItems="center">
                <Typography mr={1}>Refund Status:</Typography>
                <Chip 
                  label={order.refundStatus} 
                  color={order.refundStatus === 'processed' ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List disablePadding>
                {order.items.map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={item.productName}
                      secondary={`Quantity: ${item.quantity} | Price: $${item.price?.toFixed(2) || '0.00'}`}
                    />
                    <Typography variant="body2">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${order.totalAmount.toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Cancel Order</Typography>
              <TextField
                label="Cancellation Reason"
                fullWidth
                margin="normal"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={loading}
                required
              />

              <Box mt={2} display="flex" justifyContent="flex-start" gap={2}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleCancelOrder(false)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Cancel Order'}
                </Button>

                {order.paymentStatus === 'paid' && (
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => handleCancelOrder(true)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Cancel & Refund'}
                  </Button>
                )}
              </Box>
            </Grid>
          )}

          {processingRefund && (
            <Grid item xs={12}>
              <Alert severity="info">
                The order has been cancelled but the refund needs to be processed.
              </Alert>
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleProcessRefund}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Process Refund'}
                </Button>
              </Box>
            </Grid>
          )}

          {order.cancellationReason && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Cancellation Details</Typography>
              <Typography><strong>Reason:</strong> {order.cancellationReason}</Typography>
              <Typography><strong>Date:</strong> {new Date(order.cancellationDate).toLocaleString()}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog; 