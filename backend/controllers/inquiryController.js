const Inquiry = require('../models/Inquiry');

// Public: Add a new inquiry
const addInquiry = async (req, res) => {
  const { name, description } = req.body;
  try {
    const inquiry = new Inquiry({ name, description });
    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(400).json({ message: 'Unable to add inquiry' });
  }
};

// Admin: Get all inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inquiries' });
  }
};

// Admin: Reply to an inquiry
const replyToInquiry = async (req, res) => {
  try {
    const { reply } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { reply },
      { new: true, runValidators: true }
    );
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.status(200).json(inquiry);
  } catch (err) {
    res.status(400).json({ message: 'Unable to reply to inquiry' });
  }
};

// User: Get their own inquiries (by name)
const getUserInquiries = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const inquiries = await Inquiry.find({ name }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user inquiries' });
  }
};

module.exports = {
  addInquiry,
  getAllInquiries,
  replyToInquiry,
  getUserInquiries
}; 