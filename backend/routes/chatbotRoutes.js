const express = require('express');
const router = express.Router();
const ChatbotQA = require('../models/ChatbotQA');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Get all Q&A pairs
router.get('/qa', protect, isAdmin, async (req, res) => {
  try {
    const qas = await ChatbotQA.find().sort({ createdAt: -1 });
    res.json(qas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Q&A pairs' });
  }
});

// Add a new Q&A pair
router.post('/qa', protect, isAdmin, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = new ChatbotQA({ question, answer });
    await qa.save();
    res.status(201).json(qa);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add Q&A pair' });
  }
});

// Edit a Q&A pair
router.put('/qa/:id', protect, isAdmin, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await ChatbotQA.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    if (!qa) return res.status(404).json({ message: 'Q&A not found' });
    res.json(qa);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update Q&A pair' });
  }
});

// Delete a Q&A pair
router.delete('/qa/:id', protect, isAdmin, async (req, res) => {
  try {
    const qa = await ChatbotQA.findByIdAndDelete(req.params.id);
    if (!qa) return res.status(404).json({ message: 'Q&A not found' });
    res.json({ message: 'Q&A deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete Q&A pair' });
  }
});

// Public: Get all Q&A pairs (for chatbot use)
router.get('/public-qa', async (req, res) => {
  try {
    const qas = await ChatbotQA.find();
    res.json(qas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Q&A pairs' });
  }
});

// Chatbot message endpoint
router.post('/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ response: "No message provided" });
  const lowerMessage = message.toLowerCase();
  const qas = await ChatbotQA.find();
  let response = "I'm not sure how to respond to that. Could you try rephrasing?";
  for (const qa of qas) {
    if (lowerMessage.includes(qa.question.toLowerCase())) {
      response = qa.answer;
      break;
    }
  }
  res.json({ response });
});

module.exports = router; 