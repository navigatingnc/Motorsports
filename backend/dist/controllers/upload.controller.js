"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUpload = exports.getDownloadUrl = exports.listUploads = exports.confirmUpload = exports.getPresignedUploadUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const s3_config_1 = require("../config/s3.config");
const prisma_1 = __importDefault(require("../prisma"));
// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/svg+xml', 'image/heic', 'image/heif',
]);
const ALLOWED_DOCUMENT_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
]);
const ALLOWED_MIME_TYPES = new Set([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
// ── Helper: derive public URL ─────────────────────────────────────────────────
function buildPublicUrl(fileKey) {
    if (s3_config_1.S3_PUBLIC_BASE) {
        return `${s3_config_1.S3_PUBLIC_BASE.replace(/\/$/, '')}/${fileKey}`;
    }
    // Fallback: standard AWS S3 URL pattern
    const region = process.env['S3_REGION'] || 'us-east-1';
    return `https://${s3_config_1.S3_BUCKET}.s3.${region}.amazonaws.com/${fileKey}`;
}
// ── Helper: sanitise file name ────────────────────────────────────────────────
function sanitiseFileName(name) {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 200);
}
// ── POST /api/uploads/presign ─────────────────────────────────────────────────
/**
 * Generate a presigned PUT URL so the client can upload directly to S3.
 * The file is NOT yet recorded in the database — call /confirm after upload.
 */
const getPresignedUploadUrl = async (req, res) => {
    const { entityType, entityId, fileName, fileType, category } = req.body;
    // ── Validation ──────────────────────────────────────────────────────────────
    if (!entityType || !entityId || !fileName || !fileType || !category) {
        res.status(400).json({
            success: false,
            error: 'entityType, entityId, fileName, fileType, and category are all required.',
        });
        return;
    }
    const validEntityTypes = ['vehicle', 'event'];
    if (!validEntityTypes.includes(entityType)) {
        res.status(400).json({
            success: false,
            error: `entityType must be one of: ${validEntityTypes.join(', ')}.`,
        });
        return;
    }
    const validCategories = ['photo', 'document'];
    if (!validCategories.includes(category)) {
        res.status(400).json({
            success: false,
            error: `category must be one of: ${validCategories.join(', ')}.`,
        });
        return;
    }
    if (!ALLOWED_MIME_TYPES.has(fileType)) {
        res.status(400).json({
            success: false,
            error: 'Unsupported file type.',
            allowedTypes: [...ALLOWED_MIME_TYPES],
        });
        return;
    }
    if (category === 'photo' && !ALLOWED_IMAGE_TYPES.has(fileType)) {
        res.status(400).json({
            success: false,
            error: 'For category "photo", only image MIME types are accepted.',
        });
        return;
    }
    if (category === 'document' && !ALLOWED_DOCUMENT_TYPES.has(fileType)) {
        res.status(400).json({
            success: false,
            error: 'For category "document", only document MIME types are accepted.',
        });
        return;
    }
    // ── Verify entity exists ────────────────────────────────────────────────────
    try {
        if (entityType === 'vehicle') {
            const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: entityId } });
            if (!vehicle) {
                res.status(404).json({ success: false, error: 'Vehicle not found.' });
                return;
            }
        }
        else if (entityType === 'event') {
            const event = await prisma_1.default.event.findUnique({ where: { id: entityId } });
            if (!event) {
                res.status(404).json({ success: false, error: 'Event not found.' });
                return;
            }
        }
    }
    catch (err) {
        console.error('[upload] Entity lookup error:', err);
        res.status(500).json({ success: false, error: 'Failed to verify entity.' });
        return;
    }
    // ── Build S3 key ────────────────────────────────────────────────────────────
    const safeFileName = sanitiseFileName(fileName);
    const fileId = (0, uuid_1.v4)();
    const fileKey = `${entityType}s/${entityId}/${category}s/${fileId}_${safeFileName}`;
    // ── Generate presigned URL ──────────────────────────────────────────────────
    try {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: s3_config_1.S3_BUCKET,
            Key: fileKey,
            ContentType: fileType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_config_1.s3Client, command, { expiresIn: s3_config_1.PRESIGNED_EXPIRY });
        const publicUrl = buildPublicUrl(fileKey);
        res.status(200).json({
            success: true,
            data: {
                uploadUrl,
                fileKey,
                publicUrl,
                expiresIn: s3_config_1.PRESIGNED_EXPIRY,
            },
        });
    }
    catch (err) {
        console.error('[upload] Presign error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate presigned URL.' });
    }
};
exports.getPresignedUploadUrl = getPresignedUploadUrl;
// ── POST /api/uploads/confirm ─────────────────────────────────────────────────
/**
 * After the client has PUT the file to S3, call this endpoint to persist
 * the upload metadata in the database.
 */
