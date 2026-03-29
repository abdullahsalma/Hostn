const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinaryUpload');

// All upload routes require authentication
router.use(protect);

// @desc    Upload a single image (avatar, etc.)
// @route   POST /api/upload/single
// @access  Private
router.post('/single', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'hostn/uploads',
    });

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('[Upload] Cloudinary single upload failed:', error.message);
    res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
  }
});

// @desc    Upload multiple images (property photos)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, { folder: 'hostn/uploads' }).then((result) => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        size: file.size,
        mimetype: file.mimetype,
      }))
    );

    const files = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('[Upload] Cloudinary multiple upload failed:', error.message);
    res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
  }
});

module.exports = router;
