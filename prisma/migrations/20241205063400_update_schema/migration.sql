/*
  Warnings:

  - You are about to drop the column `location` on the `Timeslot` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Timeslot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isavaliable` to the `Timeslot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Timeslot" DROP CONSTRAINT "Timeslot_serviceId_fkey";

-- AlterTable
ALTER TABLE "Timeslot" DROP COLUMN "location",
DROP COLUMN "serviceId",
ADD COLUMN     "isavaliable" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");
