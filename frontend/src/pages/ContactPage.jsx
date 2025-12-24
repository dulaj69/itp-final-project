import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Container } from '@mui/material';
import api from '../services/api';

const ContactPage = () => {
  const [inquiryForm, setInquiryForm] = useState({ name: '', description: '' });
  const [feedbackForm, setFeedbackForm] = useState({ name: '', description: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchAllInquiries();
    fetchAllFeedbacks();
  }, []);

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const fetchAllInquiries = async () => {
    try {
      const res = await api.get('/inquiries');
      setInquiries(res.data);
    } catch (err) {
      setInquiries([]);
    }
  };

  const fetchAllFeedbacks = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      setFeedbacks([]);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    setInquirySuccess('');
    setInquiryError('');
    try {
      await api.post('/inquiries', inquiryForm);
      setInquirySuccess('Inquiry submitted successfully!');
      fetchAllInquiries();
      setInquiryForm({ name: '', description: '' });
    } catch (err) {
      setInquiryError(err.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      await api.post('/feedback', feedbackForm);
      setFeedbackSuccess('Feedback submitted successfully!');
      fetchAllFeedbacks();
      setFeedbackForm({ name: '', description: '' });
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box textAlign="center" mb={6} width="100%">
          <Typography variant="h3" fontWeight={700} color="primary.main" mb={1}>
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We value your feedback and inquiries. Please use the forms below to reach out to us.
          </Typography>
        </Box>

        {/* Inquiry Form */}
        <Box width="100%" maxWidth={600} mb={5}>
          <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h5" align="center" mb={2}>Submit an Inquiry</Typography>
            {inquirySuccess && <Alert severity="success" sx={{ mb: 2 }}>{inquirySuccess}</Alert>}
            {inquiryError && <Alert severity="error" sx={{ mb: 2 }}>{inquiryError}</Alert>}
            <form onSubmit={handleInquirySubmit}>
              <TextField
                label="Name"
                name="name"
                value={inquiryForm.name}
                onChange={handleInquiryChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Description"
                name="description"
                value={inquiryForm.description}
                onChange={handleInquiryChange}
                fullWidth
                margin="normal"
                required
                multiline
                minRows={3}
                placeholder="Describe your inquiry..."
              />
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button variant="outlined" color="inherit" onClick={() => setInquiryForm({ name: '', description: '' })} disabled={inquiryLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={inquiryLoading}>
                  {inquiryLoading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Feedback Form */}
        <Box width="100%" maxWidth={600} mb={5}>
          <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h5" align="center" mb={2}>Submit Feedback</Typography>
            {feedbackSuccess && <Alert severity="success" sx={{ mb: 2 }}>{feedbackSuccess}</Alert>}
            {feedbackError && <Alert severity="error" sx={{ mb: 2 }}>{feedbackError}</Alert>}
            <form onSubmit={handleFeedbackSubmit}>
              <TextField
                label="Name"
                name="name"
                value={feedbackForm.name}
                onChange={handleFeedbackChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Description"
                name="description"
                value={feedbackForm.description}
                onChange={handleFeedbackChange}
                fullWidth
                margin="normal"
                required
                multiline
                minRows={3}
                placeholder="Share your feedback or complaint..."
              />
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button variant="outlined" color="inherit" onClick={() => setFeedbackForm({ name: '', description: '' })} disabled={feedbackLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={feedbackLoading}>
                  {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Inquiries Table */}
        <Box width="100%" maxWidth={900} mb={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" mb={2} align="center">All Inquiries & Replies</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Inquiry</TableCell>
                    <TableCell>Admin Reply</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No inquiries found.</TableCell>
                    </TableRow>
                  ) : (
                    inquiries.map((inq) => (
                      <TableRow key={inq._id}>
                        <TableCell>{inq.name}</TableCell>
                        <TableCell>{inq.description}</TableCell>
                        <TableCell>
                          {inq.reply
                            ? <span style={{ color: 'green' }}>{inq.reply}</span>
                            : <span style={{ color: 'gray' }}>No reply yet</span>
                          }
                        </TableCell>
                        <TableCell>{new Date(inq.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Feedbacks Table */}
        <Box width="100%" maxWidth={900}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" mb={2} align="center">All Feedbacks</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Feedback</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No feedbacks found.</TableCell>
                    </TableRow>
                  ) : (
                    feedbacks.map((feedback) => (
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ContactPage; 