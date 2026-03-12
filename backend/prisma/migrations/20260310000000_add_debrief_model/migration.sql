-- CreateTable: debriefs
-- Phase 26 — AI-Powered Lap Time Coaching & Debrief
CREATE TABLE "debriefs" (
    "id"          TEXT NOT NULL,
    "lapTimeId"   TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "messages"    JSONB NOT NULL,
    "title"       TEXT NOT NULL DEFAULT 'Lap Debrief',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "debriefs_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "debriefs_lapTimeId_idx" ON "debriefs"("lapTimeId");
CREATE INDEX "debriefs_userId_idx" ON "debriefs"("userId");
-- AddForeignKey: lapTime -> lap_times
ALTER TABLE "debriefs"
    ADD CONSTRAINT "debriefs_lapTimeId_fkey"
    FOREIGN KEY ("lapTimeId") REFERENCES "lap_times"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey: user -> users
ALTER TABLE "debriefs"
    ADD CONSTRAINT "debriefs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
