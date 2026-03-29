const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Temporary seed endpoint - POST /api/v1/seed/host-data
// Protected by a simple secret key
router.post('/host-data', async (req, res) => {
  try {
    const { secret } = req.body;
    if (secret !== 'hostn_seed_2026_x') {
      return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    const results = { users: [], properties: [], bookings: [], reviews: [] };

    // ── 1. Setup Host User ─────────────────────────────────────────────
    let hostUser = await User.findOne({ phone: '500407888' });
    if (hostUser) {
      hostUser.role = 'host';
      hostUser.name = 'طارق الخثعمي';
      hostUser.isVerified = true;
      await hostUser.save();
      results.users.push({ action: 'updated', id: hostUser._id, role: 'host' });
    }

    // ── 2. Setup Guest Users ────────────────────────────────────────────
    let guestUser = await User.findOne({ phone: '501234567' });
    if (!guestUser) {
      guestUser = await User.create({
        name: 'محمد الرمل',
        phone: '501234567',
        phoneVerified: true,
        role: 'guest',
        isVerified: true,
      });
      results.users.push({ action: 'created', id: guestUser._id, name: 'محمد الرمل' });
    }

    let guestUser2 = await User.findOne({ phone: '509876543' });
    if (!guestUser2) {
      guestUser2 = await User.create({
        name: 'سعود الحربي',
        phone: '509876543',
        phoneVerified: true,
        role: 'guest',
        isVerified: true,
      });
      results.users.push({ action: 'created', id: guestUser2._id, name: 'سعود الحربي' });
    }

    // ── 3. Create 8 Mivara Chalets ──────────────────────────────────────
    // Only create if none exist for this host
    const existingProps = await Property.find({ host: hostUser._id });
    if (existingProps.length >= 8) {
      results.properties = existingProps.map(p => ({ id: p._id, title: p.title, status: 'already_exists' }));
    } else {
      // Clear existing
      if (existingProps.length > 0) {
        await Property.deleteMany({ host: hostUser._id });
        await Booking.deleteMany({ property: { $in: existingProps.map(p => p._id) } });
      }

      const baseProperty = {
        host: hostUser._id,
        type: 'chalet',
        location: {
          city: 'الدمام',
          district: 'سيهات',
          address: 'العروبة',
          coordinates: { lat: 26.4753, lng: 50.0497 },
        },
        amenities: ['wifi', 'pool', 'parking', 'ac', 'kitchen', 'tv', 'bbq', 'garden'],
        capacity: { maxGuests: 10, bedrooms: 2, bathrooms: 2, beds: 4 },
        rules: { checkInTime: '16:00', checkOutTime: '14:00', minNights: 1, maxNights: 14 },
        isActive: true,
        isFeatured: true,
        tags: ['شاليهات ميفارا', 'mivara'],
      };

      const prices = [
        { perNight: 880, cleaningFee: 50, discountPercent: 0 },
        { perNight: 920, cleaningFee: 50, discountPercent: 5 },
        { perNight: 850, cleaningFee: 50, discountPercent: 0 },
        { perNight: 1025, cleaningFee: 75, discountPercent: 10 },
        { perNight: 780, cleaningFee: 50, discountPercent: 0 },
        { perNight: 950, cleaningFee: 60, discountPercent: 0 },
        { perNight: 1150, cleaningFee: 100, discountPercent: 15 },
        { perNight: 800, cleaningFee: 50, discountPercent: 0 },
      ];

      const units = [];
      for (let i = 0; i < 8; i++) {
        const unitCode = `4493${i + 1}`;
        const prop = await Property.create({
          ...baseProperty,
          title: `شالية ميفارا (${i + 1}) Mivara`,
          description: `شالية فاخر ضمن منتجع ميفارا في الدمام. الوحدة رقم ${i + 1} (كود ${unitCode}). يتميز بمسبح خاص وحديقة وجلسات خارجية. مناسب للعائلات.`,
          pricing: prices[i],
          images: [
            { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', isPrimary: false },
          ],
          ratings: { average: 8.5 + (i % 3) * 0.5, count: 10 + i * 3 },
        });
        units.push(prop);
        results.properties.push({ id: prop._id, title: prop.title });
      }

      // ── 4. Create Sample Bookings ──────────────────────────────────────
      const now = new Date();
      const bookingDefs = [
        { propIdx: 0, guest: guestUser._id, dayOffset: [-10, -8], status: 'completed', pay: 'paid', price: 880 },
        { propIdx: 1, guest: guestUser2._id, dayOffset: [-1, 2], status: 'confirmed', pay: 'paid', price: 920 },
        { propIdx: 2, guest: guestUser._id, dayOffset: [3, 5], status: 'pending', pay: 'unpaid', price: 850 },
        { propIdx: 4, guest: guestUser2._id, dayOffset: [5, 8], status: 'confirmed', pay: 'paid', price: 780 },
        { propIdx: 3, guest: guestUser._id, dayOffset: [1, 3], status: 'cancelled', pay: 'refunded', price: 1025 },
        { propIdx: 0, guest: guestUser2._id, dayOffset: [10, 12], status: 'confirmed', pay: 'paid', price: 880 },
        { propIdx: 5, guest: guestUser._id, dayOffset: [14, 17], status: 'confirmed', pay: 'paid', price: 950 },
        { propIdx: 6, guest: guestUser2._id, dayOffset: [-5, -3], status: 'completed', pay: 'paid', price: 1150 },
      ];

      for (const bd of bookingDefs) {
        const nights = bd.dayOffset[1] - bd.dayOffset[0];
        const subtotal = bd.price * nights;
        const booking = await Booking.create({
          property: units[bd.propIdx]._id,
          guest: bd.guest,
          checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + bd.dayOffset[0]),
          checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + bd.dayOffset[1]),
          guests: { adults: 2, children: 0, infants: 0 },
          status: bd.status,
          paymentStatus: bd.pay,
          pricing: (() => {
            const cleaningFee = 50;
            const serviceFee = Math.round(subtotal * 0.1);
            const discount = 0;
            const taxableAmount = subtotal + cleaningFee + serviceFee - discount;
            const vat = Math.round(taxableAmount * 0.15);
            return {
              perNight: bd.price, nights, subtotal, cleaningFee, serviceFee, discount, vat,
              total: taxableAmount + vat,
            };
          })(),
        });
        results.bookings.push({ id: booking._id, status: bd.status, property: units[bd.propIdx].title });
      }

      // ── 5. Create Sample Reviews ────────────────────────────────────────
      const completedBookings = await Booking.find({ status: 'completed' });
      if (completedBookings.length > 0) {
        try {
          const review = await Review.create({
            property: completedBookings[0].property,
            guest: completedBookings[0].guest,
            booking: completedBookings[0]._id,
            ratings: { overall: 9, cleanliness: 9, accuracy: 9, communication: 10, location: 8, value: 9, checkIn: 9 },
            comment: 'شالية ممتاز جداً، نظيف ومرتب. المسبح رائع.',
          });
          results.reviews.push({ id: review._id });
        } catch (e) {
          results.reviews.push({ error: e.message });
        }
      }
    }

    res.json({
      success: true,
      message: 'Host data seeded successfully',
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

module.exports = router;
