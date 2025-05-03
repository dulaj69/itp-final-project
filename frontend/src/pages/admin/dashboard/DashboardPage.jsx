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
  MenuItem
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
  Inventory as ProductIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../../services/api';
import StatsCard from '../components/StatsCard';
import OrdersTable from '../components/OrdersTable';
import UsersTable from '../components/UsersTable';
import PaymentsTable from '../components/PaymentsTable';
import jsPDF from "jspdf";
import "jspdf-autotable";

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
    
    const tableColumn = ["Order Number", "Customer", "Items", "Total Amount", "Status", "Payment Status", "Date"];
    const tableRows = filteredOrders.map(order => [
      order.orderNumber,
      order.user?.name || 'N/A',
      order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
      `$${order.totalAmount.toFixed(2)}`,
      order.orderStatus,
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
        5: { cellWidth: 25 },
        6: { cellWidth: 25 }
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
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
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
                        {data.products.map((product) => (
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
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage; 