const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

/**
 * Atomically increments and returns the next sequence value.
 * Uses findOneAndUpdate with $inc for race-safe generation.
 * @param {string} name - Sequence name (e.g. 'payout', 'host_invoice')
 * @returns {Promise<number>} Next sequence value
 */
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
