import { S3Client } from '@aws-sdk/client-s3';

/**
 * Build and export a singleton S3Client.
 *
 * Supports:
 *  - AWS S3          — leave S3_ENDPOINT blank
 *  - MinIO           — set S3_ENDPOINT to http://localhost:9000
 *  - Cloudflare R2   — set S3_ENDPOINT to https://<account-id>.r2.cloudflarestorage.com
 *  - Backblaze B2    — set S3_ENDPOINT to https://s3.<region>.backblazeb2.com
 */

const region    = process.env['S3_REGION']           || 'us-east-1';
const endpoint  = process.env['S3_ENDPOINT']         || undefined;
const accessKey = process.env['S3_ACCESS_KEY_ID']    || '';
const secretKey = process.env['S3_SECRET_ACCESS_KEY']|| '';

export const s3Client = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  credentials: {
    accessKeyId:     accessKey,
    secretAccessKey: secretKey,
  },
});

export const S3_BUCKET       = process.env['S3_BUCKET_NAME']       || 'motorsports-uploads';
export const S3_PUBLIC_BASE  = process.env['S3_PUBLIC_BASE_URL']   || '';
export const PRESIGNED_EXPIRY = parseInt(process.env['PRESIGNED_URL_EXPIRES_IN'] || '3600', 10);
