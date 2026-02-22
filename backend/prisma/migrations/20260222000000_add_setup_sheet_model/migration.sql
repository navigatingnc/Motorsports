-- CreateTable
CREATE TABLE "setup_sheets" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "sessionNumber" INTEGER,
    "tyreFrontLeft" TEXT,
    "tyreFrontRight" TEXT,
    "tyreRearLeft" TEXT,
    "tyreRearRight" TEXT,
    "tyrePressureFrontLeft" DOUBLE PRECISION,
    "tyrePressureFrontRight" DOUBLE PRECISION,
    "tyrePressureRearLeft" DOUBLE PRECISION,
    "tyrePressureRearRight" DOUBLE PRECISION,
    "rideHeightFront" DOUBLE PRECISION,
    "rideHeightRear" DOUBLE PRECISION,
    "springRateFront" DOUBLE PRECISION,
    "springRateRear" DOUBLE PRECISION,
    "damperFront" TEXT,
    "damperRear" TEXT,
    "camberFront" DOUBLE PRECISION,
    "camberRear" DOUBLE PRECISION,
    "toeInFront" DOUBLE PRECISION,
    "toeInRear" DOUBLE PRECISION,
    "frontWingAngle" DOUBLE PRECISION,
    "rearWingAngle" DOUBLE PRECISION,
    "downforceLevel" TEXT,
    "brakeBias" DOUBLE PRECISION,
    "brakeCompound" TEXT,
    "engineMap" TEXT,
    "differentialEntry" DOUBLE PRECISION,
    "differentialMid" DOUBLE PRECISION,
    "differentialExit" DOUBLE PRECISION,
    "fuelLoad" DOUBLE PRECISION,
    "notes" TEXT,
    "driverFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setup_sheets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
