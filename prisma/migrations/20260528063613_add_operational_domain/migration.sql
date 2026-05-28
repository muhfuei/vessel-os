-- CreateEnum
CREATE TYPE "OperationalDomain" AS ENUM ('MANAGEMENT', 'TECHNICAL', 'MARINE_OPERATIONS', 'PURCHASING', 'HR', 'SHIPYARD', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "operationalDomain" "OperationalDomain";
