-- CreateTable: parts
-- Phase 14: Parts & Inventory Management
-- Adds the parts table with optional vehicle relation and low-stock threshold.

CREATE TABLE "parts" (
    "id"                 TEXT NOT NULL,
    "name"               TEXT NOT NULL,
    "partNumber"         TEXT,
    "category"           TEXT NOT NULL,
    "quantity"           INTEGER NOT NULL DEFAULT 0,
    "unit"               TEXT NOT NULL DEFAULT 'pcs',
    "cost"               DOUBLE PRECISION,
    "supplier"           TEXT,
    "location"           TEXT,
    "lowStockThreshold"  INTEGER NOT NULL DEFAULT 2,
    "notes"              TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    "vehicleId"          TEXT,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
