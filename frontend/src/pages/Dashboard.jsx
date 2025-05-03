import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  useTheme, 
  Button, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton, 
  Divider, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Avatar, 
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  AddCircleOutline as AddIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

// Sidebar width
const drawerWidth = 260;

const DashboardCard = ({ title, icon, value, onClick }) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 4,
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        '&:hover': { 
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[10],
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
          '& .icon': {
            color: theme.palette.primary.main,
            transform: 'scale(1.2)'
          }
        },
        borderRadius: 3
      }}
      onClick={onClick}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            {value}
          </Typography>
        </Box>
        <Box className="icon" sx={{ 
          color: 'text.secondary',
          transition: 'all 0.3s ease'
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 48 } })}
        </Box>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
  
  // Navigation items for sidebar
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'New Order', icon: <AddIcon />, path: '/order/new' },
    { text: 'Order History', icon: <HistoryIcon />, path: '/orders' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Shipping', icon: <ShippingIcon />, path: '/shipping' },
  ];
  
  // Drawer content - this will be used for both permanent and temporary drawers
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
                ...(window.location.pathname === item.path && {
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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'fixed',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxSizing: 'border-box'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              {menuItems.find(item => window.location.pathname === item.path)?.text || 'Dashboard'}
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
      
      {/* Side Navigation */}
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
        
        {/* Desktop Drawer */}
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
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` 
          },
          maxWidth: '100%',
          bgcolor: theme.palette.grey[50],
          minHeight: '100vh',
          overflow: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <Toolbar /> {/* Spacer to push content below app bar */}
        
        {/* Welcome Section */}
        <Box sx={{ mb: 4, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your orders and track your shipments from your personalized dashboard
          </Typography>
        </Box>
        
        {/* Summary Cards */}
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 4, 
            mx: 0,
            width: '100%',
            boxSizing: 'border-box',
            '& .MuiGrid-item': {
              paddingTop: '24px',
              paddingLeft: '24px',
              boxSizing: 'border-box'
            }
          }}
        >
          {[
            { title: 'Pending Orders', value: '5', color: theme.palette.warning.main, progress: 60 },
            { title: 'Completed Orders', value: '28', color: theme.palette.success.main, progress: 85 },
            { title: 'Total Sales', value: 'Rs.12,500', color: theme.palette.primary.main, progress: 75 },
            { title: 'Shipped Orders', value: '3', color: theme.palette.info.main, progress: 40 }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <Box sx={{ height: 5, backgroundColor: item.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    {item.value}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.progress} 
                    sx={{ 
                      height: 4, 
                      borderRadius: 2,
                      bgcolor: `${item.color}20`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color
                      }
                    }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Quick Actions */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mx: 0,
            width: '100%',
            boxSizing: 'border-box',
            '& .MuiGrid-item': {
              paddingTop: '24px',
              paddingLeft: '24px',
              boxSizing: 'border-box'
            }
          }}
        >
          {[
            { title: 'New Order', icon: <OrderIcon sx={{ fontSize: 45 }}/>, color: '#ff5722', path: '/order/new' },
            { title: 'Track Shipping', icon: <ShippingIcon sx={{ fontSize: 45 }}/>, color: '#2196f3', path: '/shipping' },
            { title: 'Payment History', icon: <PaymentIcon sx={{ fontSize: 45 }}/>, color: '#4caf50', path: '/payments' },
            { title: 'Order History', icon: <HistoryIcon sx={{ fontSize: 45 }}/>, color: '#9c27b0', path: '/orders' },
          ].map((action, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  },
                  borderRadius: 3,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onClick={() => navigate(action.path)}
              >
                <Box sx={{ color: action.color, mb: 1 }}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', textAlign: 'center' }}>
                  {action.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 