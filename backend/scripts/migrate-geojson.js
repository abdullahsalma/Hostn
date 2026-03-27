/**
 * Migration: Populate location.geoJSON from existing location.coordinates.
 * Idempotent — safe to run multiple times.
 *
 * Usage: MONGODB_URI=mongodb+srv://... node scripts/migrate-geojson.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const Property = require('../src/models/Property');

  // Find properties with coordinates but no geoJSON
  const properties = await Property.find({
    'location.coordinates.lat': { $exists: true, $ne: null },
    'location.coordinates.lng': { $exists: true, $ne: null },
    $or: [
      { 'location.geoJSON': { $exists: false } },
      { 'location.geoJSON.coordinates': { $exists: false } },
      { 'location.geoJSON.coordinates': { $size: 0 } },
    ],
  });

  console.log(`Found ${properties.length} properties to migrate`);

  let migrated = 0;
  for (const prop of properties) {
    const { lat, lng } = prop.location.coordinates;
    if (lat && lng) {
      prop.location.geoJSON = {
        type: 'Point',
        coordinates: [lng, lat],
      };
      await prop.save();
      migrated++;
    }
  }

  console.log(`Migrated ${migrated} properties with GeoJSON coordinates`);

  // Report properties missing coordinates entirely
  const missingCoords = await Property.countDocuments({
    isActive: true,
    $or: [
      { 'location.coordinates.lat': { $exists: false } },
      { 'location.coordinates.lat': null },
    ],
  });

  if (missingCoords > 0) {
    console.warn(`Warning: ${missingCoords} active properties have no coordinates`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
