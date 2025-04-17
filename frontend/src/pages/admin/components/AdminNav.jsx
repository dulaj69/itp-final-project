import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

const AdminNav = ({ currentPath }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: <DashboardIcon />
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingCartIcon />
    },
    {
      label: 'Payments',
      path: '/admin/payments',
      icon: <AttachMoneyIcon />
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: <PeopleIcon />
    },
    {
      label: 'Invoices',
      path: '/admin/invoices',
      icon: <ReceiptIcon />
    },
    {
      label: 'Refunds',
      path: '/admin/refunds',
      icon: <SettingsBackupRestoreIcon />
    }
  ];

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Admin Panel
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={RouterLink}
            to={item.path}
            variant={currentPath === item.path ? 'contained' : 'outlined'}
            startIcon={item.icon}
            size="small"
            sx={{ mb: 1 }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default AdminNav; 