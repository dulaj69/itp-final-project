const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Routes will be implemented based on reporting functionality
router.get('/', (req, res) => {
  res.json({ message: 'Report routes to be implemented' });
});

router.get('/tables', reportController.listTables);
router.post('/generate', reportController.generateReport);
router.get('/list', reportController.listReports);
router.get('/download/:id', reportController.downloadReport);
router.delete('/delete/:id', reportController.deleteReport);

module.exports = router; 