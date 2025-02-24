-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "registrationNo" TEXT,
ADD COLUMN     "specialization" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "sex" TEXT;

-- CreateTable
CREATE TABLE "EhrRecord" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" TEXT,
    "temperature" TEXT,
    "pulseRate" TEXT,
    "bloodPressure" TEXT,
    "respirationRate" TEXT,
    "oxygenSaturation" TEXT,
    "painScore" TEXT,
    "chiefComplaints" TEXT,
    "diagnosis" TEXT,
    "investigation" TEXT,
    "medicines" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EhrRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EhrRecord_appointmentId_key" ON "EhrRecord"("appointmentId");

-- AddForeignKey
ALTER TABLE "EhrRecord" ADD CONSTRAINT "EhrRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EhrRecord" ADD CONSTRAINT "EhrRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EhrRecord" ADD CONSTRAINT "EhrRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
