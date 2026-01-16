# Budget Validation Error Analysis

## Error Message
```
Form validation failed
Total expenditures (20000.00) exceed the planned budget (9200.00). 
Please adjust your expenses to stay within budget.
```

## Context
- **Program**: HIV
- **Facility**: Nyarugenge Hospital
- **Period**: 2025-26
- **Total Expenditures Entered**: 20,000.00 RWF
- **Planned Budget Retrieved**: 9,200.00 RWF

## Root Cause Analysis

### 1. How Budget Validation Works

The validation happens in `apps/client/features/execution/utils/form-validation.ts`:

```typescript
// Calculate total expenditures for Section B (Expenditures)
let totalExpenditures = 0;

Object.entries(formData).forEach(([activityCode, activityData]) => {
  const metadata = activityMetadata.get(activityCode);
  // Only count Section B (Expenditures)
  if (metadata?.section === 'B') {
    const value = Number(activityData[quarterKey]) || 0;
    totalExpenditures += value;
  }
});

if (plannedBudget !== undefined && plannedBudget !== null && plannedBudget > 0) {
  if (totalExpenditures > plannedBudget) {
    errors.push({
      field: 'total_expenditures',
      message: `Total expenditures (${totalExpenditures.toFixed(2)}) exceed the planned budget (${plannedBudget.toFixed(2)}). Please adjust your expenses to stay within budget.`,
      type: 'error',
    });
  }
}
```

### 2. How Planned Budget is Calculated

The planned budget is fetched in `apps/client/hooks/use-execution-form.ts`:

```typescript
const plannedBudget = useMemo(() => {
  if (!planningDataQuery.data?.data || planningDataQuery.data.data.length === 0) {
    return null;
  }
  
  const quarterKey = quarter.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
  let total = 0;
  
  // Sum up all planned amounts for the current quarter
  planningDataQuery.data.data.forEach((item: any) => {
    // Use pre-calculated quarterly totals from the API
    if (item.quarterlyTotals) {
      const quarterTotal = Number(item.quarterlyTotals[`${quarterKey}_total`]) || 0;
      total += quarterTotal;
    }
  });
  
  return total > 0 ? total : null;
}, [planningDataQuery.data, quarter]);
```

### 3. Data Flow

```
1. Planning Form (Budget Entry)
   ↓
2. Planning Data Saved to Database
   ↓
3. Quarterly Totals Calculated (q1_total, q2_total, q3_total, q4_total)
   ↓
4. Execution Form Fetches Planning Data Summary
   ↓
5. Sum All Quarterly Totals for Current Quarter
   ↓
6. Compare Execution Expenditures vs Planned Budget
```

## Possible Issues

### Issue 1: Incomplete Planning Data
**Symptom**: Planned budget (9,200.00) seems low compared to expenditures (20,000.00)

**Possible Causes**:
- Planning form was not fully completed
- Only some activities were planned
- Planning data was entered for a different quarter
- Planning data was entered for a different facility/program

**How to Check**:
1. Navigate to Planning module
2. Filter by: HIV Program, Nyarugenge Hospital, 2025-26 period
3. Check if all budget line items are filled
4. Verify the quarterly totals match expectations

### Issue 2: Wrong Quarter Selected
**Symptom**: Budget retrieved is for a different quarter than execution

**Possible Causes**:
- Planning was done for Q1 but execution is for Q2
- Quarter parameter mismatch

**How to Check**:
1. Check browser console for log: `💰 [Planned Budget] Final:`
2. Verify the quarter parameter matches
3. Check planning data has values for the correct quarter

### Issue 3: Data Structure Mismatch
**Symptom**: Planning data exists but not being read correctly

**Possible Causes**:
- Planning data stored in old format
- `quarterlyTotals` field missing or null
- API returning empty data

**How to Check**:
1. Open browser DevTools → Network tab
2. Find request to `/planning/summary`
3. Check response structure
4. Verify `quarterlyTotals` field exists and has values

### Issue 4: Multiple Planning Entries
**Symptom**: Only summing first entry, missing others

