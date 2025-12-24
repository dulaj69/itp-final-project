import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [reportName, setReportName] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/reports/tables');
      setTables(res.data.tables || []);
    } catch (err) {
      setError('Failed to fetch tables');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports/list');
      setReports(res.data || []);
    } catch (err) {
      setError('Failed to fetch reports');
      setReports([]);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedTable || !reportName) {
      setError('Please select a table and provide a report name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/reports/generate', {
        tableName: selectedTable,
        reportName: reportName
      });
      await fetchReports();
      setReportName('');
      setError('Report generated successfully');
    } catch (err) {
      setError('Failed to generate report');
    }
    setLoading(false);
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/api/reports/delete/${reportId}`);
      await fetchReports();
    } catch (err) {
      setError('Failed to delete report');
    }
    setLoading(false);
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      const response = await axios.get(`/api/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      // Read the blob as text (JSON)
      const text = await response.data.text();
      const jsonData = JSON.parse(text);
      // If the data is an array of objects, generate a PDF
      if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(fileName.replace('.json', '').replace(/_/g, ' '), 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        // Get columns from keys of the first object
        const columns = Object.keys(jsonData[0]);
        const rows = jsonData.map(row => columns.map(col => {
          const value = row[col];
          if (typeof value === 'object') return JSON.stringify(value);
          return value !== undefined ? value : '';
        }));
        doc.autoTable({
          head: [columns],
          body: rows,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
        doc.save(fileName.replace('.json', '.pdf'));
      } else {
        // fallback: download as JSON if not a table
        const url = window.URL.createObjectURL(new Blob([text]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setError('Failed to download report');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Reports Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>Generate New Report</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="table-select-label">Select Table</InputLabel>
            <Select
              labelId="table-select-label"
              value={selectedTable}
              label="Select Table"
              onChange={e => setSelectedTable(e.target.value)}
              disabled={loading}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {tables.map((table, idx) => (
                <MenuItem key={idx} value={table}>{table}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Report Name"
            value={reportName}
            onChange={e => setReportName(e.target.value)}
            placeholder="Enter report name"
            size="small"
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading || !selectedTable || !reportName}
          >
            {loading ? <CircularProgress size={20} /> : 'Generate Report'}
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Available Reports</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Generated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No reports available</TableCell></TableRow>
              ) : (
                reports.map((report, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.tableName}</TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleDownloadReport(report._id, report.fileName)}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteReport(report._id)}>
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
      </Paper>
    </Box>
  );
};

export default ReportsPage; 