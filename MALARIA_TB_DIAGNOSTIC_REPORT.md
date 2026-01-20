# Malaria & TB Payable Mapping - Diagnostic Report

## Executive Summary

**Issue**: When entering expenses for Malaria and TB programs, the corresponding payables are not being created at runtime.

**Example**:
- Input: Malaria "Communication - All" = 1000 (unpaid)
- Expected: "Payable 5: Communication - All" = 1180 (with 18% VAT)
- Actual: Payable shows 0

**Status**: Previous fixes applied but issue persists. Need systematic investigation.

---

## Investigation Plan

### Phase 1: Database Verification ✅ READY

**Objective**: Verify that the seeder and mapping script successfully stored the payable mappings in the database.

**Actions**:
1. Run `DIAGNOSTIC_INVESTIGATION.sql` to check:
   - Metadata structure for HIV, Malaria, TB expenses
   - Existence of payable activities for all programs
   - Mapping completeness (expenses with/without `payableActivityId`)
   - Specific Malaria "Communication - All" expense and payable
   - Cross-reference integrity (verify `payableActivityId` points to valid payables)
   - Summary statistics by program

**Expected Results**:
- ✅ All Malaria/TB expenses should have `metadata.payableActivityId` set
- ✅ All Malaria/TB expenses should have `metadata.payableName` set
- ✅ `payableActivityId` should reference valid payable activity IDs
- ✅ Mapping percentage should be 100% for all programs

**If Database Check Fails**:
- Re-run seeder: `cd apps/server && pnpm db:seed:execution`
- Verify seeder logs show successful mapping
- Check for database migration issues

---

### Phase 2: API Verification ⏳ PENDING

**Objective**: Verify that the API returns the `metadata` field with `payableActivityId` to the client.

**Actions**:
1. Test API endpoint for each program:
   ```bash
   # HIV
   curl "http://localhost:3000/api/execution/activities?projectType=HIV&facilityType=hospital" | jq '.B.subCategories[] | .items[] | select(.metadata) | {name, code, metadata}'
   
   # Malaria
   curl "http://localhost:3000/api/execution/activities?projectType=Malaria&facilityType=hospital" | jq '.B.subCategories[] | .items[] | select(.metadata) | {name, code, metadata}'
   
   # TB
   curl "http://localhost:3000/api/execution/activities?projectType=TB&facilityType=hospital" | jq '.B.subCategories[] | .items[] | select(.metadata) | {name, code, metadata}'
   ```

2. Verify response structure:
   - Check if `metadata` field exists in response
   - Check if `metadata.payableActivityId` is present
   - Check if `metadata.payableName` is present
   - Compare response between HIV and Malaria/TB

**Expected Results**:
- ✅ API response includes `metadata` field for all activities
- ✅ `metadata.payableActivityId` is present for expense activities
- ✅ Response structure is identical between HIV and Malaria/TB

**Code Location**:
- File: `apps/server/src/api/routes/execution/execution.handlers.ts`
- Function: `getActivities`
- Line: ~2320 (metadata field in SELECT query)

**If API Check Fails**:
- Verify `metadata: dynamicActivities.metadata` is in the SELECT query
- Check if API is filtering out metadata for certain programs
- Restart dev server to pick up code changes

---

### Phase 3: Client-Side Verification ⏳ PENDING

**Objective**: Verify that the client receives and processes the metadata correctly.

**Actions**:
1. Add console logging to mapping utility:
   ```typescript
   // In apps/client/features/execution/utils/expense-to-payable-mapping.ts
   // Line ~80 (already has logging)
   
   console.log('🔍 [Mapping Debug] Activity:', {
     name: item.name,
     code: item.code,
     hasMetadata: !!item.metadata,
     payableActivityId: item.metadata?.payableActivityId,
     payableName: item.metadata?.payableName
   });
   ```

2. Open browser console and navigate to execution form
3. Select Malaria hospital facility
4. Observe console logs for mapping generation

**Expected Results**:
- ✅ Console shows `[DB-Driven]` messages for Malaria/TB expenses
- ✅ Each expense has `payableActivityId` in metadata
- ✅ Mapping is created successfully

**If Client Check Fails**:
- Verify `useExecutionActivities` hook returns metadata
- Check if data transformation strips metadata
- Verify mapping utility receives correct data structure

