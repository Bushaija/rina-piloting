# Quick Test Checklist - Malaria & TB Payable Fix

## Pre-Test Setup

### 1. Run Seeder
```bash
cd apps/server
pnpm db:seed:execution
```

**Expected Output:**
```
✅ Mapped: Communication - All → Payable 5: Communication - All (Malaria, hospital)
✅ All 7 expenses have payable mappings
✅ Payable mappings established
```

### 2. Restart Dev Server
```bash
# Kill current server (Ctrl+C)
pnpm dev
```

## Test Cases

### Test 1: Malaria - Communication (VAT Expense)
- [ ] Navigate to Execution module
- [ ] Select: Malaria, Hospital, Q1 2024
- [ ] Enter: Communication - All (unpaid) = 1000
- [ ] **Expected Results:**
  - [ ] Payable 5: Communication - All = 1180 (1000 + 18% VAT)
  - [ ] VAT Receivable 1: Communication - All = 180
  - [ ] Balance sheet balances

### Test 2: Malaria - Car Hiring (Malaria-Specific VAT)
- [ ] Enter: Car Hiring on entomological surveillance (unpaid) = 2000
- [ ] **Expected Results:**
  - [ ] Payable 9: Car Hiring = 2360 (2000 + 18% VAT)
  - [ ] VAT Receivable 5: Car hiring = 360
  - [ ] Balance sheet balances

### Test 3: Malaria - Salaries (Non-VAT)
- [ ] Enter: Laboratory Technician A0/A1 (unpaid) = 500
- [ ] **Expected Results:**
  - [ ] Payable 1: Salaries = 500 (no VAT)
  - [ ] No VAT receivable created
  - [ ] Balance sheet balances

### Test 4: TB - Communication (VAT Expense)
- [ ] Select: TB, Hospital, Q1 2024
- [ ] Enter: Communication - All (unpaid) = 800
- [ ] **Expected Results:**
  - [ ] Payable 4: Communication - All = 944 (800 + 18% VAT)
  - [ ] VAT Receivable 1: Communication - All = 144
  - [ ] Balance sheet balances

### Test 5: TB - Mission (Non-VAT)
- [ ] Enter: Mission fees for tracing, TPT, HCW, outreach, & meeting (unpaid) = 1500
- [ ] **Expected Results:**
  - [ ] Payable 2: Mission = 1500 (no VAT)
  - [ ] No VAT receivable created
  - [ ] Balance sheet balances

### Test 6: HIV - Verify Still Works
- [ ] Select: HIV, Hospital, Q1 2024
- [ ] Enter: Communication - All (unpaid) = 1000
- [ ] **Expected Results:**
  - [ ] Payable 12: Communication - All = 1180
  - [ ] VAT Receivable 1: Communication - All = 180
  - [ ] Balance sheet balances

## Console Verification

### Open Browser Console (F12)
Look for these log messages:

**✅ Success:**
```
✅ [DB-Driven] Communication - All → MAL_EXEC_HOSPITAL_E_5
✅ [DB-Driven] Car Hiring on entomological surveillance → MAL_EXEC_HOSPITAL_E_9
```

**❌ Failure:**
```
⚠️ [Pattern Match Failed] No payable found for: Communication - All
```

## Database Verification

### Check Mappings Exist
```sql
SELECT 
    da.name as expense,
    da.metadata->>'payableName' as expected_payable,
    da.metadata->>'payableActivityId' as payable_id,
    p.name as actual_payable
FROM dynamic_activities da
LEFT JOIN dynamic_activities p ON (da.metadata->>'payableActivityId')::integer = p.id
WHERE da.project_type = 'Malaria'
    AND da.module_type = 'execution'
    AND da.activity_type = 'EXPENSE'
    AND da.facility_type = 'hospital'
    AND da.is_total_row = false
ORDER BY da.display_order;
```

**Expected:** All rows should have `payable_id` and `actual_payable` populated.

## Troubleshooting

### Issue: Payable still shows 0
**Possible Causes:**
1. Seeder not run → Run `pnpm db:seed:execution`
2. Server not restarted → Restart dev server
3. Metadata not in API response → Check API endpoint
4. Browser cache → Hard refresh (Ctrl+Shift+R)

### Issue: Console shows "Pattern Match Failed"
**Possible Causes:**
1. API not returning metadata → Check `execution.handlers.ts` has metadata field
2. Mapping script not run → Check seeder output
3. Database missing payableActivityId → Run SQL verification query

### Issue: Wrong payable number
**Possible Causes:**
1. Using old pattern matching → Check console logs for "[DB-Driven]"
2. Metadata has wrong payableActivityId → Re-run seeder

## Quick Fixes

### Clear and Reseed
```bash
# 1. Clear execution data
psql -d your_database -c "DELETE FROM dynamic_activities WHERE module_type = 'execution';"

# 2. Re-run seeder
cd apps/server
pnpm db:seed:execution

# 3. Restart server
pnpm dev
```

### Force Browser Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Check API Response
```bash
curl "http://localhost:3000/api/execution/activities?projectType=Malaria&facilityType=hospital" | jq '.data[0].metadata'
```

Should return:
```json
{
  "payableName": "Payable 1: Salaries",
  "payableActivityId": 123
}
```

## Success Indicators

- [x] All test cases pass
- [x] Console shows "[DB-Driven]" messages
- [x] No "Pattern Match Failed" warnings
- [x] Balance sheets balance
- [x] SQL verification shows all mappings
- [x] API returns metadata field

## Sign-Off

- [ ] Tested by: _______________
- [ ] Date: _______________
- [ ] All tests passed: Yes / No
- [ ] Issues found: _______________
- [ ] Ready for deployment: Yes / No
