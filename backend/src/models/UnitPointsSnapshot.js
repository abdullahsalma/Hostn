const mongoose = require('mongoose');

const unitPointsSnapshotSchema = new mongoose.Schema({
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
    index: true,
  },
  totalPoints: { type: Number, required: true },
  performancePoints: { type: Number, default: 0 },
  excellencePoints: { type: Number, default: 0 },
  breakdown: {
    nightsBooked: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    responseSpeed: { type: Number, default: 0 },
    photosUpdated: { type: Number, default: 0 },
    videoUpdated: { type: Number, default: 0 },
    tourismPermit: { type: Number, default: 0 },
    unitAvailability: { type: Number, default: 0 },
    arrivalInstructions: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

unitPointsSnapshotSchema.index({ unit: 1, createdAt: -1 });

module.exports = mongoose.model('UnitPointsSnapshot', unitPointsSnapshotSchema);
