import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar, { drawerWidth } from './Sidebar';

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

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{
          width: { xs: '100%', md: isAdmin ? '100%' : `calc(100% - ${drawerWidth}px)` },
          ml: { md: isAdmin ? 0 : `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          {!isAdmin && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              {getPageTitle()}
            </Typography>
          </Box>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
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
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Component - Only render for non-admin users */}
      {!isAdmin && <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}
      
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
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        <Toolbar /> {/* Spacer to push content below app bar */}
        <Outlet /> {/* This will render the child routes */}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 