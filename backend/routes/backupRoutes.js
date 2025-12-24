const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/collections', backupController.listCollections);
router.post('/create', backupController.createBackup);
router.get('/history', backupController.listBackups);
router.post('/restore/:id', backupController.restoreBackup);
router.delete('/delete/:id', backupController.deleteBackup);

module.exports = router; 