import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import api from '../../../services/api';
import AdminNav from '../components/AdminNav';

const RefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      // Get all orders with refund status processed or pending
      const response = await api.get('/api/admin/orders');
      
      // Make sure to properly filter orders with refund status
      const refundedOrders = response.data.filter(
        order => order.refundStatus && 
        order.refundStatus !== 'not_applicable'
      );
      
      console.log('Refund orders:', refundedOrders);
      setRefunds(refundedOrders);
      setError(null);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError('Failed to load refund data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setLoading(true);
      
      if (status === 'rejected') {
        setSelectedRefund(refunds.find(refund => refund._id === orderId));
        setRejectionDialogOpen(true);
        setLoading(false);
        return;
      }
      
      const endpoint = status === 'processed' 
        ? `/api/payments/refund/${orderId}`
        : `/api/admin/orders/${orderId}/update-refund-status`;
      
      const payload = { status };
      
      const response = await api.post(endpoint, payload);
      
      setSuccess(`Refund status updated to ${status} successfully`);
      
      // Refresh the data after processing
      fetchRefunds();
    } catch (error) {
      console.error('Error updating refund status:', error);
      setError(error.response?.data?.message || 'Failed to update refund status');
      setLoading(false);
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedRefund || !rejectionReason.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await api.post(`/api/admin/orders/${selectedRefund._id}/reject-refund`, {
        reason: rejectionReason
      });
      
      setSuccess('Refund request rejected successfully');
      setRejectionDialogOpen(false);
      setSelectedRefund(null);
      setRejectionReason('');
      
      // Refresh the data
      fetchRefunds();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      setError(error.response?.data?.message || 'Failed to reject refund');
      setLoading(false);
    }
  };

  const handleCloseRejectionDialog = () => {
    setRejectionDialogOpen(false);
    setSelectedRefund(null);
    setRejectionReason('');
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading && refunds.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AdminNav currentPath={location.pathname} />
      <Typography variant="h4" sx={{ mb: 4 }}>Refunds Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={fetchRefunds}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Refresh Refunds"}
        </Button>
      </Box>

      {refunds.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No refunds found</Typography>
          <Typography variant="body1" color="textSecondary">
            There are no cancelled orders with refunds in the system.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Refund Reason</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refunds.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.name || 'N/A'}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{order.refundReason || 'N/A'}</TableCell>
                  <TableCell>
                    {order.refundRequestDate 
                      ? new Date(order.refundRequestDate).toLocaleString()
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                      color={getRefundStatusColor(order.refundStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.refundStatus === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={() => handleUpdateStatus(order._id, 'processed')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => handleUpdateStatus(order._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={handleCloseRejectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Refund Request</DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Order:</strong> {selectedRefund.orderNumber}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Amount:</strong> ${selectedRefund.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                Please provide a reason for rejecting this refund request.
              </Typography>
              
              <TextField
                label="Rejection Reason"
                fullWidth
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? "Reason is required" : ""}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectionDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleRejectRefund} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RefundsPage; 