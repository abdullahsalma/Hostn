/**
 * Seed script to set up host user and properties on the production database.
 * Run: node scripts/seed-host-data.js
 *
 * This creates:
 * 1. Upgrades user 500407888 to host role with name "طارق الخثعمي"
 * 2. Creates a property group "شاليهات ميفارا" with 8 units (as individual properties)
 * 3. Creates a guest user for booking testing
 * 4. Creates sample bookings across units
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = require('../src/models/User');
  const Property = require('../src/models/Property');
  const Booking = require('../src/models/Booking');
  const Review = require('../src/models/Review');

  // ── 1. Setup Host User ─────────────────────────────────────────────
  console.log('\n1. Setting up host user...');
  let hostUser = await User.findOne({ phone: '500407888' });
  if (!hostUser) {
    hostUser = await User.create({
      name: 'طارق الخثعمي',
      phone: '500407888',
      phoneVerified: true,
      role: 'host',
      isVerified: true,
    });
    console.log('   Created host user:', hostUser._id);
  } else {
    hostUser.role = 'host';
    hostUser.name = 'طارق الخثعمي';
    hostUser.isVerified = true;
    await hostUser.save();
    console.log('   Updated existing user to host:', hostUser._id);
  }

  // ── 2. Setup Guest User ────────────────────────────────────────────
  console.log('\n2. Setting up guest user...');
  let guestUser = await User.findOne({ phone: '501234567' });
  if (!guestUser) {
    guestUser = await User.create({
      name: 'محمد الرمل',
      phone: '501234567',
      phoneVerified: true,
      role: 'guest',
      isVerified: true,
    });
    console.log('   Created guest user:', guestUser._id);
  } else {
    console.log('   Guest user already exists:', guestUser._id);
  }

  // Create a second guest
  let guestUser2 = await User.findOne({ phone: '509876543' });
  if (!guestUser2) {
    guestUser2 = await User.create({
      name: 'سعود الحربي',
      phone: '509876543',
      phoneVerified: true,
      role: 'guest',
      isVerified: true,
    });
    console.log('   Created guest user 2:', guestUser2._id);
  }

  // ── 3. Create Properties (8 Mivara Chalets as individual properties) ──
  console.log('\n3. Creating Mivara chalet properties...');

  // Delete old properties for this host to start fresh
  await Property.deleteMany({ host: hostUser._id });
  await Booking.deleteMany({}); // Clear bookings too since properties are being recreated
  await Review.deleteMany({});

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
    rules: {
      checkInTime: '16:00',
      checkOutTime: '14:00',
      minNights: 1,
      maxNights: 14,
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
    },
    isActive: true,
    isFeatured: true,
    tags: ['شاليهات ميفارا', 'mivara'],
  };

  const units = [];
  for (let i = 1; i <= 8; i++) {
    const unitCode = `4493${i}`;
    const prices = {
      1: { perNight: 880, cleaningFee: 50, discountPercent: 0 },
      2: { perNight: 920, cleaningFee: 50, discountPercent: 5 },
      3: { perNight: 850, cleaningFee: 50, discountPercent: 0 },
      4: { perNight: 1025, cleaningFee: 75, discountPercent: 10 },
      5: { perNight: 780, cleaningFee: 50, discountPercent: 0 },
      6: { perNight: 950, cleaningFee: 60, discountPercent: 0 },
      7: { perNight: 1150, cleaningFee: 100, discountPercent: 15 },
      8: { perNight: 800, cleaningFee: 50, discountPercent: 0 },
    };

    const prop = await Property.create({
      ...baseProperty,
      title: `شالية ميفارا (${i}) Mivara`,
      description: `شالية فاخر ضمن منتجع ميفارا في الدمام. الوحدة رقم ${i} (كود ${unitCode}). يتميز بمسبح خاص وحديقة وجلسات خارجية. مناسب للعائلات.`,
      pricing: prices[i],
      images: [
        { url: `https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800`, isPrimary: true, caption: `شالية ميفارا ${i}` },
        { url: `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800`, isPrimary: false, caption: 'المسبح' },
      ],
      ratings: { average: 8.5 + (i % 3) * 0.5, count: 10 + i * 3 },
    });
    units.push(prop);
    console.log(`   Created unit ${i}: ${prop.title} (${prop._id})`);
  }

  // ── 4. Create Sample Bookings ──────────────────────────────────────
  console.log('\n4. Creating sample bookings...');

  const now = new Date();
  const bookings = [
    // Past confirmed booking (unit 1)
    {
      property: units[0]._id,
      guest: guestUser._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
      guests: { adults: 2, children: 1, infants: 0 },
      status: 'completed',
      paymentStatus: 'paid',
      pricing: { perNight: 880, nights: 2, subtotal: 1760, cleaningFee: 50, serviceFee: 176, discount: 0, total: 1986 },
    },
    // Current confirmed booking (unit 2) - check in yesterday
    {
      property: units[1]._id,
      guest: guestUser2._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      guests: { adults: 4, children: 0, infants: 0 },
      status: 'confirmed',
      paymentStatus: 'paid',
      pricing: { perNight: 920, nights: 3, subtotal: 2760, cleaningFee: 50, serviceFee: 276, discount: 138, total: 2948 },
    },
    // Upcoming pending booking (unit 3)
    {
      property: units[2]._id,
      guest: guestUser._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      guests: { adults: 3, children: 2, infants: 0 },
      status: 'pending',
      paymentStatus: 'unpaid',
      pricing: { perNight: 850, nights: 2, subtotal: 1700, cleaningFee: 50, serviceFee: 170, discount: 0, total: 1920 },
    },
    // Upcoming confirmed booking (unit 5)
    {
      property: units[4]._id,
      guest: guestUser2._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8),
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'confirmed',
      paymentStatus: 'paid',
      pricing: { perNight: 780, nights: 3, subtotal: 2340, cleaningFee: 50, serviceFee: 234, discount: 0, total: 2624 },
    },
    // Cancelled booking (unit 4)
    {
      property: units[3]._id,
      guest: guestUser._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'cancelled',
      paymentStatus: 'refunded',
      cancellationReason: 'تغيير في الخطط',
      pricing: { perNight: 1025, nights: 2, subtotal: 2050, cleaningFee: 75, serviceFee: 205, discount: 205, total: 2125 },
    },
    // Future booking next week (unit 1)
    {
      property: units[0]._id,
      guest: guestUser2._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
      guests: { adults: 6, children: 2, infants: 1 },
      status: 'confirmed',
      paymentStatus: 'paid',
      pricing: { perNight: 880, nights: 2, subtotal: 1760, cleaningFee: 50, serviceFee: 176, discount: 0, total: 1986 },
    },
    // Future booking (unit 6)
    {
      property: units[5]._id,
      guest: guestUser._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 17),
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'confirmed',
      paymentStatus: 'paid',
      pricing: { perNight: 950, nights: 3, subtotal: 2850, cleaningFee: 60, serviceFee: 285, discount: 0, total: 3195 },
    },
    // No-show booking (unit 7)
    {
      property: units[6]._id,
      guest: guestUser2._id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'cancelled',
      paymentStatus: 'refunded',
      cancellationReason: 'عدم حضور',
      pricing: { perNight: 1150, nights: 2, subtotal: 2300, cleaningFee: 100, serviceFee: 230, discount: 345, total: 2285 },
    },
  ];

  for (const bookingData of bookings) {
    const booking = await Booking.create(bookingData);
    console.log(`   Created booking: ${booking.status} for property ${bookingData.property} (${booking._id})`);
  }

  // ── 5. Create Sample Reviews ───────────────────────────────────────
  console.log('\n5. Creating sample reviews...');

  const reviewData = [
    {
      property: units[0]._id,
      guest: guestUser._id,
      booking: (await Booking.findOne({ property: units[0]._id, status: 'completed' }))?._id,
      ratings: { overall: 9, cleanliness: 9, accuracy: 9, communication: 10, location: 8, value: 9, checkIn: 9 },
      comment: 'شالية ممتاز جداً، نظيف ومرتب. المسبح رائع والجلسة الخارجية مريحة. بالتأكيد سأعود مرة أخرى.',
    },
    {
      property: units[1]._id,
      guest: guestUser2._id,
      ratings: { overall: 8, cleanliness: 8, accuracy: 7, communication: 9, location: 8, value: 7, checkIn: 8 },
      comment: 'تجربة جيدة بشكل عام. الموقع ممتاز والخدمة سريعة.',
    },
    {
      property: units[2]._id,
      guest: guestUser._id,
      ratings: { overall: 10, cleanliness: 10, accuracy: 10, communication: 10, location: 9, value: 9, checkIn: 10 },
      comment: 'أفضل شالية جربته! كل شيء كان مثالي. شكراً للمضيف على حسن الضيافة.',
    },
  ];

  for (const rd of reviewData) {
    if (!rd.booking) delete rd.booking;
    try {
      const review = await Review.create(rd);
      console.log(`   Created review for property ${rd.property} (${review._id})`);
    } catch (e) {
      console.log(`   Review creation skipped: ${e.message}`);
    }
  }

  // ── Done ───────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!');
  console.log(`   Host user: ${hostUser.name} (${hostUser._id}) role=${hostUser.role}`);
  console.log(`   Properties: ${units.length} Mivara chalets created`);
  console.log(`   Bookings: ${bookings.length} sample bookings created`);
  console.log(`   Guest users: ${guestUser.name}, ${guestUser2.name}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
