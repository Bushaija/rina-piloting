# Budget Validation Error - Investigation Summary

## Quick Reference

### The Error
```
Form validation failed
Total expenditures (20,000.00) exceed the planned budget (9,200.00)
```

### Context from URL
```
http://localhost:2222/rina/dashboard/execution/new?
  projectId=HIV
  &facilityId=338
  &facilityType=hospital
  &facilityName=nyarugenge
  &program=1
  &reportingPeriodId=2
  &quarter=Q4
```

### Key Parameters
- **Program**: HIV (ID: 1)
- **Facility**: Nyarugenge Hospital (ID: 338)
- **Reporting Period**: 2 (2025-26)
- **Quarter**: Q4
- **Planned Budget Found**: 9,200.00 RWF
- **Expenditures Entered**: 20,000.00 RWF
- **Shortfall**: 10,800.00 RWF

## Investigation Tools Created

### 1. SQL Queries
📄 **QUICK_BUDGET_CHECK.sql** - Run this first (2 minutes)
- Fast diagnostic query
- Shows if planning data exists
- Displays Q4 budget amount
- Provides immediate diagnosis

📄 **BUDGET_INVESTIGATION_SQL.sql** - Comprehensive analysis (10 minutes)
- 12 detailed investigation steps
- Activity-level breakdown
- Audit trail
- Multiple entry detection

📄 **SQL_INVESTIGATION_GUIDE.md** - Step-by-step instructions
- How to run queries
- How to interpret results
- Common issues and fixes
- Resolution checklist

### 2. Browser Diagnostics
📄 **BUDGET_DEBUG_SCRIPT.md** - Browser console script
- Check URL parameters
- Verify API responses
- Calculate budget totals
- Network request inspection

### 3. Documentation
📄 **BUDGET_ERROR_SUMMARY.md** - Quick overview
📄 **BUDGET_VALIDATION_ERROR_ANALYSIS.md** - Technical deep-dive
📄 **INVESTIGATION_SUMMARY.md** - This file

## Quick Start Guide

### Option 1: SQL Investigation (Recommended)
```bash
1. Open your database client (pgAdmin, DBeaver, etc.)
2. Open file: QUICK_BUDGET_CHECK.sql
3. Run the first query
4. Read the diagnosis in the result
5. Follow the recommended action
```

### Option 2: Browser Investigation
```bash
1. Open the execution form in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Copy script from BUDGET_DEBUG_SCRIPT.md
5. Paste and run
6. Review output
```

### Option 3: Application Check
```bash
1. Go to Planning module
2. Filter: HIV, Nyarugenge Hospital, 2025-26
3. Check if planning form exists
4. Verify Q4 column has values
5. Check if total matches expectations
```

## Most Likely Scenarios

### Scenario A: No Planning Data (60% probability)
**SQL Result**: `planning_entries_found = 0`

**What happened**: Planning form was never created for this facility/period

**Solution**:
1. Go to Planning module
2. Create new planning form
3. Fill all budget line items
4. Ensure Q4 values are entered
5. Save and submit

### Scenario B: Incomplete Planning (30% probability)
**SQL Result**: `q4_planned_budget = 9200` (matches error)

**What happened**: Planning form exists but Q4 budget is insufficient

**Solution**:
1. Go to Planning module
2. Edit existing planning form
3. Increase Q4 budget values
4. OR reduce expenditures to match budget
5. Save changes

### Scenario C: Wrong Quarter (5% probability)
**SQL Result**: Q1/Q2/Q3 have budget, Q4 is 0

**What happened**: Budget was allocated to wrong quarter

**Solution**:
1. Verify which quarter you're executing
2. Check if budget is in different quarter
3. Either move budget to Q4 or execute correct quarter

### Scenario D: Technical Issue (5% probability)
**SQL Result**: `q4_planned_budget >= 20000` but still getting error

**What happened**: Frontend caching or API issue

**Solution**:
1. Clear browser cache
2. Refresh page
3. Check browser console for errors
4. Verify Network tab API responses

## Step-by-Step Resolution

### Step 1: Diagnose (5 minutes)
```sql
-- Run this query
SELECT 
    COUNT(*) as planning_entries_found,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_planned_budget
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

### Step 2: Interpret Results
- **0 entries**: No planning → Create planning form
- **9,200 budget**: Insufficient → Increase budget or reduce expenses
- **0 or NULL budget**: Q4 not filled → Fill Q4 values
- **20,000+ budget**: Sufficient → Check frontend/cache

### Step 3: Take Action
Based on diagnosis, follow the appropriate solution from scenarios above

### Step 4: Verify Fix
1. Refresh execution form
2. Try submitting again
3. Error should be resolved

## Common Questions

### Q: Why is the budget only 9,200?
**A**: The planning form for Q4 was either:
- Not completed fully
- Only partially filled
- Filled with lower amounts than needed

### Q: Can I just ignore the validation?
**A**: No, this is a financial control to prevent overspending. You must either:
- Increase the planned budget (with approval)
- Reduce the expenditures to match budget

### Q: Which quarter should I check?
**A**: Q4 (from your URL parameter `quarter=Q4`)

### Q: What if I need to spend more than planned?
**A**: 
1. Update the planning form with revised budget
2. Get necessary approvals
3. Resubmit planning
4. Then proceed with execution

### Q: Can expenditures exceed budget?
**A**: No, the system enforces budget compliance. Actual expenditures cannot exceed planned budget.

## Technical Details

### Validation Logic
```typescript
// Location: apps/client/features/execution/utils/form-validation.ts
if (totalExpenditures > plannedBudget) {
  errors.push({
    field: 'total_expenditures',
    message: `Total expenditures (${totalExpenditures.toFixed(2)}) 
              exceed the planned budget (${plannedBudget.toFixed(2)}). 
              Please adjust your expenses to stay within budget.`,
    type: 'error',
  });
}
```

### Budget Calculation
```typescript
// Location: apps/client/hooks/use-execution-form.ts
const plannedBudget = useMemo(() => {
  let total = 0;
  planningDataQuery.data.data.forEach((item: any) => {
    if (item.quarterlyTotals) {
      const quarterTotal = Number(item.quarterlyTotals[`${quarterKey}_total`]) || 0;
      total += quarterTotal;
    }
  });
  return total > 0 ? total : null;
}, [planningDataQuery.data, quarter]);
```

### Database Structure
```sql
-- Planning data stored in:
schema_form_data_entries
  - entity_type = 'planning'
  - computed_values->totals->q4_total = budget amount
  - project_id, facility_id, reporting_period_id = context
```

## Success Criteria

✅ SQL query shows planning data exists
✅ Q4 budget >= expenditures needed
✅ Execution form submits without error
✅ Budget validation passes

## Next Steps

1. **Immediate**: Run QUICK_BUDGET_CHECK.sql
2. **Short-term**: Fix planning data based on diagnosis
3. **Long-term**: Ensure planning is completed before execution

## Support

If you've run the SQL queries and still have issues:
1. Share the SQL query results
2. Provide screenshots of planning form
3. Share browser console output
4. Confirm facility/program/period IDs match
5. Check if multiple planning entries exist
