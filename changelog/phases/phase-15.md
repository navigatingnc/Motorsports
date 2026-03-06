# Phase 15: Backend + Frontend: Photo & Document Uploads (S3)

**Date:** 2026-02-27  
**Status:** ✅ Completed

---

**Branch:** `phase-15-photo-document-uploads`

### Summary

Phase 15 implements a complete, S3-compatible file upload system for the Motorsports Management App. Files are uploaded client-side directly to an S3-compatible object store using presigned PUT URLs. A new `Upload` Prisma model persists file metadata after the upload is confirmed. The frontend gains a reusable `PhotoGallery` component with drag-and-drop, upload progress, a photo lightbox, a document list, and per-file delete with confirmation.

**Key design decisions:**
- **Presigned URL flow** — client requests a signed PUT URL, uploads directly to S3, then calls `/api/uploads/confirm` to persist metadata.
- **S3-compatible** — works with AWS S3, MinIO, Cloudflare R2, Backblaze B2 via `S3_ENDPOINT` env var.
- **MIME-type validation** — server validates allowed image and document MIME types before issuing a presigned URL.
- **RBAC** — presign/confirm require `admin` or `user` role; list/download available to all authenticated users; delete restricted to uploader or admin.
- **Non-destructive entity relations** — `vehicleId` and `eventId` use `onDelete: SetNull`.

### Files Added

- `backend/src/config/s3.config.ts` — S3Client singleton, exports `s3Client`, `S3_BUCKET`, `S3_PUBLIC_BASE`, `PRESIGNED_EXPIRY`.
- `backend/src/types/upload.types.ts` — `UploadEntityType`, `FileCategory`, `PresignedUploadRequest`, `PresignedUploadResponse`, `ConfirmUploadRequest`, `ListUploadsQuery`.
- `backend/src/controllers/upload.controller.ts` — `getPresignedUploadUrl`, `confirmUpload`, `listUploads`, `getDownloadUrl`, `deleteUpload`.
- `backend/src/routes/upload.routes.ts` — POST `/presign`, POST `/confirm`, GET `/`, GET `/:id/download`, DELETE `/:id`.
- `backend/prisma/migrations/20260227000000_add_upload_model/migration.sql` — Creates `uploads` table with indexes and foreign keys.
- `frontend/src/types/upload.ts` — `Upload`, `PresignUploadRequest`, `PresignUploadResponse`, `ConfirmUploadRequest`.
- `frontend/src/services/uploadService.ts` — `getPresignedUrl`, `uploadToS3`, `confirmUpload`, `uploadFile` (full flow), `listUploads`, `getDownloadUrl`, `deleteUpload`.
- `frontend/src/components/PhotoGallery.tsx` — Tabbed Photos/Documents UI, drag-and-drop drop zone, progress bars, lightbox, document list, two-step delete, RBAC-aware.
- `frontend/src/gallery.css` — Full CSS for gallery component.

### Files Modified

- `backend/prisma/schema.prisma` — Added `Upload` model; added `uploads Upload[]` back-relations to `Vehicle`, `Event`, `User`.
- `backend/src/index.ts` — Registered `/api/uploads` route.
- `backend/.env.example` — Added S3 configuration variables.
- `backend/package.json` — Added `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `multer`, `@types/multer`, `uuid`, `@types/uuid`.
- `frontend/src/pages/VehicleDetailPage.tsx` — Integrated `PhotoGallery` above the lap time history section.
- `frontend/src/pages/EventDetailPage.tsx` — Integrated `PhotoGallery` above the Weather Forecast section.

### Next Phase Preview

**Phase 16** will implement **Responsive UI Polish & Dark Mode** — adding a CSS custom-property-based dark mode toggle in the navbar, auditing and fixing all responsive breakpoints for mobile/tablet/desktop, and adding skeleton loading states and micro-animations for improved UX.

---
