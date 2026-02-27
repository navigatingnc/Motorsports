"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All upload routes require authentication
router.use(auth_middleware_1.authenticate);
// ── Presign & confirm ─────────────────────────────────────────────────────────
// Generate a presigned PUT URL for direct-to-S3 upload
router.post('/presign', (0, auth_middleware_1.requireRole)('admin', 'user'), upload_controller_1.getPresignedUploadUrl);
// Confirm a completed upload and persist metadata
router.post('/confirm', (0, auth_middleware_1.requireRole)('admin', 'user'), upload_controller_1.confirmUpload);
// ── List uploads ──────────────────────────────────────────────────────────────
// GET /api/uploads?entityType=vehicle&entityId=<id>&category=photo
router.get('/', upload_controller_1.listUploads);
// ── Per-record operations ─────────────────────────────────────────────────────
// Generate a short-lived download URL for a specific file
router.get('/:id/download', upload_controller_1.getDownloadUrl);
// Delete a file from S3 and remove its DB record
router.delete('/:id', upload_controller_1.deleteUpload);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map