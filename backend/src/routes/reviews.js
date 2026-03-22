const express = require('express');
const router = express.Router();
const {
  getPropertyReviews,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const {
  createReviewRules,
  respondToReviewRules,
  mongoIdParam,
} = require('../middleware/validate');

router.get('/property/:propertyId', mongoIdParam('propertyId'), getPropertyReviews);
router.post('/', protect, createReviewRules, createReview);
router.put('/:id', protect, mongoIdParam(), updateReview);
router.delete('/:id', protect, mongoIdParam(), deleteReview);
router.post('/:id/respond', protect, mongoIdParam(), respondToReviewRules, respondToReview);

module.exports = router;
