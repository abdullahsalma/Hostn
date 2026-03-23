/**
 * Logging utility for payment, booking, and system events.
 *
 * Uses the ActivityLog model for persistent, queryable logs.
 * All functions are async and should be called fire-and-forget
 * (don't await in request handlers to avoid blocking responses).
 */

import { dbConnect } from '@/lib/db';
import ActivityLog from '@/lib/models/ActivityLog';
import mongoose from 'mongoose';

type EventAction =
  | 'payment_initiated'
  | 'payment_verified'
  | 'payment_failed'
  | 'refund_requested'
  | 'refund_processed'
  | 'refund_failed'
  | 'payout_completed'
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'image_uploaded'
  | 'property_approved'
  | 'property_rejected'
  | 'property_created'
  | 'user_banned'
  | 'user_unbanned'
  | 'host_suspended'
  | 'host_activated'
  | 'review_deleted'
  | 'system_action';

type TargetType = 'user' | 'property' | 'booking' | 'review' | 'system' | 'payment';

/**
 * Log a generic event to ActivityLog.
 */
export async function logEvent(
  action: EventAction,
  performedBy: string,
  targetType: TargetType,
  targetId: string,
  details: string
): Promise<void> {
  try {
    await dbConnect();
    await ActivityLog.create({
      action,
      performedBy: new mongoose.Types.ObjectId(performedBy),
      targetType,
      targetId,
      details,
    });
  } catch (error) {
    // Never let logging failures break the application
    console.error('[Logger] Failed to log event:', { action, targetId, error: (error as Error).message });
  }
}

/**
 * Log a payment-related event.
 */
export async function logPaymentEvent(
  paymentId: string,
  action: EventAction,
  details: string,
  userId?: string
): Promise<void> {
  // Use a system user ID if no userId provided (for automated events like webhooks)
  const SYSTEM_USER_ID = '000000000000000000000000';
  return logEvent(
    action,
    userId || SYSTEM_USER_ID,
    'payment',
    paymentId,
    details
  );
}

/**
 * Log a booking-related event.
 */
export async function logBookingEvent(
  bookingId: string,
  action: EventAction,
  details: string,
  userId: string
): Promise<void> {
  return logEvent(action, userId, 'booking', bookingId, details);
}
