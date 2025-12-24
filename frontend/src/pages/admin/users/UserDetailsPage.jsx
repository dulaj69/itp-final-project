import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const UserDetailsPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users || []);
      setFilteredUsers(res.data.users || []);
      setNoResults(false);
    } catch (err) {
      setUsers([]);
      setFilteredUsers([]);
      setNoResults(true);
    }
  };

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      Object.values(user).some((field) =>
        field && field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setNoResults(filtered.length === 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>User Details</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      {noResults ? (
        <Typography>No users found</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || 'N/A'}</TableCell>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.designation || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(user._id)}>
                      <DeleteIcon />
                    </IconButton>
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

export default UserDetailsPage; 