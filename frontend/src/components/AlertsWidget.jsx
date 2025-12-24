import React, { useState, useEffect } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Paper, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

const AlertsWidget = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data.notifications) ? res.data.notifications : []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        aria-label="alerts"
        onClick={handleOpen}
        size="large"
        sx={{ color: '#ff9800' }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Alerts
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ bgcolor: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>To</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No notifications</TableCell></TableRow>
                ) : (
                  notifications.map((n) => (
                    <TableRow key={n._id}>
                      <TableCell>{n.toWhom}</TableCell>
                      <TableCell>{n.description}</TableCell>
                      <TableCell>{new Date(n.date).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsWidget; 