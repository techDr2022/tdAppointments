# Production Migration Deployment Guide

## Step 1: Backup Database

```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup_before_messagelog_$(date +%Y%m%d_%H%M%S).sql
```

## Step 2: Test Migration on Staging

```bash
# On staging environment
npx prisma migrate deploy
npx prisma generate
```

## Step 3: Production Deployment Commands

```bash
# 1. Deploy migrations (this runs the SQL)
npx prisma migrate deploy

# 2. Generate Prisma client
npx prisma generate

# 3. Verify migration status
npx prisma migrate status
```

## Step 4: Rollback Plan (if needed)

```sql
-- Only if rollback is needed
BEGIN;
DROP TABLE IF EXISTS "MessageLog" CASCADE;
-- Restore from backup if necessary
COMMIT;
```

## Environment Variables Needed

```env
DATABASE_URL=postgresql://user:password@host:port/database
BASE_URL=https://your-production-domain.com
```
