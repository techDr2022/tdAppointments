-- CreateTable
CREATE TABLE "MessageLog" (
    "id" SERIAL NOT NULL,
    "messageSid" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "messageType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageLog_messageSid_key" ON "MessageLog"("messageSid");

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Handle drift: Remove any existing unique constraint on phone column if it exists
-- This is a safe operation - it will only run if the constraint exists
DO $$ 
BEGIN
    -- Check if unique constraint on phone exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Patient' 
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = 'phone'
        AND array_length(string_to_array(kcu.constraint_name, '_'), 1) = 2 -- Single column constraint
    ) THEN
        EXECUTE 'ALTER TABLE "Patient" DROP CONSTRAINT ' || (
            SELECT tc.constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'Patient' 
            AND tc.constraint_type = 'UNIQUE'
            AND kcu.column_name = 'phone'
            LIMIT 1
        );
    END IF;
END $$;

-- Ensure the correct unique constraint exists on (relationship, name, phone)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Patient' 
        AND tc.constraint_type = 'UNIQUE'
        AND tc.constraint_name LIKE '%relationship_name_phone%'
    ) THEN
        ALTER TABLE "Patient" ADD CONSTRAINT "Patient_relationship_name_phone_key" UNIQUE ("relationship", "name", "phone");
    END IF;
END $$;