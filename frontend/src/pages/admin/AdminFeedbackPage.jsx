import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, TextField, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import api from '../../services/api';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      setError('Failed to fetch feedbacks');
    }
  };

  const handleThank = async (id) => {
    try {
      await api.patch(`/feedback/${id}/thank`);
      setSuccess('Feedback marked as thanked successfully');
      fetchFeedbacks();
    } catch (err) {
      setError('Failed to update feedback status');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all' });
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = filters.search === '' ||
      feedback.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      feedback.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || feedback.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={4}>Feedback Management</Typography>
      
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter Bar */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search Name or Feedback"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={e => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="thanked">Thanked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={clearFilters} color="primary" variant="outlined">Clear</Button>
          </Grid>
        </Grid>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No feedbacks found</TableCell>
                </TableRow>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback._id}>
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.description}</TableCell>
                    <TableCell>
                      <span style={{ 
                        color: feedback.status === 'thanked' ? 'green' : 'orange',
                        fontWeight: 'bold'
                      }}>
                        {feedback.status === 'thanked' ? 'Thanked' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(feedback.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {feedback.status === 'pending' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleThank(feedback._id)}
                        >
                          Mark as Thanked
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminFeedbackPage; 