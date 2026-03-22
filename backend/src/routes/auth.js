const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  mongoIdParam,
} = require('../middleware/validate');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileRules, updateProfile);
router.put('/change-password', protect, changePasswordRules, changePassword);
router.post('/wishlist/:propertyId', protect, mongoIdParam('propertyId'), toggleWishlist);

module.exports = router;
