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
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportMenuAnchor, setReportMenuAnchor] = useState(null);

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

  // Report generation functions
  const handleReportMenuOpen = (event) => {
    setReportMenuAnchor(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setReportMenuAnchor(null);
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Order History Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["Order Number", "Items", "Total Amount", "Order Status", "Payment Status", "Date"];
    const tableRows = orders.map(order => [
      order.orderNumber,
      order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
      `$${order.totalAmount.toFixed(2)}`,
      order.orderStatus,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    // Save PDF
    doc.save('order_history_report.pdf');
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
      'Date': new Date(order.createdAt).toLocaleDateString()
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
    const printContent = document.getElementById('orderHistoryTable');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print_' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');
    
    printWindow.document.write('<html><head><title>Order History</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      h2 { text-align: center; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h2>Order History Report</h2>');
    printWindow.document.write('<p>Generated on: ' + new Date().toLocaleDateString() + '</p>');
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>Order Number</th><th>Items</th><th>Total Amount</th><th>Order Status</th><th>Payment Status</th><th>Date</th></tr>');
    
    orders.forEach(order => {
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td>${order.orderNumber}</td>`);
      printWindow.document.write(`<td>${order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}</td>`);
      printWindow.document.write(`<td>$${order.totalAmount.toFixed(2)}</td>`);
      printWindow.document.write(`<td>${order.orderStatus}</td>`);
      printWindow.document.write(`<td>${order.paymentStatus}</td>`);
      printWindow.document.write(`<td>${new Date(order.createdAt).toLocaleDateString()}</td>`);
      printWindow.document.write('</tr>');
    });
    
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    // Print after content is loaded
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
    
    handleReportMenuClose();
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

          {loading ? (
            <CircularProgress />
          ) : (
            <>
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
    </Box>
  );
};

export default OrderHistory; 