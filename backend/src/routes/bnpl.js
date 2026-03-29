const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  checkAvailability,
  createTabbyCheckout,
  verifyTabbyPayment,
  createTamaraCheckout,
  verifyTamaraPayment,
  tabbyWebhook,
  tamaraWebhook,
} = require('../controllers/bnplController');

// Public webhook endpoints (called by Tabby/Tamara servers)
router.post('/webhook/tabby', tabbyWebhook);
router.post('/webhook/tamara', tamaraWebhook);

// Protected routes
router.use(protect);

// Availability check
router.get('/availability', checkAvailability);

// Tabby
router.post('/tabby/create', createTabbyCheckout);
router.post('/tabby/verify', verifyTabbyPayment);

// Tamara
router.post('/tamara/create', createTamaraCheckout);
router.post('/tamara/verify', verifyTamaraPayment);

module.exports = router;
