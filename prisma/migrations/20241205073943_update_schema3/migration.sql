/*
  Warnings:

  - You are about to drop the column `isavaliable` on the `Timeslot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Timeslot" DROP COLUMN "isavaliable",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
