import React, { useState } from 'react';
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
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Toys & Games',
  'Sports & Outdoors',
  'Beauty & Personal Care',
  'Health & Household',
  'Automotive',
  'Other'
];

const AddProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

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
    
    // Validation
    if (!product.name || !product.price || !product.category || !product.stock) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Format the product data
      const productData = {
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock)
      };
      
      console.log('Submitting product data:', productData);
      
      // First try to submit as JSON
      try {
        const response = await api.post('/products', productData);
        
        // Handle image upload separately if we have an image and the product was created
        if (imageFile && response.data._id) {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          await api.put(`/products/${response.data._id}/image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        setSuccess(true);
        
        // Reset form after successful submission
        setProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
        });
        
        setImageFile(null);
        setImagePreview('');
        
        // Navigate back to products page after 2 seconds
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } catch (jsonError) {
        console.error('Error with JSON submission, trying multipart:', jsonError);
        
        // If JSON submission fails, try with multipart/form-data
        const formData = new FormData();
        
        // Add product data to form
        formData.append('name', product.name);
        formData.append('description', product.description || '');
        formData.append('price', Number(product.price));
        formData.append('category', product.category);
        formData.append('stock', Number(product.stock));
        
        // Add image if available
        if (imageFile) {
          formData.append('image', imageFile);
        }
        
        const response = await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setSuccess(true);
        
        // Reset form after successful submission
        setProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
        });
        
        setImageFile(null);
        setImagePreview('');
        
        // Navigate back to products page after 2 seconds
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response?.status === 404) {
        setError('The product API endpoint is not available. Please make sure your backend server is running and the /api/products endpoint is implemented.');
      } else {
        setError(error.response?.data?.message || 'Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/admin/dashboard" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Add New Product</Typography>
      </Breadcrumbs>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Add New Product
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
            Product added successfully!
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
                <Grid item xs={12} sm={4}>
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
                
                <Grid item xs={12} sm={4}>
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
                
                <Grid item xs={12} sm={4}>
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
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px dashed grey',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  height: 250
                }}
              >
                {imagePreview ? (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Product preview"
                    sx={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No image selected
                  </Typography>
                )}
              </Paper>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mb: 3, width: '100%' }}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Product'}
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

export default AddProductPage; 