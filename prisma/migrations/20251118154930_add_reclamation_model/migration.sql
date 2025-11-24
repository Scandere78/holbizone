-- CreateEnum
CREATE TYPE "ReclamationType" AS ENUM ('BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReclamationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReclamationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Reclamation" (
    "id" TEXT NOT NULL,
    "type" "ReclamationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ReclamationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ReclamationStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reclamation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reclamation_userId_createdAt_idx" ON "Reclamation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Reclamation_status_createdAt_idx" ON "Reclamation"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
