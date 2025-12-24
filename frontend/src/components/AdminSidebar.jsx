import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Inquiries', icon: <NotificationsIcon />, path: '/admin/inquiries' },
  { text: 'Feedback', icon: <FeedbackIcon />, path: '/admin/feedback' },
  // Add other admin links here as needed
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ width: 240, bgcolor: 'background.paper', height: '100vh', borderRight: 1, borderColor: 'divider' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );
};

export default AdminSidebar; 