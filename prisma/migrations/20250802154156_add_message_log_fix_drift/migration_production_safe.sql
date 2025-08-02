-- Production-Safe Migration for MessageLog
-- This version separates concerns and includes transaction safety

BEGIN;

-- Step 1: Create MessageLog table (safe, non-blocking)
CREATE TABLE IF NOT EXISTS "MessageLog" (
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

-- Step 2: Create unique index (safe, can be done online)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "MessageLog_messageSid_key" 
ON "MessageLog"("messageSid");

-- Step 3: Add foreign key constraints (validates existing data)
DO $$ 
BEGIN
    -- Add appointmentId foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'MessageLog_appointmentId_fkey' 
        AND table_name = 'MessageLog'
    ) THEN
        ALTER TABLE "MessageLog" 
        ADD CONSTRAINT "MessageLog_appointmentId_fkey" 
        FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Add patientId foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'MessageLog_patientId_fkey' 
        AND table_name = 'MessageLog'
    ) THEN
        ALTER TABLE "MessageLog" 
        ADD CONSTRAINT "MessageLog_patientId_fkey" 
        FOREIGN KEY ("patientId") REFERENCES "Patient"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 4: Handle Patient table constraint drift (separate transaction-safe operation)
DO $$ 
DECLARE
    constraint_name_to_drop TEXT;
BEGIN
    -- Find any single-column phone unique constraint
    SELECT tc.constraint_name INTO constraint_name_to_drop
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'Patient' 
    AND tc.constraint_type = 'UNIQUE'
    AND kcu.column_name = 'phone'
    AND tc.constraint_name NOT LIKE '%relationship_name_phone%'
    LIMIT 1;

    -- Drop the problematic constraint if found
    IF constraint_name_to_drop IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "Patient" DROP CONSTRAINT %I', constraint_name_to_drop);
        RAISE NOTICE 'Dropped constraint: %', constraint_name_to_drop;
    END IF;

    -- Ensure correct unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Patient_relationship_name_phone_key' 
        AND table_name = 'Patient'
    ) THEN
        ALTER TABLE "Patient" 
        ADD CONSTRAINT "Patient_relationship_name_phone_key" 
        UNIQUE ("relationship", "name", "phone");
        RAISE NOTICE 'Added Patient unique constraint on (relationship, name, phone)';
    END IF;
END $$;

COMMIT;

-- Verify the migration completed successfully
DO $$
BEGIN
    -- Check MessageLog table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'MessageLog') THEN
        RAISE EXCEPTION 'MessageLog table was not created successfully';
    END IF;
    
    -- Check unique index exists
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'MessageLog_messageSid_key') THEN
        RAISE EXCEPTION 'MessageLog unique index was not created successfully';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;