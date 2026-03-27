require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Property = require('../src/models/Property');

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanup() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Deactivate test properties
  const result = await Property.updateMany(
    { title: { $regex: /test/i } },
    { $set: { isActive: false, isApproved: false } }
  );

  console.log(`Deactivated ${result.modifiedCount} test properties`);

  await mongoose.disconnect();
  console.log('Done');
}

cleanup().catch(console.error);
