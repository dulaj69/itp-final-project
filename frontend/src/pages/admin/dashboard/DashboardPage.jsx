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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Badge,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputLabel
} from '@mui/material';
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  SettingsBackupRestore as RefundIcon,
  Notifications as NotificationIcon,
  Inventory as ProductIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../../services/api';
import StatsCard from '../components/StatsCard';
import OrdersTable from '../components/OrdersTable';
import UsersTable from '../components/UsersTable';
import PaymentsTable from '../components/PaymentsTable';
import jsPDF from "jspdf";
import "jspdf-autotable";
import AddUserPage from '../users/AddUserPage';
import NotificationsPage from '../NotificationsPage';
import ReportsPage from '../ReportsPage';
import BackupPage from '../BackupPage';
import QuotaPage from '../QuotaPage';
import InquiriesPage from '../InquiriesPage';

const DashboardPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      pendingOrders: 0,
      pendingRefunds: 0,
      totalProducts: 0
    },
    users: [],
    orders: [],
    payments: [],
    refundRequests: [],
    products: []
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [chatQAs, setChatQAs] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatSuccess, setChatSuccess] = useState('');
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [qaEditMode, setQaEditMode] = useState(false);
  const [qaForm, setQaForm] = useState({ question: '', answer: '', id: null });
  const [productFilters, setProductFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
  });

  const theme = useTheme();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First fetch the main data that's required
      const [stats, users, orders, payments] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/orders'),
        api.get('/admin/payments')
      ]);

      const refundRequests = orders.data.filter(
        order => order.refundStatus === 'pending'
      );

      // Set initial data without products
      const dashboardData = {
        stats: {
          ...stats.data,
          pendingRefunds: refundRequests.length,
          totalProducts: 0
        },
        users: users.data,
        orders: orders.data,
        payments: payments.data,
        refundRequests,
        products: []
      };

      setData(dashboardData);
      
      // Try to fetch products separately, so if it fails the dashboard will still work
      try {
        const products = await api.get('/products');
        setData(prevData => ({
          ...prevData,
          products: products.data,
          stats: {
            ...prevData.stats,
            totalProducts: products.data.length
          }
        }));
      } catch (productError) {
        console.log('Products API not available yet:', productError);
        // Continue without products data
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, type = 'order') => {
    try {
      setError('');
      let endpoint;
      let method;
      let payload;

      if (type === 'refund') {
        if (newStatus === 'processed') {
          endpoint = `/payments/refund/${orderId}`;
          method = 'post';
          payload = {};
        } else if (newStatus === 'rejected') {
          endpoint = `/admin/orders/${orderId}/reject-refund`;
          method = 'post';
          payload = { reason: 'Rejected by admin' };
        } else {
          endpoint = `/admin/orders/${orderId}/update-refund-status`;
          method = 'put';
          payload = { status: newStatus };
        }
      } else {
        // Order status update
        endpoint = `/admin/orders/${orderId}/status`;
        method = 'put';
        payload = { status: newStatus };
      }

      console.log('Updating status:', { orderId, newStatus, type, endpoint, method, payload });

      const response = await (method === 'post' 
        ? api.post(endpoint, payload)
        : api.put(endpoint, payload));

      console.log('Update response:', response.data);
      
      await fetchDashboardData(); // Refresh data after successful update
      setError(''); // Clear any existing error
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || `Failed to update ${type} status`);
    }
  };

  // Add this new function for handling refund status changes
  const handleRefundStatusChange = async (orderId, newStatus) => {
    try {
      await handleUpdateStatus(orderId, newStatus, 'refund');
    } catch (error) {
      console.error('Error updating refund status:', error);
      setError(error.response?.data?.message || 'Failed to update refund status');
    }
  };

  const generateUsersPdfReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Users Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Name", "Email", "Role", "Join Date"];
    const tableRows = data.users.map(user => [
      user.name,
      user.email,
      user.role,
      new Date(user.createdAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 }
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save('users_report.pdf');
  };

  const generateOrdersPdfReport = (filteredOrders, filters) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Orders Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    if (filters) {
      doc.setFontSize(10);
      doc.text('Applied Filters:', 14, 40);
      let yPos = 46;
      
      if (filters.orderStatus !== 'all') {
        doc.text(`Order Status: ${filters.orderStatus}`, 20, yPos);
        yPos += 6;
      }
      if (filters.paymentStatus !== 'all') {
        doc.text(`Payment Status: ${filters.paymentStatus}`, 20, yPos);
        yPos += 6;
      }
      if (filters.startDate) {
        doc.text(`From: ${filters.startDate}`, 20, yPos);
        yPos += 6;
      }
      if (filters.endDate) {
        doc.text(`To: ${filters.endDate}`, 20, yPos);
        yPos += 6;
      }
      if (filters.search) {
        doc.text(`Search: ${filters.search}`, 20, yPos);
        yPos += 6;
      }
    }
    
    const tableColumn = ["Order Number", "Customer", "Items", "Total Amount", "Payment Status", "Date"];
    const tableRows = filteredOrders.map(order => [
      order.orderNumber,
      order.user?.name || 'N/A',
      order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
      `$${order.totalAmount.toFixed(2)}`,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: filters ? 70 : 40,
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }     
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save('orders_report.pdf');
  };

  const generatePaymentsPdfReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Payments Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Transaction ID", "Order Number", "Customer", "Amount", "Method", "Status", "Date"];
    const tableRows = data.payments.map(payment => [
      payment.transactionId,
      payment.orderId?.orderNumber || 'N/A',
      payment.orderId?.user?.name || 'N/A',
      `$${payment.amount.toFixed(2)}`,
      payment.paymentMethod,
      payment.status,
      new Date(payment.createdAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save('payments_report.pdf');
  };

  const generateProductsPdfReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Products Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Product ID", "Name", "Category", "Price", "Stock", "Status"];
    const tableRows = data.products.map(product => [
      product._id,
      product.name,
      product.category,
      `$${product.price.toFixed(2)}`,
      product.stock,
      product.status || 'Active'
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save('products_report.pdf');
  };

  // Add this function to handle product deletion
  const handleDeleteProduct = async (productId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        return;
      }
      
      setError('');
      await api.delete(`/products/${productId}`);
      
      // Update the products list after deletion
      setData(prevData => ({
        ...prevData,
        products: prevData.products.filter(product => product._id !== productId),
        stats: {
          ...prevData.stats,
          totalProducts: prevData.products.length - 1
        }
      }));
      
      console.log('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      setFeedbackError('Failed to fetch feedbacks');
    }
  };

  const handleThank = async (id) => {
    try {
      await api.patch(`/feedback/${id}/thank`);
      setFeedbackSuccess('Feedback marked as thanked successfully');
      fetchFeedbacks();
    } catch (err) {
      setFeedbackError('Failed to update feedback status');
    }
  };

  // Fetch QAs
  const fetchChatQAs = async () => {
    setChatLoading(true);
    setChatError('');
    try {
      const res = await api.get('/chatbot/qa');
      setChatQAs(res.data);
    } catch (err) {
      setChatError('Failed to fetch Q&A pairs');
    } finally {
      setChatLoading(false);
    }
  };

  // Add/Edit Q&A
  const handleQaDialogOpen = (qa = null) => {
    if (qa) {
      setQaEditMode(true);
      setQaForm({ question: qa.question, answer: qa.answer, id: qa._id });
    } else {
      setQaEditMode(false);
      setQaForm({ question: '', answer: '', id: null });
    }
    setQaDialogOpen(true);
  };
  const handleQaDialogClose = () => {
    setQaDialogOpen(false);
    setQaForm({ question: '', answer: '', id: null });
  };
  const handleQaFormChange = (e) => {
    setQaForm({ ...qaForm, [e.target.name]: e.target.value });
  };
  const handleQaSubmit = async () => {
    try {
      if (qaEditMode) {
        await api.put(`/chatbot/qa/${qaForm.id}`, { question: qaForm.question, answer: qaForm.answer });
        setChatSuccess('Q&A updated successfully');
      } else {
        await api.post('/chatbot/qa', { question: qaForm.question, answer: qaForm.answer });
        setChatSuccess('Q&A added successfully');
      }
      fetchChatQAs();
      handleQaDialogClose();
    } catch (err) {
      setChatError('Failed to save Q&A');
    }
  };
  // Delete Q&A
  const handleQaDelete = async (id) => {
    if (!window.confirm('Delete this Q&A?')) return;
    try {
      await api.delete(`/chatbot/qa/${id}`);
      setChatSuccess('Q&A deleted');
      fetchChatQAs();
    } catch (err) {
      setChatError('Failed to delete Q&A');
    }
  };

  const handleProductFilterChange = (field, value) => {
    setProductFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearProductFilters = () => {
    setProductFilters({ search: '', category: 'all', status: 'all' });
  };

  const filteredProducts = data.products.filter(product => {
    const matchesSearch = productFilters.search === '' || product.name.toLowerCase().includes(productFilters.search.toLowerCase());
    const matchesCategory = productFilters.category === 'all' || product.category === productFilters.category;
    const matchesStatus = productFilters.status === 'all' || (product.status || 'Active') === productFilters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    fetchDashboardData();
    fetchFeedbacks();
    fetchChatQAs();
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
        minHeight: '100vh',
        width: '100vw',
        overflowY: 'auto',
        bgcolor: theme.palette.grey[100],
        pb: 10, // padding for footer
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
          <Grid item xs={12} sm={6} lg={2}>
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
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {data.stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
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
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {data.stats.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
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
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${data.stats.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
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
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {data.stats.pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
            <Card sx={{ 
              bgcolor: theme.palette.purple?.light || '#d1c4e9',
              color: theme.palette.purple?.contrastText || '#311b92',
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ProductIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Products</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {data.stats.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
            <Card sx={{ 
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
              boxShadow: theme.shadows[3],
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <RefundIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Pending Refunds</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {data.stats.pendingRefunds}
                  </Typography>
                  {data.stats.pendingRefunds > 0 && (
                    <Button 
                      variant="contained" 
                      size="small"
                      color="primary"
                      component={RouterLink}
                      to="/admin/refunds"
                      sx={{ 
                        bgcolor: 'white', 
                        color: theme.palette.error.main,
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.8)',
                          color: theme.palette.error.dark
                        }
                      }}
                    >
                      View All
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Paper 
          sx={{ 
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            borderRadius: 4,
            boxShadow: theme.shadows[2],
            p: 2,
            mb: 4,
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
              label={
                <Badge 
                  color="warning" 
                  badgeContent={data.stats.pendingOrders} 
                  showZero={false}
                >
                  Orders
                </Badge>
              } 
            />
            <Tab label="Users" />
            <Tab label="Payments" />
            <Tab 
              label={
                <Badge 
                  color="error" 
                  badgeContent={data.stats.pendingRefunds} 
                  showZero={false}
                >
                  Refunds
                </Badge>
              } 
            />
            <Tab
              label={
                <Badge
                  color="primary"
                  badgeContent={data.stats.totalProducts}
                  showZero={false}
                >
                  Products
                </Badge>
              }
            />
            <Tab label="Notifications" />
            <Tab label="Reports" />
            <Tab label="Add User" />
            <Tab label="Backup" />
            <Tab label="Quota" />
            <Tab label="Inquiries" />
            <Tab label="Feedback" />
            <Tab label="Chat" />
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
                onExportPdf={generateOrdersPdfReport}
              />
            )}
            {tabValue === 1 && (
              <UsersTable 
                users={data.users} 
                onExportPdf={generateUsersPdfReport}
                refreshUsers={fetchDashboardData}
              />
            )}
            {tabValue === 2 && (
              <PaymentsTable 
                payments={data.payments} 
                onExportPdf={generatePaymentsPdfReport}
              />
            )}
           {tabValue === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Refund Requests</Typography>
                  <Button 
                    variant="contained" 
                    color="error"
                    startIcon={<RefundIcon />}
                    component={RouterLink}
                    to="/admin/orders/refunds"
                  >
                    Manage All Refunds
                  </Button>
                </Box>

                {data.refundRequests.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <RefundIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6">No Pending Refund Requests</Typography>
                    <Typography variant="body1" color="textSecondary">
                      There are no refund requests awaiting your approval.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer>
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
                        {data.refundRequests.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{order.user?.name || 'N/A'}</TableCell>
                            <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              {order.refundReason 
                                ? (order.refundReason.length > 50 
                                  ? `${order.refundReason.substring(0, 50)}...` 
                                  : order.refundReason)
                                : 'Not specified'
                              }
                            </TableCell>
                            <TableCell>
                              {order.refundRequestDate 
                                ? new Date(order.refundRequestDate).toLocaleString()
                                : new Date(order.updatedAt).toLocaleString()
                              }
                            </TableCell>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={order.refundStatus}
                                  onChange={(e) => handleRefundStatusChange(order._id, e.target.value)}
                                  size="small"
                                  sx={{
                                    bgcolor: order.refundStatus === 'pending' ? theme.palette.warning.light :
                                           order.refundStatus === 'processed' ? theme.palette.success.light :
                                           theme.palette.error.light,
                                    '& .MuiSelect-select': {
                                      py: 1
                                    }
                                  }}
                                >
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="processed">Processed</MenuItem>
                                  <MenuItem value="rejected">Rejected</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              {order.refundStatus === 'pending' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => handleRefundStatusChange(order._id, 'processed')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => handleRefundStatusChange(order._id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                              <Button
                                variant="outlined"
                                size="small"
                                component={RouterLink}
                                to={`/admin/orders/refunds?id=${order._id}`}
                                sx={{ ml: order.refundStatus === 'pending' ? 1 : 0 }}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            {tabValue === 4 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Products Management</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<ProductIcon />}
                      component={RouterLink}
                      to="/admin/products/new"
                    >
                      Add New Product
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={generateProductsPdfReport}
                    >
                      Export PDF
                    </Button>
                  </Box>
                </Box>

                {/* Filter Bar */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Search Product Name"
                        value={productFilters.search}
                        onChange={e => handleProductFilterChange('search', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={productFilters.category}
                          label="Category"
                          onChange={e => handleProductFilterChange('category', e.target.value)}
                        >
                          <MenuItem value="all">All</MenuItem>
                          {[...new Set(data.products.map(p => p.category))].map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={productFilters.status}
                          label="Status"
                          onChange={e => handleProductFilterChange('status', e.target.value)}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                          <MenuItem value="Discontinued">Discontinued</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Button onClick={clearProductFilters} color="primary" variant="outlined">Clear</Button>
                    </Grid>
                  </Grid>
                </Box>

                {data.products.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <ProductIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6">No Products Found</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Start by adding your first product.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      component={RouterLink}
                      to="/admin/products/new"
                    >
                      Add Product
                    </Button>
                  </Paper>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              <Box
                                component="img"
                                src={product.imageUrl || '/placeholder-product.png'}
                                alt={product.name}
                                sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                              />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} 
                                color={product.stock > 0 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={product.status || 'Active'} 
                                color={product.status === 'Active' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  component={RouterLink}
                                  to={`/admin/products/edit/${product._id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteProduct(product._id)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            {tabValue === 5 && <NotificationsPage />}
            {tabValue === 6 && <ReportsPage />}
            {tabValue === 7 && <AddUserPage />}
            {tabValue === 8 && <BackupPage />}
            {tabValue === 9 && <QuotaPage />}
            {tabValue === 10 && <InquiriesPage />}
            {tabValue === 11 && (
              <Box>
                <Typography variant="h6" mb={2}>Feedback Management</Typography>
                {feedbackSuccess && <Alert severity="success" sx={{ mb: 2 }}>{feedbackSuccess}</Alert>}
                {feedbackError && <Alert severity="error" sx={{ mb: 2 }}>{feedbackError}</Alert>}
                <Paper elevation={3}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Feedback</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedbacks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">No feedbacks found</TableCell>
                          </TableRow>
                        ) : (
                          feedbacks.map((feedback) => (
                            <TableRow key={feedback._id}>
                              <TableCell>{feedback.name}</TableCell>
                              <TableCell>{feedback.description}</TableCell>
                              <TableCell>
                                <span style={{ 
                                  color: feedback.status === 'thanked' ? 'green' : 'orange',
                                  fontWeight: 'bold'
                                }}>
                                  {feedback.status === 'thanked' ? 'Thanked' : 'Pending'}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(feedback.createdAt).toLocaleString()}</TableCell>
                              <TableCell>
                                {feedback.status === 'pending' && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleThank(feedback._id)}
                                  >
                                    Mark as Thanked
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
            {tabValue === 12 && (
              <Box>
                <Typography variant="h6" mb={2}>Chatbot Q&A Management</Typography>
                {chatSuccess && <Alert severity="success" sx={{ mb: 2 }}>{chatSuccess}</Alert>}
                {chatError && <Alert severity="error" sx={{ mb: 2 }}>{chatError}</Alert>}
                <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleQaDialogOpen()}>Add Q&A</Button>
                <Paper elevation={3}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Question</TableCell>
                          <TableCell>Answer</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chatLoading ? (
                          <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                        ) : chatQAs.length === 0 ? (
                          <TableRow><TableCell colSpan={3} align="center">No Q&A pairs found</TableCell></TableRow>
                        ) : (
                          chatQAs.map((qa) => (
                            <TableRow key={qa._id}>
                              <TableCell>{qa.question}</TableCell>
                              <TableCell>{qa.answer}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => handleQaDialogOpen(qa)}><EditIcon /></IconButton>
                                <IconButton onClick={() => handleQaDelete(qa._id)} color="error"><DeleteIcon /></IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <Dialog open={qaDialogOpen} onClose={handleQaDialogClose}>
                  <DialogTitle>{qaEditMode ? 'Edit Q&A' : 'Add Q&A'}</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="Question"
                      name="question"
                      value={qaForm.question}
                      onChange={handleQaFormChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Answer"
                      name="answer"
                      value={qaForm.answer}
                      onChange={handleQaFormChange}
                      fullWidth
                      margin="normal"
                      multiline
                      minRows={2}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleQaDialogClose}>Cancel</Button>
                    <Button onClick={handleQaSubmit} variant="contained">{qaEditMode ? 'Update' : 'Add'}</Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage; 