/*
  Warnings:

  - The `type` column on the `Timeslot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Timeslot" DROP COLUMN "type",
ADD COLUMN     "type" TEXT;

-- DropEnum
DROP TYPE "TimeSlotType";
