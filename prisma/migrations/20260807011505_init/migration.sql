-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GUARD');

-- CreateEnum
CREATE TYPE "PatrolStatus" AS ENUM ('SUCCESS', 'OUT_OF_RANGE', 'UNKNOWN_QR', 'FLAGGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GUARD',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrolLog" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "checkpointId" TEXT,
    "guardId" TEXT NOT NULL,
    "scannedLatitude" DOUBLE PRECISION NOT NULL,
    "scannedLongitude" DOUBLE PRECISION NOT NULL,
    "gpsAccuracyMeters" DOUBLE PRECISION,
    "distanceMeters" DOUBLE PRECISION,
    "status" "PatrolStatus" NOT NULL,
    "flagReason" TEXT,
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatrolLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_qrCode_key" ON "Checkpoint"("qrCode");

-- CreateIndex
CREATE INDEX "PatrolLog_checkpointId_idx" ON "PatrolLog"("checkpointId");

-- CreateIndex
CREATE INDEX "PatrolLog_guardId_idx" ON "PatrolLog"("guardId");

-- CreateIndex
CREATE INDEX "PatrolLog_createdAt_idx" ON "PatrolLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrolLog" ADD CONSTRAINT "PatrolLog_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrolLog" ADD CONSTRAINT "PatrolLog_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
