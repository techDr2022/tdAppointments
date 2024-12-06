/*
  Warnings:

  - Made the column `timeslotId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_timeslotId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "serviceId" DROP NOT NULL,
ALTER COLUMN "timeslotId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_timeslotId_fkey" FOREIGN KEY ("timeslotId") REFERENCES "Timeslot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
