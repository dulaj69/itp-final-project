import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUserPage = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
  });
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const validatePassword = (password) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{5,}$/.test(password);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateName(inputs.name)) {
      newErrors.name = 'Name must contain only letters and spaces';
    }
    
    if (!inputs.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(inputs.password)) {
      newErrors.password = 'Password must be at least 5 characters long and contain at least one number and one special character';
    }
    
    if (inputs.password !== inputs.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post('/api/auth/register', {
          name: inputs.name,
          email: inputs.email,
          password: inputs.password,
          userType: 'admin' // Always set to admin for admin dashboard registration
        });
        navigate('/admin/users/details');
      } catch (err) {
        setErrors({ submit: err.response?.data?.message || 'Failed to add user.' });
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2} align="center">Add Admin User</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={inputs.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={inputs.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <TextField
            label="Confirm Password"
            name="confirmpassword"
            type="password"
            value={inputs.confirmpassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.confirmpassword}
            helperText={errors.confirmpassword}
            required
          />
          {errors.submit && (
            <Typography color="error" align="center">{errors.submit}</Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Add Admin User
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AddUserPage; 