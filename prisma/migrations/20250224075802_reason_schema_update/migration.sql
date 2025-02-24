/*
  Warnings:

  - You are about to drop the column `remarks` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "remarks",
ADD COLUMN     "reason" TEXT;