const confirmUpload = async (req, res) => {
    const { fileKey, sizeBytes } = req.body;
    const { entityType, entityId, fileName, mimeType, category } = req.body;
    if (!fileKey || !entityType || !entityId || !fileName || !mimeType || !category) {
        res.status(400).json({
            success: false,
            error: 'fileKey, entityType, entityId, fileName, mimeType, and category are required.',
        });
        return;
    }
    const uploadedById = req.user?.userId;
    if (!uploadedById) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
    }
    try {
        const publicUrl = buildPublicUrl(fileKey);
        const record = await prisma_1.default.upload.create({
            data: {
                entityType,
                entityId,
                fileName,
                fileKey,
                fileUrl: publicUrl,
                mimeType,
                category,
                sizeBytes: sizeBytes ?? null,
                uploadedById,
                vehicleId: entityType === 'vehicle' ? entityId : null,
                eventId: entityType === 'event' ? entityId : null,
            },
        });
        res.status(201).json({ success: true, data: record });
    }
    catch (err) {
        console.error('[upload] Confirm error:', err);
        res.status(500).json({ success: false, error: 'Failed to save upload record.' });
    }
};
exports.confirmUpload = confirmUpload;
// ── GET /api/uploads ──────────────────────────────────────────────────────────
/**
 * List upload records, optionally filtered by entityType, entityId, or category.
 */
const listUploads = async (req, res) => {
    const { entityType, entityId, category } = req.query;
    try {
        const uploads = await prisma_1.default.upload.findMany({
            where: {
                ...(entityType ? { entityType } : {}),
                ...(entityId ? { entityId } : {}),
                ...(category ? { category } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                uploadedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        res.status(200).json({ success: true, data: uploads, count: uploads.length });
    }
    catch (err) {
        console.error('[upload] List error:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve uploads.' });
    }
};
exports.listUploads = listUploads;
// ── GET /api/uploads/:id/download ─────────────────────────────────────────────
/**
 * Generate a short-lived presigned GET URL for downloading/viewing a file.
 */
const getDownloadUrl = async (req, res) => {
    const { id } = req.params;
    try {
        const record = await prisma_1.default.upload.findUnique({ where: { id } });
        if (!record) {
            res.status(404).json({ success: false, error: 'Upload record not found.' });
            return;
        }
        const command = new client_s3_1.GetObjectCommand({ Bucket: s3_config_1.S3_BUCKET, Key: record.fileKey });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_config_1.s3Client, command, { expiresIn: 900 }); // 15 min
        res.status(200).json({ success: true, data: { downloadUrl, expiresIn: 900 } });
    }
    catch (err) {
        console.error('[upload] Download URL error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate download URL.' });
    }
};
exports.getDownloadUrl = getDownloadUrl;
// ── DELETE /api/uploads/:id ───────────────────────────────────────────────────
/**
 * Delete a file from S3 and remove its metadata record from the database.
 * Only the uploader or an admin may delete a file.
 */
const deleteUpload = async (req, res) => {
    const { id } = req.params;
    const requestingUser = req.user;
    if (!requestingUser) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
    }
    try {
        const record = await prisma_1.default.upload.findUnique({ where: { id } });
        if (!record) {
            res.status(404).json({ success: false, error: 'Upload record not found.' });
            return;
        }
        // Only the uploader or an admin can delete
        if (record.uploadedById !== requestingUser.userId && requestingUser.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this file.',
            });
            return;
        }
        // Delete from S3
        try {
            await s3_config_1.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: s3_config_1.S3_BUCKET, Key: record.fileKey }));
        }
        catch (s3Err) {
            console.warn('[upload] S3 delete warning (continuing with DB delete):', s3Err);
        }
        // Delete DB record
        await prisma_1.default.upload.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'File deleted successfully.' });
    }
    catch (err) {
        console.error('[upload] Delete error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete upload.' });
    }
};
exports.deleteUpload = deleteUpload;
//# sourceMappingURL=upload.controller.js.map