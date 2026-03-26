import { z } from 'zod';

// Saudi phone number (without country code): starts with 5, 9 digits
export const saudiPhoneSchema = z
  .string()
  .regex(/^5\d{8}$/, 'Please enter a valid Saudi phone number');

// OTP: exactly 4 digits
export const otpSchema = z
  .string()
  .regex(/^\d{4}$/, 'Enter 4-digit code');

// Profile
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

// Booking
export const bookingSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().min(1, 'Check-in date required'),
  checkOut: z.string().min(1, 'Check-out date required'),
  guests: z.object({
    adults: z.number().min(1, 'At least 1 adult required'),
    children: z.number().min(0),
  }),
});

// Payment card
export const cardSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z
    .string()
    .regex(/^\d{2}$/, 'Invalid year'),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
});

// Coupon code
export const couponSchema = z
  .string()
  .min(3, 'Code too short')
  .max(20, 'Code too long')
  .regex(/^[A-Z0-9]+$/i, 'Invalid code format');

// Chat message
export const messageSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message too long');

export type ProfileFormData = z.infer<typeof profileSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
