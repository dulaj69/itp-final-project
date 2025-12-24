import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import api from '../../services/api';
import SaveIcon from '@mui/icons-material/Save';

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [replyValue, setReplyValue] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    replyStatus: 'all',
  });

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inquiries');
      setInquiries(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleEdit = (id, currentReply) => {
    setEditingId(id);
    setReplyValue(currentReply || '');
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/inquiries/${id}/reply`, { reply: replyValue });
      setSuccess('Reply saved');
      setEditingId(null);
      setReplyValue('');
      fetchInquiries();
    } catch (err) {
      setError('Failed to save reply');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', replyStatus: 'all' });
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = filters.search === '' ||
      inq.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      inq.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesReplyStatus = filters.replyStatus === 'all' ||
      (filters.replyStatus === 'replied' && inq.reply) ||
      (filters.replyStatus === 'not_replied' && !inq.reply);
    return matchesSearch && matchesReplyStatus;
  });

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>All Inquiries</Typography>
      {/* Filter Bar */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search Name or Description"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Reply Status</InputLabel>
              <Select
                value={filters.replyStatus}
                label="Reply Status"
                onChange={e => handleFilterChange('replyStatus', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="replied">Replied</MenuItem>
                <MenuItem value="not_replied">Not Replied</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={clearFilters} color="primary" variant="outlined">Clear</Button>
          </Grid>
        </Grid>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Reply</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInquiries.map((inq) => (
                <TableRow key={inq._id}>
                  <TableCell>{inq.name}</TableCell>
                  <TableCell>{inq.description}</TableCell>
                  <TableCell>
                    {editingId === inq._id ? (
                      <TextField
                        value={replyValue}
                        onChange={e => setReplyValue(e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                      />
                    ) : (
                      inq.reply ? <span style={{ color: 'green' }}>{inq.reply}</span> : <span style={{ color: 'gray' }}>No reply</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(inq.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {editingId === inq._id ? (
                      <IconButton color="primary" onClick={() => handleSave(inq._id)}>
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleEdit(inq._id, inq.reply)}>
                        Reply
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InquiriesPage; 