import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, useTheme, useMediaQuery, Container, Grid, Divider, Button } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Person as PersonIcon, Logout as LogoutIcon, Search as SearchIcon, ShoppingCart } from '@mui/icons-material';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar, { drawerWidth } from './Sidebar';
import logo from '../../assets/logo.png';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAdmin = user?.role === 'admin';
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openProfileMenu = Boolean(anchorEl);
  
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get current page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    
    // Extract the last part of the path and capitalize it
    const pageName = path.split('/').filter(segment => segment !== '').pop();
    if (!pageName) return 'Dashboard';
    
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  // Get cart item count (placeholder - should integrate with actual cart context)
  const cartItemCount = 0;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      {/* Main Header (similar to HomePage) */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Spice Logo" style={{ height: 50 }} />
            </Box>
            
            {/* Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
              <Typography 
                component={Link} 
                to="/" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Home
              </Typography>
              <Typography 
                component={Link} 
                to="/shop" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Shop
              </Typography>
              <Typography 
                component={Link} 
                to="/about" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                About
              </Typography>
              <Typography 
                component={Link} 
                to="/contact" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Contact Us
              </Typography>
            </Box>
            
            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
              <IconButton size="small" component={Link} to="/cart">
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleProfileClick}
                sx={{ p: 0.5 }}
              >
                <Avatar 
                  alt={user?.name || 'User'} 
                  src="/static/avatar.jpg"
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {(user?.name?.charAt(0) || 'U')}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={openProfileMenu}
                onClose={handleProfileClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content area with sidebar and content */}
      <Box 
        sx={{ 
          display: 'flex', 
          flex: '1 0 auto', 
          pt: '64px', // Height of the AppBar
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Sidebar Component - Only render for non-admin users */}
        {!isAdmin && (
          <Sidebar 
            mobileOpen={mobileOpen} 
            handleDrawerToggle={handleDrawerToggle} 
          />
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { 
              xs: '100%',
              md: isAdmin ? '100%' : `calc(100% - ${drawerWidth}px)` 
            },
            bgcolor: theme.palette.grey[50],
            minHeight: 'calc(100vh - 64px - 300px)', // viewport - header - footer (approx)
            position: 'relative',
          }}
        >
          <Outlet /> {/* This will render the child routes */}
        </Box>
      </Box>

      {/* Footer - Full Width */}
      <Box 
        sx={{ 
          bgcolor: '#222', 
          color: 'white', 
          py: 4, 
          width: '100vw',
          maxWidth: '100%',
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          mt: 'auto',
          zIndex: (theme) => theme.zIndex.drawer + 2, // Higher than sidebar
        }}
      >
        <Container 
          maxWidth={false} 
          disableGutters 
          sx={{ 
            px: { xs: 2, sm: 4, md: 6, lg: 8 }, 
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img src={logo} alt="Spice Logo" style={{ height: 40, marginRight: 10, filter: 'brightness(0) invert(1)' }} />
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>f</Box>
                </IconButton>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>t</Box>
                </IconButton>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>in</Box>
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                About
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    About Us
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Features
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    News
                  </Link>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Company
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    How We Work
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Capital
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Security
                  </Link>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                GET IN TOUCH
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1, fontSize: '0.875rem', color: '#ffffff99' }}>
                  +94 712 571 22
                </Box>
                <Box component="li" sx={{ mb: 1, fontSize: '0.875rem', color: '#ffffff99' }}>
                  info@spiceshop.com
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;