---

### Phase 4: Runtime Behavior Analysis ⏳ PENDING

**Objective**: Trace what happens when a user enters an expense value at runtime.

**Actions**:
1. Add console logging to expense calculation hook:
   ```typescript
   // In apps/client/features/execution/hooks/use-expense-calculations.ts
   // Add logging in the calculations useMemo
   
   console.log('💰 [Expense Calculation]:', {
     expenseCode: item.code,
     expenseName: item.name,
     amount: item.amount,
     payableCode: item.payableCode,
     isVATApplicable: item.isVATApplicable,
     unpaidAmount: unpaidAmount
   });
   ```

2. Open browser console
3. Navigate to Malaria execution form
4. Enter: Communication - All (unpaid) = 1000
5. Observe console logs

**Expected Results**:
- ✅ Expense calculation hook receives correct payable code
- ✅ Unpaid amount is calculated correctly
- ✅ Payable is added to payables object
- ✅ Payable value appears in Section E

**If Runtime Check Fails**:
- Verify expense-to-payable mapping is being used
- Check if payable calculation logic has program-specific conditions
- Verify form state updates correctly

---

## Key Differences: HIV vs Malaria/TB

### What We Know Works (HIV)

1. **Database**: HIV expenses have `metadata.payableActivityId` set
2. **API**: API returns metadata for HIV activities
3. **Client**: Mapping utility creates expense-to-payable mapping
4. **Runtime**: When user enters expense, payable is calculated and displayed

### What We Need to Verify (Malaria/TB)

1. **Database**: Do Malaria/TB expenses have `metadata.payableActivityId`?
2. **API**: Does API return metadata for Malaria/TB activities?
3. **Client**: Does mapping utility receive metadata for Malaria/TB?
4. **Runtime**: Does payable calculation work for Malaria/TB?

---

## Code Flow Analysis

### Data Flow: Database → UI

```
1. Seeder runs
   └─> Creates activities with metadata.payableName
   └─> Mapping script sets metadata.payableActivityId
   └─> Database: dynamic_activities table updated

2. API: getActivities handler
   └─> SELECT query includes metadata field
   └─> Returns hierarchical structure with metadata
   └─> Response: { B: { subCategories: { items: [{ metadata: {...} }] } } }

3. Client: useExecutionActivities hook
   └─> Fetches activities from API
   └─> Returns hierarchical data to form

4. Client: generateExpenseToPayableMapping()
   └─> Reads metadata.payableActivityId from activities
   └─> Creates mapping: { expenseCode: payableCode }
   └─> Returns mapping object

5. Client: useExpenseCalculations hook
   └─> Uses mapping to find payable for each expense
   └─> Calculates unpaid amounts
   └─> Returns payables object

6. UI: Form displays payable values
   └─> Section E shows calculated payables
```

### Critical Points of Failure

**Point 1: Database**
- **File**: `apps/server/src/db/seeds/modules/execution-categories-activities.ts`
- **Function**: `seedExecutionActivitiesForProgramInternal()`
- **Check**: Does it store `payableName` in metadata for Malaria/TB?

**Point 2: Mapping Script**
- **File**: `apps/server/src/db/seeds/modules/update-payable-mappings.ts`
- **Function**: Main execution
- **Check**: Does it set `payableActivityId` for Malaria/TB?

**Point 3: API Query**
- **File**: `apps/server/src/api/routes/execution/execution.handlers.ts`
- **Function**: `getActivities`
- **Line**: ~2320
- **Check**: Does SELECT include `metadata: dynamicActivities.metadata`?

**Point 4: Client Mapping**
- **File**: `apps/client/features/execution/utils/expense-to-payable-mapping.ts`
- **Function**: `generateExpenseToPayableMapping()`
- **Line**: ~80-120
- **Check**: Does it read `metadata.payableActivityId`?

**Point 5: Runtime Calculation**
- **File**: `apps/client/features/execution/hooks/use-expense-calculations.ts`
- **Function**: `useExpenseCalculations`
- **Line**: ~200-300
- **Check**: Does it use the mapping to calculate payables?

---

## Hypothesis: Most Likely Causes

### Hypothesis 1: Database Mapping Not Established (HIGH PROBABILITY)
**Symptom**: Seeder ran but mapping script didn't execute or failed silently.

