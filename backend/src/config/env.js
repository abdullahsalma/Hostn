/**
 * Environment variable validation — imported at server startup.
 * Fails fast with clear error messages if critical vars are missing.
 */

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const warnInProduction = [
  'MOYASAR_SECRET_KEY',
  'MOYASAR_PUBLISHABLE_KEY',
  'MOYASAR_WEBHOOK_SECRET',
];

function validateEnv() {
  const missing = [];

  for (const key of required) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('=== FATAL: Missing required environment variables ===');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('Server cannot start without these. Exiting.');
    process.exit(1);
  }

  // Warn about missing payment vars (non-fatal — payments won't work but app starts)
  if (process.env.NODE_ENV === 'production') {
    const missingPayment = warnInProduction.filter(
      (key) => !process.env[key] || process.env[key].trim() === ''
    );
    if (missingPayment.length > 0) {
      console.warn('=== WARNING: Missing payment environment variables ===');
      missingPayment.forEach((key) => console.warn(`  - ${key}`));
      console.warn('Payment processing will be disabled until these are set.');
    }
  }

  // Warn about weak JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('[SECURITY WARNING] JWT_SECRET is shorter than 32 characters. Use a strong secret in production.');
  }
}

module.exports = validateEnv;
