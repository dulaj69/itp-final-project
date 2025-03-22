import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Container,
  Alert,
  Stack,
  useTheme,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LoginOutlined
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(formData.email, formData.password);
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
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
          <LoginOutlined sx={{ fontSize: 80, mb: 4 }} />
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Welcome Back!
          </Typography>
          <Typography variant="h6" align="center" sx={{ maxWidth: 400 }}>
            Log in to access your account and manage your orders efficiently
          </Typography>
        </Grid>

        {/* Right side - Login Form */}
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
                Sign In
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
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
                    Login
                  </Button>

                  <Typography align="center" sx={{ mt: 2 }}>
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        textDecoration: 'none',
                        color: theme.palette.primary.main,
                        fontWeight: 'bold'
                      }}
                    >
                      Register here
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

export default Login; 