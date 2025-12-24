import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QuotaPage = () => {
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);
  const [products, setProducts] = useState([]);
  const [qitems, setQitems] = useState([]);
  const [formData, setFormData] = useState({
    items: [{ name: '', quantity: '', unitPrice: '', unitWeight: '', weightUnit: 'g' }]
  });
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
  });

  const fetchQuotas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/quotas');
      setQuotas(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch quotas');
      console.error('Error fetching quotas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchQitems = async () => {
    try {
      const response = await api.get('/admin/qitems');
      setQitems(response.data);
    } catch (err) {
      console.error('Error fetching qitems:', err);
    }
  };

  useEffect(() => {
    fetchQuotas();
    fetchProducts();
    fetchQitems();
  }, []);

  const handleOpenDialog = (quota = null) => {
    if (quota) {
      setEditingQuota(quota);
      setFormData({
        items: quota.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitWeight: item.unitWeight,
          weightUnit: item.weightUnit
        }))
      });
    } else {
      setEditingQuota(null);
      setFormData({
        items: [{ name: '', quantity: '', unitPrice: '', unitWeight: '', weightUnit: 'g' }]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuota(null);
    setFormData({
      items: [{ name: '', quantity: '', unitPrice: '', unitWeight: '', weightUnit: 'g' }]
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      items: [...prev.items, { name: '', quantity: '', unitPrice: '', unitWeight: '', weightUnit: 'g' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProductSelect = (index, product) => {
    if (product) {
      setFormData(prev => ({
        items: prev.items.map((item, i) => 
          i === index ? {
            ...item,
            name: product.name,
            unitPrice: product.price,
            unitWeight: product.itemWeight || product.weight,
            weightUnit: product.weightUnit || 'g'
          } : item
        )
      }));
    }
  };

  const handleQitemSelect = (index, qitem) => {
    if (qitem) {
      setFormData(prev => ({
        items: prev.items.map((item, i) =>
          i === index
            ? {
                ...item,
                name: qitem.itemName,
                unitPrice: qitem.itemPrice,
                unitWeight: qitem.itemWeight,
                weightUnit: 'g',
              }
            : item
        ),
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Filter out items with empty quantities and calculate totalPrice
      const itemsWithTotalPrice = formData.items
        .filter(item => item.quantity && item.quantity.trim() !== '')
        .map(item => ({
          ...item,
          totalPrice: Number(item.quantity) * Number(item.unitPrice)
        }));

      if (itemsWithTotalPrice.length === 0) {
        setError('Please add at least one item with quantity');
        setLoading(false);
        return;
      }

      const quotaData = {
        items: itemsWithTotalPrice
      };

      if (editingQuota) {
        await api.put(`/admin/quotas/${editingQuota._id}`, quotaData);
        setSuccess('Quota updated successfully');
      } else {
        await api.post('/admin/quotas', quotaData);
        setSuccess('Quota created successfully');
      }
      handleCloseDialog();
      fetchQuotas();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quota');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quotaId) => {
    if (!window.confirm('Are you sure you want to delete this quota?')) return;
    try {
      setLoading(true);
      await api.delete(`/admin/quotas/${quotaId}`);
      setSuccess('Quota deleted successfully');
      fetchQuotas();
    } catch (err) {
      setError('Failed to delete quota');
    } finally {
      setLoading(false);
    }
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Quotas Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    // Prepare table data
    const tableData = quotas.map(quota => [
      quota.quotaId,
      quota.items.map(item => item.name).join(', '),
      quota.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
      new Date(quota.createdAt).toLocaleDateString()
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Quota ID', 'Items', 'Total Price', 'Created Date']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Save the PDF
    doc.save('quotas-report.pdf');
  };

  const handleRowClick = async (quotaId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/quotas/${quotaId}`);
      setSelectedQuota(response.data);
      setShowItemsModal(true);
    } catch (err) {
      setError('Failed to fetch quota details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseItemsModal = () => {
    setShowItemsModal(false);
    setSelectedQuota(null);
  };

  const generateQuotaReport = (quota) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Quota Details', 14, 20);

    // Date and Quota ID
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(quota.createdAt).toLocaleDateString()}`, 14, 30);
    doc.text(`Quota ID: ${quota.quotaId}`, 14, 38);

    // Table Data
    const tableData = quota.items.map(item => [
      item.name,
      item.quantity,
      Number(item.unitPrice).toFixed(2),
      `${item.unitWeight} ${item.weightUnit}`,
      Number(item.totalPrice).toFixed(2)
    ]);

    // Add total row
    tableData.push([
      'Total', '', '', '', quota.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
    ]);

    // Table
    doc.autoTable({
      head: [['Item Name', 'Quantity', 'Unit Price', 'Weight', 'Total Price']],
      body: tableData,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save PDF
    doc.save(`Quota_${quota.quotaId}.pdf`);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', startDate: '', endDate: '' });
  };

  const filteredQuotas = quotas.filter(quota => {
    const matchesSearch = filters.search === '' ||
      quota.quotaId.toLowerCase().includes(filters.search.toLowerCase()) ||
      quota.items.some(item => item.name.toLowerCase().includes(filters.search.toLowerCase()));
    const quotaDate = new Date(quota.createdAt).toISOString().split('T')[0];
    const matchesStartDate = !filters.startDate || quotaDate >= filters.startDate;
    const matchesEndDate = !filters.endDate || quotaDate <= filters.endDate;
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  if (loading && !quotas.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quota Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={generatePdfReport}
            sx={{ mr: 2 }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Quota
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
              label="Search Quota ID or Item Name"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={clearFilters} color="primary" variant="outlined">Clear</Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>Quota ID</TableCell>
              <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>Items</TableCell>
              <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>Total Price</TableCell>
              <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotas.map((quota) => (
              <TableRow key={quota._id}>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{quota.quotaId}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {quota.items.map(item => item.name).join(', ')}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {quota.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {new Date(quota.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(quota)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(quota._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => generateQuotaReport(quota)}
                    size="small"
                  >
                    <PdfIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuota ? 'Edit Quota' : 'Add New Quota'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {formData.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    options={qitems}
                    getOptionLabel={(option) =>
                      option && option.itemName
                        ? `${option.itemName} (${option.itemWeight}g) - Rs.${option.itemPrice}`
                        : ''
                    }
                    value={
                      qitems.find(
                        (q) =>
                          q.itemName === item.name &&
                          String(q.itemWeight) === String(item.unitWeight)
                      ) || null
                    }
                    onChange={(_, newValue) => handleQitemSelect(index, newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Item Name"
                        placeholder="Select an item"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography>{option.itemName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.itemWeight}g - Rs.{option.itemPrice}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.itemName === value.itemName &&
                      String(option.itemWeight) === String(value.itemWeight)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Unit Weight"
                    type="number"
                    value={item.unitWeight}
                    onChange={(e) => handleItemChange(index, 'unitWeight', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={item.weightUnit}
                      label="Unit"
                      onChange={(e) => handleItemChange(index, 'weightUnit', e.target.value)}
                    >
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="l">l</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mt: 1 }}
            >
              Add Item
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showItemsModal} onClose={handleCloseItemsModal} maxWidth="sm" fullWidth>
        <DialogTitle>Quota Items</DialogTitle>
        <DialogContent>
          {selectedQuota && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Quota ID: {selectedQuota.quotaId}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Unit Weight</TableCell>
                    <TableCell>Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedQuota.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell>{item.unitWeight}{item.weightUnit}</TableCell>
                      <TableCell>{item.totalPrice}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemsModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotaPage; 