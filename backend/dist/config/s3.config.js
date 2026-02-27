"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESIGNED_EXPIRY = exports.S3_PUBLIC_BASE = exports.S3_BUCKET = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 * Build and export a singleton S3Client.
 *
 * Supports:
 *  - AWS S3          — leave S3_ENDPOINT blank
 *  - MinIO           — set S3_ENDPOINT to http://localhost:9000
 *  - Cloudflare R2   — set S3_ENDPOINT to https://<account-id>.r2.cloudflarestorage.com
 *  - Backblaze B2    — set S3_ENDPOINT to https://s3.<region>.backblazeb2.com
 */
const region = process.env['S3_REGION'] || 'us-east-1';
const endpoint = process.env['S3_ENDPOINT'] || undefined;
const accessKey = process.env['S3_ACCESS_KEY_ID'] || '';
const secretKey = process.env['S3_SECRET_ACCESS_KEY'] || '';
exports.s3Client = new client_s3_1.S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    },
});
exports.S3_BUCKET = process.env['S3_BUCKET_NAME'] || 'motorsports-uploads';
exports.S3_PUBLIC_BASE = process.env['S3_PUBLIC_BASE_URL'] || '';
exports.PRESIGNED_EXPIRY = parseInt(process.env['PRESIGNED_URL_EXPIRES_IN'] || '3600', 10);
//# sourceMappingURL=s3.config.js.map