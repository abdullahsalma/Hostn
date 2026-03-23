import crypto from 'crypto';

/**
 * Webhook verification for Moyasar payment webhooks.
 *
 * Moyasar uses a `secret_token` field in the webhook JSON payload body
 * (set via `shared_secret` when creating the webhook endpoint).
 *
 * This is NOT HMAC-based — it's a simple token comparison using
 * timing-safe equality to prevent timing attacks.
 *
 * Set MOYASAR_WEBHOOK_SECRET in environment variables to match the
 * `shared_secret` you used when registering the webhook with Moyasar.
 */

const WEBHOOK_SECRET = process.env.MOYASAR_WEBHOOK_SECRET;

/**
 * Verify that the webhook payload contains the correct secret_token.
 *
 * SECURITY:
 * - MOYASAR_WEBHOOK_SECRET MUST be set or verification throws an error.
 * - Missing or mismatched secret_token always returns false.
 * - Uses timing-safe comparison to prevent timing attacks.
 *
 * @param secretToken - The secret_token value from the webhook JSON body
 * @returns true if the token matches, false otherwise
 * @throws Error if MOYASAR_WEBHOOK_SECRET is not configured
 */
export function verifyWebhookToken(secretToken: string | undefined): boolean {
  // SECURITY: Webhook secret MUST be configured in production
  if (!WEBHOOK_SECRET) {
    throw new Error(
      '[CRITICAL] MOYASAR_WEBHOOK_SECRET is not configured. ' +
      'Webhook processing is disabled until this environment variable is set. ' +
      'Use the shared_secret value you set when creating the webhook in Moyasar.'
    );
  }

  // Reject webhooks with no secret_token in the payload
  if (!secretToken || typeof secretToken !== 'string') {
    console.warn('Webhook rejected: no secret_token in payload');
    return false;
  }

  try {
    // Use timing-safe comparison to prevent timing attacks
    const tokenBuffer = Buffer.from(secretToken, 'utf8');
    const expectedBuffer = Buffer.from(WEBHOOK_SECRET, 'utf8');

    if (tokenBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch (error) {
    console.error('Webhook token verification error:', error);
    return false;
  }
}
