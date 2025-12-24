const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

// Public: Add new inquiry
router.post('/', inquiryController.addInquiry);
// Admin: Get all inquiries
router.get('/', inquiryController.getAllInquiries);
// Admin: Reply to inquiry
router.put('/:id/reply', inquiryController.replyToInquiry);
// User: Get their own inquiries (by name)
router.get('/user', inquiryController.getUserInquiries);

module.exports = router; 