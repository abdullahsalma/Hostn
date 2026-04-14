const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @desc    Submit a public contact message (no auth required)
// @route   POST /api/v1/contact
// @access  Public
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    await Contact.create({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });

    res.status(201).json({ success: true, message: 'Message received' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
