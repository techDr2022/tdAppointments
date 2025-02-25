-- CreateEnum
CREATE TYPE "TimeSlotType" AS ENUM ('MANUAL', 'FORM');

-- AlterTable
ALTER TABLE "Timeslot" ADD COLUMN     "type" "TimeSlotType" NOT NULL DEFAULT 'FORM';
