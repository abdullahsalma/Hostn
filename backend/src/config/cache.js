/**
 * Cache utility — Redis-backed with in-memory fallback.
 * Gracefully degrades when Redis is unavailable.
 */

const { getRedisClient, isRedisConnected } = require('./redis');

// In-memory fallback cache (for when Redis is unavailable)
const memCache = new Map();
const memTTLs = new Map();

function cleanExpiredMem() {
  const now = Date.now();
  for (const [key, expiry] of memTTLs) {
    if (now > expiry) {
      memCache.delete(key);
      memTTLs.delete(key);
    }
  }
}

// Cleanup every 2 minutes
setInterval(cleanExpiredMem, 2 * 60 * 1000).unref();

/**
 * Get a cached value.
 * @param {string} key
 * @returns {Promise<unknown|null>}
 */
async function cacheGet(key) {
  if (isRedisConnected()) {
    try {
      const val = await getRedisClient().get(`hostn:${key}`);
      return val ? JSON.parse(val) : null;
    } catch {
      // Fall through to memory
    }
  }
  const expiry = memTTLs.get(key);
  if (expiry && Date.now() > expiry) {
    memCache.delete(key);
    memTTLs.delete(key);
    return null;
  }
  return memCache.get(key) || null;
}

/**
 * Set a cached value.
 * @param {string} key
 * @param {unknown} value - Will be JSON-serialized
 * @param {number} ttlSeconds - Time-to-live in seconds
 */
async function cacheSet(key, value, ttlSeconds = 300) {
  if (isRedisConnected()) {
    try {
      await getRedisClient().setEx(`hostn:${key}`, ttlSeconds, JSON.stringify(value));
      return;
    } catch {
      // Fall through to memory
    }
  }
  memCache.set(key, value);
  memTTLs.set(key, Date.now() + ttlSeconds * 1000);
}

/**
 * Delete a cached value (cache invalidation).
 * @param {string} key
 */
async function cacheDel(key) {
  if (isRedisConnected()) {
    try {
      await getRedisClient().del(`hostn:${key}`);
    } catch {
      // ignore
    }
  }
  memCache.delete(key);
  memTTLs.delete(key);
}

/**
 * Delete all keys matching a pattern (e.g., "properties:*").
 * Only works with Redis; memory fallback does simple prefix match.
 * @param {string} pattern
 */
async function cacheDelPattern(pattern) {
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      const keys = [];
      for await (const key of client.scanIterator({ MATCH: `hostn:${pattern}`, COUNT: 100 })) {
        keys.push(key);
      }
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch {
      // ignore
    }
  }
  // Memory fallback
  const prefix = pattern.replace('*', '');
  for (const key of memCache.keys()) {
    if (key.startsWith(prefix)) {
      memCache.delete(key);
      memTTLs.delete(key);
    }
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheDelPattern };
