import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  useTheme,
  InputAdornment,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  HowToReg as RegisterIcon,
  Badge as RoleIcon
} from '@mui/icons-material';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Validation functions
  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const validatePassword = (password) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{5,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!validateName(formData.name)) {
      setError('Name must contain only letters and spaces');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 5 characters long and contain at least one number and one special character');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: 'customer' // Always set to customer for regular registration
      });
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.dark} 0%, 
          ${theme.palette.primary.main} 40%,
          ${theme.palette.primary.light} 100%)`
      }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left side - Welcome Message */}
        <Grid item xs={12} md={6} 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 8,
            color: 'white'
          }}
        >
          <RegisterIcon sx={{ fontSize: 80, mb: 4 }} />
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Create Account
          </Typography>
          <Typography variant="h6" align="center" sx={{ maxWidth: 400 }}>
            Join us to start managing your orders and accessing exclusive features
          </Typography>
        </Grid>

        {/* Right side - Register Form */}
        <Grid item xs={12} md={6} 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
          }}
        >
          <Card 
            sx={{ 
              maxWidth: 450,
              width: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[20],
              backdropFilter: 'blur(20px)',
              bgcolor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h4" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  mb: 4
                }}
              >
                Sign Up
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      value={formData.userType}
                      label="User Type"
                      onChange={(e) => setFormData({...formData, userType: e.target.value})}
                      startAdornment={
                        <InputAdornment position="start">
                          <RoleIcon color="primary" />
                        </InputAdornment>
                      }
                      disabled // Disable the select since we only allow customers
                    >
                      <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ 
                      mt: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2
                    }}
                  >
                    Register
                  </Button>

                  <Typography align="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        textDecoration: 'none',
                        color: theme.palette.primary.main,
                        fontWeight: 'bold'
                      }}
                    >
                      Login here
                    </Link>
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register; 