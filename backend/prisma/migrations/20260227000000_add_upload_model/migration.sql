-- CreateTable: uploads
-- Phase 15 — Photo & Document Uploads (S3)

CREATE TABLE "uploads" (
    "id"           TEXT NOT NULL,
    "entityType"   TEXT NOT NULL,
    "entityId"     TEXT NOT NULL,
    "fileName"     TEXT NOT NULL,
    "fileKey"      TEXT NOT NULL,
    "fileUrl"      TEXT NOT NULL,
    "mimeType"     TEXT NOT NULL,
    "category"     TEXT NOT NULL,
    "sizeBytes"    INTEGER,
    "uploadedById" TEXT NOT NULL,
    "vehicleId"    TEXT,
    "eventId"      TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploads_fileKey_key" ON "uploads"("fileKey");
CREATE INDEX "uploads_entityType_entityId_idx" ON "uploads"("entityType", "entityId");
CREATE INDEX "uploads_uploadedById_idx" ON "uploads"("uploadedById");

-- AddForeignKey: uploadedBy -> users
ALTER TABLE "uploads"
    ADD CONSTRAINT "uploads_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: vehicle (optional)
ALTER TABLE "uploads"
    ADD CONSTRAINT "uploads_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: event (optional)
ALTER TABLE "uploads"
    ADD CONSTRAINT "uploads_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
