-- CreateTable
CREATE TABLE "AppointmentJobs" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "feedbackJobId" TEXT NOT NULL,
    "reminderJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentJobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentJobs_appointmentId_key" ON "AppointmentJobs"("appointmentId");

-- AddForeignKey
ALTER TABLE "AppointmentJobs" ADD CONSTRAINT "AppointmentJobs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
