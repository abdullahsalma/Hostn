const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentBookings,
  getNotifications,
  getEarnings,
  getCalendar,
  blockDates,
  getHostReviews,
  togglePropertyStatus,
} = require('../controllers/hostController');
const { protect, authorize } = require('../middleware/auth');
const { blockDatesRules, mongoIdParam } = require('../middleware/validate');

// All routes require host or admin role
router.use(protect);
router.use(authorize('host', 'admin'));

router.get('/stats', getDashboardStats);
router.get('/recent-bookings', getRecentBookings);
router.get('/notifications', getNotifications);
router.get('/earnings', getEarnings);
router.get('/calendar/:propertyId', mongoIdParam('propertyId'), getCalendar);
router.put('/calendar/:propertyId/block', mongoIdParam('propertyId'), blockDatesRules, blockDates);
router.get('/reviews', getHostReviews);
router.put('/properties/:id/toggle', mongoIdParam(), togglePropertyStatus);

module.exports = router;
