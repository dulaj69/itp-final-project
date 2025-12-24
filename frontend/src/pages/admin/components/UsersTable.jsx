import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  Box,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import api from '../../../services/api';

const UsersTable = ({ users, onExportPdf, refreshUsers }) => {
  const theme = useTheme();
  const [editUser, setEditUser] = useState(null);
  const [editFields, setEditFields] = useState({ name: '', email: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
  });

  const handleUpdate = (user) => {
    setEditUser(user);
    setEditFields({ name: user.name, email: user.email, role: user.role });
    setError('');
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
    try {
        await api.delete(`/admin/users/${userId}`);
        setSnackbarMessage('User deleted successfully');
        setOpenSnackbar(true);
        refreshUsers && refreshUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        console.log(error.response);
        setError(error.response?.data?.message || 'Failed to delete user');
        setSnackbarMessage(error.response?.data?.message || 'Failed to delete user');
        setOpenSnackbar(true);
      }
    }
  };

  const handleEditFieldChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/admin/users/${editUser._id}`, editFields);
      setEditUser(null);
      setSnackbarMessage('User updated successfully');
      setOpenSnackbar(true);
      refreshUsers && refreshUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      console.log(error.response);
      setError(error.response?.data?.message || 'Failed to update user');
      setSnackbarMessage(error.response?.data?.message || 'Failed to update user');
      setOpenSnackbar(true);
    }
    setSaving(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', role: 'all' });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = filters.search === '' ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    return matchesSearch && matchesRole;
  });

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={onExportPdf}
          sx={{ bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}
        >
          Export PDF
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search Name or Email"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={e => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={clearFilters} color="primary" variant="outlined">Clear</Button>
          </Grid>
        </Grid>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role || 'user'} 
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={() => handleUpdate(user)}
                    sx={{ mr: 1 }}
                  >
                    Update
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={editFields.name}
            onChange={handleEditFieldChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={editFields.email}
            onChange={handleEditFieldChange}
            fullWidth
            required
          />
          <Select
            label="Role"
            name="role"
            value={editFields.role}
            onChange={handleEditFieldChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)} disabled={saving}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary" disabled={saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default UsersTable; 