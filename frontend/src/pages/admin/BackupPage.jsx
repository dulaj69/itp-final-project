import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Chip } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const BackupPage = () => {
  const [collections, setCollections] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCollections = async () => {
    try {
      const res = await axios.get('/api/backup/collections');
      setCollections(res.data.collections || []);
    } catch (err) {
      setError('Failed to fetch collections');
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await axios.get('/api/backup/history');
      setBackups(res.data || []);
    } catch (err) {
      setError('Failed to fetch backup history');
      setBackups([]);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchBackups();
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/backup/create');
      await fetchBackups();
      setSuccess('Backup created successfully');
    } catch (err) {
      setError('Failed to create backup');
    }
    setLoading(false);
  };

  const handleRestore = async (backupId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/backup/restore/${backupId}`);
      setSuccess('Backup restored successfully');
    } catch (err) {
      setError('Failed to restore backup');
    }
    setLoading(false);
  };

  const handleDelete = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/backup/delete/${backupId}`);
      await fetchBackups();
      setSuccess('Backup deleted successfully');
    } catch (err) {
      setError('Failed to delete backup');
    }
    setLoading(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Backup Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>Available Collections</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {collections.length === 0 ? (
            <Typography>No collections available</Typography>
          ) : (
            collections.map((col, idx) => (
              <Chip key={idx} label={col} sx={{ mb: 1 }} />
            ))
          )}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Button variant="contained" onClick={handleBackup} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Create Backup'}
        </Button>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Backup History</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Collections</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No backups available</TableCell></TableRow>
              ) : (
                backups.map((backup, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(backup.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{backup.id}</TableCell>
                    <TableCell>{backup.collections.join(', ')}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleRestore(backup.id)} disabled={loading}>
                        <RestoreIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(backup.id)} disabled={loading}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="success.main" mt={2}>{success}</Typography>}
      </Paper>
    </Box>
  );
};

export default BackupPage; 