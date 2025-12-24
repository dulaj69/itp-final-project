import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [toWhom, setToWhom] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!toWhom || !description) {
      setError('All fields are required.');
      return;
    }
    try {
      await axios.post('/api/notifications', { toWhom, description });
      setToWhom('');
      setDescription('');
      setError('');
      fetchNotifications();
    } catch (err) {
      setError('Failed to add notification.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await axios.delete(`/api/notifications/${id}`);
        fetchNotifications();
      } catch (err) {
        alert('Failed to delete notification.');
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Notifications</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField
            label="To Whom"
            value={toWhom}
            onChange={e => setToWhom(e.target.value)}
            required
            size="small"
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            size="small"
            sx={{ flex: 1 }}
          />
          <Button type="submit" variant="contained">Add</Button>
        </form>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>To Whom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n._id}>
                <TableCell>{n.toWhom}</TableCell>
                <TableCell>{n.description}</TableCell>
                <TableCell>{new Date(n.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(n._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NotificationsPage; 