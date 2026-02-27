import { Router } from 'express';
import {
  getPresignedUploadUrl,
  confirmUpload,
  listUploads,
  getDownloadUrl,
  deleteUpload,
} from '../controllers/upload.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All upload routes require authentication
router.use(authenticate);

// ── Presign & confirm ─────────────────────────────────────────────────────────
// Generate a presigned PUT URL for direct-to-S3 upload
router.post('/presign',  requireRole('admin', 'user'), getPresignedUploadUrl);
// Confirm a completed upload and persist metadata
router.post('/confirm',  requireRole('admin', 'user'), confirmUpload);

// ── List uploads ──────────────────────────────────────────────────────────────
// GET /api/uploads?entityType=vehicle&entityId=<id>&category=photo
router.get('/', listUploads);

// ── Per-record operations ─────────────────────────────────────────────────────
// Generate a short-lived download URL for a specific file
router.get('/:id/download', getDownloadUrl);
// Delete a file from S3 and remove its DB record
router.delete('/:id', deleteUpload);

export default router;
