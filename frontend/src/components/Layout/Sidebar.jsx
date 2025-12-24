import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
  Button, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton, 
  Divider
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  AddCircleOutline as AddIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

// Sidebar width - exported for use in other components
export const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Navigation items for sidebar
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'New Order', icon: <AddIcon />, path: '/order/new' },
    { text: 'Order History', icon: <HistoryIcon />, path: '/orders' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Shipping', icon: <ShippingIcon />, path: '/shipping' },
  ];
  const adminMenuItems = [
    { text: 'Add User', icon: <PersonIcon />, path: '/admin/users/add' },
    { text: 'User Details', icon: <PersonIcon />, path: '/admin/users/details' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
    { text: 'Reports', icon: <HistoryIcon />, path: '/admin/reports' },
    { text: 'Backup', icon: <PaymentIcon />, path: '/admin/backup' },
    { text: 'Inquiries', icon: <NotificationsIcon />, path: '/admin/inquiries' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/admin/feedback' },
  ];
  
  // Drawer content
  const drawerContent = (
    <div>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        p: 2
      }}>
        <Box component="img" 
          src={logo} 
          alt="Logo"
          sx={{ height: 50, mb: 1 }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}
        >
          Spice Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '0 24px 24px 0',
                mr: 2,
                ml: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`
                },
                ...(location.pathname === item.path && {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 'bold',
                    color: theme.palette.primary.main
                  }
                })
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary, minWidth: 46 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Admin-only links */}
        {user?.role === 'admin' && adminMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '0 24px 24px 0',
                mr: 2,
                ml: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`
                },
                ...(location.pathname === item.path && {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 'bold',
                    color: theme.palette.primary.main
                  }
                })
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary, minWidth: 46 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box sx={{ px: 3, mb: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            mb: 2
          }}
        >
          Go to Home
        </Button>
        
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark
            },
            textTransform: 'none'
          }}
        >
          Logout
        </Button>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: drawerWidth }, 
        flexShrink: { md: 0 }
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: theme.shadows[8],
            border: 'none'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer - STATIC */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 