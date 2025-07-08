-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentType" TEXT,
ADD COLUMN     "bookingType" TEXT,
ADD COLUMN     "customAppointmentType" TEXT,
ADD COLUMN     "relationship" TEXT;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "image_slug" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "relationship" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_relationship_name_phone_key" ON "Patient"("relationship", "name", "phone"); 