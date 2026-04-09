const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

// ── S3 client ────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'hostn-images';

// ── Image size presets ───────────────────────────────────────────────────────
const SIZES = {
  original: { width: 2000, quality: 82 },
  large:    { width: 1200, quality: 80 },
  medium:   { width: 600,  quality: 78 },
  thumbnail:{ width: 300,  quality: 75 },
};

/**
 * Generate a unique key for S3
 * @param {string} folder - e.g. 'properties', 'avatars'
 * @param {string} sizeName - e.g. 'original', 'large'
 * @returns {string} S3 object key
 */
function generateKey(folder, sizeName) {
  const id = crypto.randomUUID();
  return `${folder}/${id}-${sizeName}.webp`;
}

/**
 * Resize buffer to WebP at a given width
 */
async function resizeToWebp(buffer, width, quality) {
  return sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

/**
 * Upload a single buffer to S3
 */
async function putObject(key, buffer, contentType = 'image/webp') {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

/**
 * Build the public URL for an S3 object.
 * Uses CloudFront if configured, otherwise direct S3 URL.
 */
function getPublicUrl(key) {
  if (process.env.AWS_CLOUDFRONT_URL) {
    return `${process.env.AWS_CLOUDFRONT_URL.replace(/\/+$/, '')}/${key}`;
  }
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`;
}

/**
 * Upload an image buffer to S3 in multiple sizes.
 * Returns URLs for each size + metadata.
 *
 * @param {Buffer} buffer - Raw image buffer from multer
 * @param {Object} options
 * @param {string} options.folder - S3 folder prefix (e.g. 'properties', 'avatars')
 * @returns {Promise<{url: string, sizes: Record<string, string>, key: string, width: number, height: number}>}
 */
async function uploadToS3(buffer, options = {}) {
  const folder = options.folder || 'uploads';

  // Get original image metadata
  const metadata = await sharp(buffer).metadata();

  // Generate a shared base ID so all sizes share same UUID
  const id = crypto.randomUUID();

  const uploadPromises = Object.entries(SIZES).map(async ([sizeName, config]) => {
    const key = `${folder}/${id}-${sizeName}.webp`;
    const resized = await resizeToWebp(buffer, config.width, config.quality);
    await putObject(key, resized);
    return { sizeName, key, url: getPublicUrl(key) };
  });

  const results = await Promise.all(uploadPromises);

  // Build sizes map
  const sizes = {};
  let mainKey = '';
  for (const r of results) {
    sizes[r.sizeName] = r.url;
    if (r.sizeName === 'large') mainKey = r.key;
  }

  return {
    url: sizes.large,        // Primary URL for backward compatibility
    sizes,                   // { original, large, medium, thumbnail }
    key: mainKey,            // S3 key of the main (large) image
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Delete all size variants of an image from S3.
 * @param {string} key - The S3 key of any size variant (we extract the UUID)
 */
async function deleteFromS3(key) {
  // Extract folder and UUID from key like "properties/uuid-large.webp"
  const match = key.match(/^(.+)\/([a-f0-9-]+)-\w+\.webp$/);
  if (!match) {
    // Fallback: delete just the one key
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return;
  }

  const [, folder, uuid] = match;
  const deletePromises = Object.keys(SIZES).map((sizeName) =>
    s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: `${folder}/${uuid}-${sizeName}.webp`,
    })).catch(() => {}) // Ignore if a variant doesn't exist
  );

  await Promise.all(deletePromises);
}

module.exports = { uploadToS3, deleteFromS3 };
