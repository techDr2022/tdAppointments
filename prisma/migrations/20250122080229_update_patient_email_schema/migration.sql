/*
  Warnings:

  - You are about to drop the column `mail` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "mail",
ADD COLUMN     "email" TEXT;
