-- CreateEnum
CREATE TYPE "DoctorType" AS ENUM ('INDIVIDUAL', 'CLINIC_AFFILIATED');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "clinicId" INTEGER,
ADD COLUMN     "type" "DoctorType" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateTable
CREATE TABLE "Clinic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_website_key" ON "Clinic"("website");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