**Evidence Needed**:
- Run `DIAGNOSTIC_INVESTIGATION.sql` Part 3
- Check if `metadata.payableActivityId` is NULL for Malaria/TB

**Fix**:
```bash
cd apps/server
pnpm db:seed:execution
```

### Hypothesis 2: API Not Returning Metadata (MEDIUM PROBABILITY)
**Symptom**: API query doesn't include metadata field or filters it out.

**Evidence Needed**:
- Test API endpoint with curl
- Check if metadata field is in response

**Fix**:
- Verify `metadata: dynamicActivities.metadata` in SELECT query
- Restart dev server

### Hypothesis 3: Client Not Receiving Metadata (LOW PROBABILITY)
**Symptom**: Data transformation strips metadata before reaching mapping utility.

**Evidence Needed**:
- Add console logging to `useExecutionActivities` hook
- Check if metadata exists in hook return value

**Fix**:
- Trace data transformation in hook
- Ensure metadata is preserved

### Hypothesis 4: Mapping Logic Has Program-Specific Bug (LOW PROBABILITY)
**Symptom**: Mapping utility has hardcoded logic that only works for HIV.

**Evidence Needed**:
- Review `generateExpenseToPayableMapping()` code
- Check for HIV-specific conditions

**Fix**:
- Remove program-specific logic
- Use database-driven approach for all programs

---

## Next Steps

### Immediate Actions (DO THIS FIRST)

1. **Run Database Diagnostic**:
   ```bash
   # Connect to database
   psql -U your_user -d your_database
   
   # Run diagnostic script
   \i DIAGNOSTIC_INVESTIGATION.sql
   ```

2. **Analyze Results**:
   - Check Part 3: Mapping completeness
   - Check Part 4: Specific Malaria Communication expense
   - Check Part 5: Cross-reference integrity
   - Check Part 6: Summary statistics

3. **Based on Results**:
   - If mapping is missing → Re-run seeder
   - If mapping exists → Proceed to API verification
   - If references are broken → Fix seeder logic

### Follow-Up Actions (AFTER DATABASE CHECK)

1. **If Database is OK**:
   - Proceed to Phase 2: API Verification
   - Test API endpoints
   - Compare responses between programs

2. **If Database is NOT OK**:
   - Re-run seeder with verbose logging
   - Check seeder logs for errors
   - Verify mapping script execution

3. **If API is OK**:
   - Proceed to Phase 3: Client-Side Verification
   - Add console logging
   - Test in browser

4. **If Client is OK**:
   - Proceed to Phase 4: Runtime Behavior Analysis
   - Trace complete transaction flow
   - Identify exact point of failure

---

## Success Criteria

- [ ] Database has `payableActivityId` for all Malaria/TB expenses
- [ ] API returns metadata field for all programs
- [ ] Client mapping utility receives metadata
- [ ] Mapping is created successfully for Malaria/TB
- [ ] Runtime calculation uses mapping correctly
- [ ] Payables are displayed in Section E
- [ ] User can enter Malaria expense and see corresponding payable

---

## Files to Monitor

### Server-Side
- `apps/server/src/db/seeds/modules/execution-categories-activities.ts`
- `apps/server/src/db/seeds/modules/update-payable-mappings.ts`
- `apps/server/src/api/routes/execution/execution.handlers.ts`

### Client-Side
- `apps/client/features/execution/utils/expense-to-payable-mapping.ts`
- `apps/client/features/execution/hooks/use-expense-calculations.ts`
- `apps/client/hooks/use-execution-form.ts`

### Diagnostic
- `DIAGNOSTIC_INVESTIGATION.sql` (database queries)
- `RUNTIME_FIX_COMPLETE.md` (previous fix documentation)
- `.kiro/specs/execution-payable-diagnosis/requirements.md` (spec)

---

## Contact Points

If you need help:
1. Check console logs (browser and server)
2. Run diagnostic SQL script
3. Review previous fix documentation
4. Compare HIV workflow with Malaria/TB workflow
5. Trace data flow from database to UI

---

**Last Updated**: 2026-01-20
**Status**: Investigation in progress
**Next Action**: Run `DIAGNOSTIC_INVESTIGATION.sql`