**Possible Causes**:
- Multiple planning entries exist but only one is being counted
- Planning data split across multiple records

**How to Check**:
1. Check console log for planning data array length
2. Verify all entries are being summed
3. Check database for multiple planning records

## Debugging Steps

### Step 1: Check Browser Console
Look for these log messages:
```javascript
💰 [Planned Budget] Final: { quarter: 'Q1', total: 9200, hasData: true }
```

This tells you:
- Which quarter is being checked
- What total was calculated
- If data was found

### Step 2: Check Network Request
1. Open DevTools → Network tab
2. Filter for "summary"
3. Find `/planning/summary?projectId=...&facilityId=...&reportingPeriodId=...`
4. Check the response:

```json
{
  "data": [
    {
      "id": 123,
      "quarterlyTotals": {
        "q1_total": 9200,
        "q2_total": 0,
        "q3_total": 0,
        "q4_total": 0,
        "annual_total": 9200
      }
    }
  ]
}
```

### Step 3: Verify Planning Data in Database
Run this query in your database:

```sql
SELECT 
  id,
  project_id,
  facility_id,
  reporting_period_id,
  computed_values->'totals' as quarterly_totals
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = [HIV_PROJECT_ID]
  AND facility_id = [NYARUGENGE_HOSPITAL_ID]
  AND reporting_period_id = [2025_26_PERIOD_ID];
```

### Step 4: Check Planning Form Completion
1. Go to Planning module
2. Select: HIV, Nyarugenge Hospital, 2025-26
3. Check if all budget line items are filled
4. Verify quarterly breakdown adds up correctly

## Solutions

### Solution 1: Complete Planning Data
If planning is incomplete:
1. Go to Planning module
2. Fill in all budget line items
3. Ensure quarterly totals are correct
4. Save and submit planning form
5. Return to execution form and refresh

### Solution 2: Adjust Expenditures
If planning is correct but expenditures are too high:
1. Review entered expenditures in Section B
2. Identify which line items exceed budget
3. Adjust amounts to stay within planned budget
4. Consider if some expenses should be in different quarters

### Solution 3: Update Planning Budget
If actual needs exceed original plan:
1. Go to Planning module
2. Request budget revision/amendment
3. Update planned amounts
4. Get approval if required
5. Return to execution form

### Solution 4: Check Quarter Alignment
If executing for wrong quarter:
1. Verify which quarter you're executing
2. Ensure planning data exists for that quarter
3. Check URL parameters match intended quarter
4. Refresh page if needed

## Prevention

### For Future Executions
1. **Complete Planning First**: Always complete and approve planning before execution
2. **Quarterly Review**: Review planned vs actual regularly
3. **Budget Monitoring**: Track cumulative spending across quarters
4. **Data Validation**: Verify planning data is saved correctly
5. **Quarter Alignment**: Ensure execution quarter matches planning quarter

## Technical Details

### Validation Logic Location
- **File**: `apps/client/features/execution/utils/form-validation.ts`
- **Function**: `validateFormData()`
- **Line**: ~265

### Budget Calculation Location
- **File**: `apps/client/hooks/use-execution-form.ts`
- **Function**: `plannedBudget` useMemo
- **Line**: ~1041

### API Endpoint
- **Route**: `/planning/summary`
- **File**: `apps/server/src/api/routes/planning/planning.handlers.ts`
- **Function**: `getDataSummary`

## Quick Fix Checklist

- [ ] Check browser console for planned budget log
- [ ] Verify planning data exists for this facility/period/quarter
- [ ] Confirm quarterly totals in planning data
- [ ] Review expenditure amounts entered
- [ ] Check if expenditures are in correct quarter
- [ ] Verify facility and program IDs match
- [ ] Check reporting period ID is correct
- [ ] Review network request/response for planning summary
- [ ] Confirm database has planning records
- [ ] Validate planning form was completed and saved

## Contact Points

If issue persists:
1. Check planning data in database
2. Verify API response structure
3. Review console logs for errors
4. Check if planning form needs completion
5. Consider if budget revision is needed
