/**
 * Promote a user to admin role.
 *
 * Usage:
 *   node scripts/promote-to-admin.js <email> [super|support|finance]
 *
 * Examples:
 *   node scripts/promote-to-admin.js admin@hostn.co          # defaults to super
 *   node scripts/promote-to-admin.js finance@hostn.co finance
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const VALID_ADMIN_ROLES = ['super', 'support', 'finance'];

async function main() {
  const email = process.argv[2];
  const adminRole = process.argv[3] || 'super';

  if (!email) {
    console.error('Usage: node scripts/promote-to-admin.js <email> [super|support|finance]');
    process.exit(1);
  }

  if (!VALID_ADMIN_ROLES.includes(adminRole)) {
    console.error(`Invalid admin role "${adminRole}". Must be one of: ${VALID_ADMIN_ROLES.join(', ')}`);
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`User not found: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const previousRole = user.role;
  const previousAdminRole = user.adminRole || 'none';

  user.role = 'admin';
  user.adminRole = adminRole;
  await user.save();

  console.log(`\nUser promoted successfully:`);
  console.log(`  Email:       ${user.email}`);
  console.log(`  Name:        ${user.name}`);
  console.log(`  Role:        ${previousRole} → admin`);
  console.log(`  Admin Role:  ${previousAdminRole} → ${adminRole}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
