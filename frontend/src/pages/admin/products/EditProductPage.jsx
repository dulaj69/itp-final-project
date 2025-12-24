import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';

const categories = [
  'Seed Spices',
  'Fruit/Berry Spices',
  'Bark Spices',
  'Root Spices',
  'Leaf/Herb Spices',
  'Flower Spices',
  'Resin/Aromatic Spices',
  'Blended Spice Mixes'
];

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    status: 'Active',
    addDate: '',
    expiryDate: ''
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const productData = response.data;
        
        setProduct({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || 0,
          category: productData.category || '',
          stock: productData.stock || 0,
          status: productData.status || 'Active',
          addDate: productData.addDate ? productData.addDate.slice(0, 10) : '',
          expiryDate: productData.expiryDate ? productData.expiryDate.slice(0, 10) : ''
        });
        
        if (productData.imageUrl) {
          setImagePreview(productData.imageUrl);
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Only show error if a required field is truly empty
    if (product.name.trim() === '' || String(product.price).trim() === '' || product.category.trim() === '' || String(product.stock).trim() === '') {
      setError('Name, price, category, and stock cannot be empty');
      return;
    }
    if (Number(product.price) <= 1) {
      setError('Price must be greater than 1');
      return;
    }
    // Only validate dates if both are present
    if (product.addDate && product.expiryDate && product.expiryDate <= product.addDate) {
      setError('Expiry date must be after add date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Always use FormData for product submission to handle image upload properly
      const formData = new FormData();
      
      // Add product data to form
      formData.append('name', product.name);
      formData.append('description', product.description || '');
      formData.append('price', Number(product.price));
      formData.append('category', product.category);
      formData.append('stock', Number(product.stock));
      formData.append('status', product.status);
      formData.append('addDate', product.addDate);
      formData.append('expiryDate', product.expiryDate);
      
      // Add image if available
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      // Navigate back to products page after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/admin/dashboard" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Edit Product</Typography>
      </Breadcrumbs>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Edit Product
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/admin/dashboard"
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product updated successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                required
                fullWidth
                label="Product Name"
                name="name"
                value={product.name}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={product.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={product.price}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl required fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={product.category}
                      label="Category"
                      onChange={handleChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    fullWidth
                    label="Stock"
                    name="stock"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    value={product.stock}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl required fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={product.status || 'Active'}
                      label="Status"
                      onChange={handleChange}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Discontinued">Discontinued</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Add Date"
                    name="addDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={product.addDate}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Expiry Date"
                    name="expiryDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={product.expiryDate}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="product-image"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="product-image">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Change Image
                  </Button>
                </label>
                
                {imagePreview && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        display: 'block',
                        border: '1px solid #eee',
                        borderRadius: '4px'
                      }}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      {imageFile ? 'New image will be uploaded when you save' : 'Current image'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={submitting}
                sx={{ mr: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Update Product'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/admin/dashboard"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProductPage; 