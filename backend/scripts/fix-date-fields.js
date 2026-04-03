/**
 * Fix corrupted date fields in MongoDB.
 *
 * Some documents have createdAt / updatedAt stored as Extended JSON
 * objects  { $date: '2026-...' }  instead of native BSON Date.
 * This script finds them and converts to proper Date values.
 *
 * Usage:  MONGODB_URI=... node scripts/fix-date-fields.js
 * Or on Railway shell:  node scripts/fix-date-fields.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function fix() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Collections that use timestamps
  const collections = [
    'users', 'properties', 'bookings', 'reviews',
    'conversations', 'messages', 'notifications',
    'otps', 'payments', 'wallets', 'wallettransactions',
  ];

  for (const name of collections) {
    const col = db.collection(name);

    // Find docs where createdAt is an object (has $date key) instead of Date
    const corruptedCreated = await col.find({
      'createdAt.$date': { $exists: true },
    }).toArray();

    const corruptedUpdated = await col.find({
      'updatedAt.$date': { $exists: true },
    }).toArray();

    const allIds = new Set([
      ...corruptedCreated.map(d => d._id.toString()),
      ...corruptedUpdated.map(d => d._id.toString()),
    ]);

    if (allIds.size === 0) {
      console.log(`${name}: OK (no corrupted dates)`);
      continue;
    }

    // Merge into a single map by _id
    const docsMap = {};
    for (const d of [...corruptedCreated, ...corruptedUpdated]) {
      docsMap[d._id.toString()] = d;
    }

    let fixed = 0;
    for (const doc of Object.values(docsMap)) {
      const update = {};

      if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.$date) {
        update.createdAt = new Date(doc.createdAt.$date);
      }
      if (doc.updatedAt && typeof doc.updatedAt === 'object' && doc.updatedAt.$date) {
        update.updatedAt = new Date(doc.updatedAt.$date);
      }

      if (Object.keys(update).length > 0) {
        await col.updateOne({ _id: doc._id }, { $set: update });
        fixed++;
      }
    }

    console.log(`${name}: fixed ${fixed} document(s)`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

fix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
