const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// All upload routes require authentication
router.use(protect);

// @desc    Upload a single image (avatar, etc.)
// @route   POST /api/upload/single
// @access  Private
router.post('/single', uploadSingle, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

// @desc    Upload multiple images (property photos)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', uploadMultiple, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
  const files = req.files.map((file) => ({
    url: `${baseUrl}/${file.filename}`,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.json({
    success: true,
    data: files,
  });
});

module.exports = router;
