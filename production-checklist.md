# Production Deployment Checklist

## Pre-Deployment

- [ ] Database backup completed
- [ ] Migration tested on staging environment
- [ ] Environment variables configured
- [ ] Downtime window scheduled (if needed)

## Deployment Commands

```bash
# Production deployment
npx prisma migrate deploy
npx prisma generate

# Verification
npx prisma migrate status
```

## Post-Deployment Verification

- [ ] MessageLog table created successfully
- [ ] Foreign key constraints working
- [ ] Application can create MessageLog records
- [ ] Webhook endpoints can query MessageLog data
- [ ] No performance impact on existing queries

## Rollback Plan (if needed)

```sql
-- Emergency rollback
BEGIN;
DROP TABLE IF EXISTS "MessageLog" CASCADE;
-- Restore database from backup if necessary
COMMIT;
```

## Monitoring Points

- [ ] Check application logs for Prisma client errors
- [ ] Monitor database performance
- [ ] Verify message tracking functionality works
- [ ] Test delivery webhook endpoints

## Success Criteria

- [ ] All existing functionality unchanged
- [ ] New MessageLog tracking working
- [ ] Delivery callbacks functioning
- [ ] No database errors in logs
