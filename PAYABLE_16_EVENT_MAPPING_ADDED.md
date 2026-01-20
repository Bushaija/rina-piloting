# Payable 16: Other Payables - Event Mapping Added

## Problem
Payable 16: Other payables was not mapped to any event, which means:
- ❌ It wouldn't appear in generated financial statements
- ❌ It wouldn't be tracked in statement exports
- ❌ Reports would be missing these values

## Solution Applied

Added event mappings for **Payable 16: Other payables** to the `PAYABLES` event for all three projects.

### File Modified
`apps/server/src/db/seeds/modules/configurable-event-mappings.ts`

### Changes Made

**HIV Project** (line ~83):
```typescript
{ projectType: 'HIV', activityName: 'Payable 16: Other payables', eventCode: 'PAYABLES', mappingType: 'DIRECT' },
```

**Malaria Project** (line ~94):
```typescript
{ projectType: 'Malaria', activityName: 'Payable 16: Other payables', eventCode: 'PAYABLES', mappingType: 'DIRECT' },
```

**TB Project** (line ~103):
```typescript
{ projectType: 'TB', activityName: 'Payable 16: Other payables', eventCode: 'PAYABLES', mappingType: 'DIRECT' },
```

## What This Means

Now Payable 16 is treated the same as Payables 1-15:
- ✅ Mapped to `PAYABLES` event
- ✅ Will appear in financial statements
- ✅ Will be included in statement exports
- ✅ Will be tracked in reports

## How to Apply

To apply this change to your database, run:

```bash
pnpm db:seed:event-mapping
```

### ⚠️ Warning
This command will:
- Delete ALL existing event mappings
- Recreate them with the new Payable 16 mappings

This is safe because:
- ✅ It doesn't delete execution data (user-entered values)
- ✅ It doesn't delete activities
- ✅ It only affects the mapping between activities and events

### Alternative: Manual SQL Insert

If you prefer not to re-seed everything, you can manually insert the mappings:

```sql
-- Get the event ID for PAYABLES
WITH payables_event AS (
  SELECT id FROM events WHERE code = 'PAYABLES'
),
-- Get Payable 16 activities
payable_16_activities AS (
  SELECT 
    da.id as activity_id,
    da.category_id,
    da.project_type,
    da.facility_type
  FROM dynamic_activities da
  WHERE da.module_type = 'execution'
    AND da.name = 'Payable 16: Other payables'
)
-- Insert mappings
INSERT INTO configurable_event_mappings (
  event_id,
  activity_id,
  category_id,
  project_type,
  facility_type,
  mapping_type,
  mapping_ratio,
  is_active,
  metadata
)
SELECT 
  pe.id,
  p16.activity_id,
  p16.category_id,
  p16.project_type,
  p16.facility_type,
  'DIRECT',
  '1.0000',
  true,
  jsonb_build_object(
    'activityName', 'Payable 16: Other payables',
    'eventCode', 'PAYABLES',
    'manuallyAdded', true,
    'createdAt', NOW()
  )
FROM payables_event pe
CROSS JOIN payable_16_activities p16
ON CONFLICT (event_id, activity_id, category_id, project_type, facility_type) 
DO UPDATE SET
  mapping_type = EXCLUDED.mapping_type,
  mapping_ratio = EXCLUDED.mapping_ratio,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;
```

## Verification

After applying, verify the mappings exist:

```sql
-- Check Payable 16 event mappings
SELECT 
  da.project_type,
  da.facility_type,
  da.name as activity_name,
  e.code as event_code,
  cem.mapping_type
FROM configurable_event_mappings cem
JOIN dynamic_activities da ON cem.activity_id = da.id
JOIN events e ON cem.event_id = e.id
WHERE da.name = 'Payable 16: Other payables'
ORDER BY da.project_type, da.facility_type;
```

**Expected Result**: 6 rows (3 projects × 2 facility types)

| project_type | facility_type | activity_name | event_code | mapping_type |
|--------------|---------------|---------------|------------|--------------|
| HIV | hospital | Payable 16: Other payables | PAYABLES | DIRECT |
| HIV | health_center | Payable 16: Other payables | PAYABLES | DIRECT |
| Malaria | hospital | Payable 16: Other payables | PAYABLES | DIRECT |
| Malaria | health_center | Payable 16: Other payables | PAYABLES | DIRECT |
| TB | hospital | Payable 16: Other payables | PAYABLES | DIRECT |
| TB | health_center | Payable 16: Other payables | PAYABLES | DIRECT |

## Impact on Financial Statements

With this mapping, Payable 16 values will now be included in:
- Statement of Financial Position (Balance Sheet)
- Statement of Changes in Net Assets/Equity
- Notes to Financial Statements
- Any reports that aggregate PAYABLES event

## Related Changes

This complements the earlier fix where:
1. ✅ X. Other Payables now correctly updates Payable 16 (frontend fix)
2. ✅ Payable 16 is excluded from automatic expense-to-payable calculation (frontend fix)
3. ✅ Payable 16 is now mapped to PAYABLES event (this fix)

All three pieces work together to ensure proper double-entry accounting and reporting for miscellaneous payables.
