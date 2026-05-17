-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('ANNUAL', 'INTERMEDIATE', 'SPECIAL', 'DOCKING', 'CONTINUOUS', 'RENEWAL');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DUE', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('CLIENT_VETTING', 'INTERNAL_SUPERINTENDENT', 'PRE_PSC', 'PORT_STATE_CONTROL', 'FLAG_STATE', 'ISM_AUDIT', 'CLASS_SURVEY');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "type" "SurveyType" NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'DUE',
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "surveyor" TEXT,
    "surveySociety" TEXT,
    "place" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vesselId" TEXT NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "inspectorName" TEXT,
    "inspectorRole" TEXT,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "port" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'OPEN',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vesselId" TEXT NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeficiencyReport" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "regulatoryRef" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "correctiveAction" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionId" TEXT NOT NULL,

    CONSTRAINT "DeficiencyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PunchListItem" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "status" "ItemStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionId" TEXT NOT NULL,

    CONSTRAINT "PunchListItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeficiencyReport" ADD CONSTRAINT "DeficiencyReport_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunchListItem" ADD CONSTRAINT "PunchListItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
