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
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  History as HistoryIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon,
  KeyboardReturn as RefundIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportMenuAnchor, setReportMenuAnchor] = useState(null);
  const { user } = useAuth();
  
  // New states for refund functionality
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user?._id) {
        console.log('No user ID found:', user);
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('Token present:', !!token);
        
        const response = await api.get('/orders/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response received:', response.status);
        
        if (response.data) {
          console.log('Orders found:', response.data.length);
          // Log more details about orders to debug refund button visibility
          response.data.forEach(order => {
            console.log(`Order ${order.orderNumber}:`, {
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
              refundStatus: order.refundStatus,
              refundEligible: (
                order.paymentStatus === 'paid' &&
                (order.orderStatus === 'completed' || order.orderStatus === 'processing') &&
                order.orderStatus !== 'cancelled' &&
                (!order.refundStatus || order.refundStatus === 'not_applicable')
              )
            });
          });
          setOrders(response.data);
        } else {
          console.log('No orders found');
          setOrders([]);
        }
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          token: !!localStorage.getItem('token')
        });
        setError(error.response?.data?.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user]);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Report generation functions
  const handleReportMenuOpen = (event) => {
    setReportMenuAnchor(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setReportMenuAnchor(null);
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('Order History Report', 15, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    
    // Prepare table data
    const tableColumn = [
      "Order #",
      "Date",
      "Items",
      "Amount",
      "Status"
    ];
    
    const tableRows = orders.map(order => [
      order.orderNumber || 'N/A',
      new Date(order.date).toLocaleDateString(),
      order.items.map(item => `${item.productName} (${item.quantity})`).join('\n'),
      `$${order.totalAmount.toFixed(2)}`,
      order.orderStatus
    ]);

    // Generate table with autoTable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Order number
        1: { cellWidth: 25 }, // Date
        2: { cellWidth: 70 }, // Items
        3: { cellWidth: 25 }, // Amount
        4: { cellWidth: 25 }  // Status
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save the PDF
    doc.save(`order_history_${new Date().getTime()}.pdf`);
    handleReportMenuClose();
  };

  const generateExcelReport = () => {
    // Prepare data
    const excelData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Items': order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
      'Total Amount': `$${order.totalAmount.toFixed(2)}`,
      'Order Status': order.orderStatus,
      'Payment Status': order.paymentStatus,
      'Date': new Date(order.date).toLocaleDateString()
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Order History');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'order_history_report.xlsx');
    handleReportMenuClose();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order History Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { 
              border-collapse: collapse; 
              width: 100%;
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            th { 
              background-color: #2980b9; 
              color: white;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { 
              text-align: center;
              margin-bottom: 30px;
            }
            .date { 
              text-align: right;
              color: #666;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Order History Report</h2>
          </div>
          <div class="date">
            Generated on: ${new Date().toLocaleDateString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}</td>
                  <td>$${order.totalAmount.toFixed(2)}</td>
                  <td>${order.orderStatus}</td>
                  <td>${order.paymentStatus}</td>
                  <td>${new Date(order.date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };

    handleReportMenuClose();
  };

  // New function to check if an order is eligible for refund
  const isRefundEligible = (order) => {
    // Order must be paid and either completed or processing status
    // And not already cancelled or refunded
    return (
      order.paymentStatus === 'paid' &&
      (order.orderStatus === 'completed' || order.orderStatus === 'processing') &&
      order.orderStatus !== 'cancelled' &&
      (!order.refundStatus || order.refundStatus === 'not_applicable')
    );
  };

  // New function to handle opening refund dialog
  const handleOpenRefundDialog = (order) => {
    setSelectedOrder(order);
    setRefundReason('');
    setRefundDialogOpen(true);
  };

  // New function to handle closing refund dialog
  const handleCloseRefundDialog = () => {
    setRefundDialogOpen(false);
    setSelectedOrder(null);
  };

  // New function to handle submitting refund request
  const handleSubmitRefundRequest = async () => {
    if (!selectedOrder || !refundReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for your refund request',
        severity: 'error'
      });
      return;
    }

    try {
      setRefundProcessing(true);
      const response = await api.post(`/orders/${selectedOrder._id}/refund-request`, {
        reason: refundReason
      });

      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, refundStatus: 'pending', refundReason } 
            : order
        )
      );

      setSnackbar({
        open: true, 
        message: 'Refund request submitted successfully',
        severity: 'success'
      });
      handleCloseRefundDialog();
    } catch (error) {
      console.error('Error requesting refund:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit refund request',
        severity: 'error'
      });
    } finally {
      setRefundProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Generate Report">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleReportMenuOpen}
                  sx={{
                    bgcolor: theme.palette.success.main,
                    '&:hover': { bgcolor: theme.palette.success.dark }
                  }}
                >
                  Generate Report
                </Button>
              </Tooltip>
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
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }} id="orderHistoryTable">
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
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
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
                          
                          {/* Refund Request Button */}
                          {isRefundEligible(order) && (
                            <Tooltip title="Request Refund">
                              <IconButton 
                                color="error"
                                onClick={() => handleOpenRefundDialog(order)}
                                sx={{ 
                                  '&:hover': { 
                                    transform: 'scale(1.1)',
                                    bgcolor: theme.palette.error.light 
                                  }
                                }}
                              >
                                <RefundIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Show refund status if applicable */}
                          {order.refundStatus && order.refundStatus !== 'not_applicable' && (
                            <Tooltip title={
                              order.refundStatus === 'processed' ? 'Your refund has been processed and should reflect in your payment method within 3-5 business days.' :
                              order.refundStatus === 'pending' ? 'Your refund request is being reviewed by our team.' :
                              order.refundStatus === 'rejected' ? 'Your refund request was declined. Please contact customer support for more information.' :
                              'Refund status: ' + order.refundStatus
                            }>
                              <Chip 
                                label={
                                  order.refundStatus === 'processed' ? 'Refunded' :
                                  order.refundStatus === 'pending' ? 'Refund Pending' :
                                  order.refundStatus === 'rejected' ? 'Refund Declined' :
                                  order.refundStatus
                                }
                                color={
                                  order.refundStatus === 'processed' ? 'success' :
                                  order.refundStatus === 'pending' ? 'warning' : 'error'
                                }
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Tooltip>
                          )}
                        </Box>
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
        </CardContent>
      </Card>

      {/* Report Generation Menu */}
      <Menu
        anchorEl={reportMenuAnchor}
        open={Boolean(reportMenuAnchor)}
        onClose={handleReportMenuClose}
      >
        <MenuItem onClick={generatePdfReport}>
          <PdfIcon sx={{ mr: 1, color: theme.palette.error.main }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={generateExcelReport}>
          <ExcelIcon sx={{ mr: 1, color: theme.palette.success.main }} />
          Export as Excel
        </MenuItem>
        <MenuItem onClick={printReport}>
          <PrintIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Print Report
        </MenuItem>
      </Menu>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onClose={handleCloseRefundDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
          Request Refund
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Order Number:</strong> {selectedOrder.orderNumber}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Reason for Refund Request"
                  fullWidth
                  multiline
                  rows={4}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please explain why you're requesting a refund..."
                  required
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Your refund request will be reviewed by our team. You will be notified once it's processed.
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseRefundDialog} 
            color="inherit"
            disabled={refundProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRefundRequest} 
            variant="contained" 
            color="error"
            disabled={refundProcessing || !refundReason.trim()}
            sx={{ minWidth: 100 }}
          >
            {refundProcessing ? <CircularProgress size={24} /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory; 