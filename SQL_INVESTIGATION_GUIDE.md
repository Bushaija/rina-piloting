# SQL Investigation Guide - Budget Validation Error

## Context
- **URL**: `http://localhost:2222/rina/dashboard/execution/new?projectId=HIV&facilityId=338&facilityType=hospital&facilityName=nyarugenge&program=1&reportingPeriodId=2&quarter=Q4`
- **Error**: Total expenditures (20,000.00) exceed planned budget (9,200.00)
- **Facility**: Nyarugenge Hospital (ID: 338)
- **Program**: HIV (ID: 1)
- **Period**: 2 (2025-26)
- **Quarter**: Q4

## Quick Start

### Step 1: Run Quick Diagnostic
Open your database client and run:

```sql
-- File: QUICK_BUDGET_CHECK.sql (first query)
SELECT 
    '=== PLANNING DATA CHECK ===' as section,
    COUNT(*) as planning_entries_found,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_planned_budget,
    -- ... rest of query
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

### Step 2: Interpret Results

#### Result A: planning_entries_found = 0
**Meaning**: No planning data exists for this facility/period

**Solution**:
1. Go to Planning module in the application
2. Create new planning form for:
   - Program: HIV
   - Facility: Nyarugenge Hospital (338)
   - Period: 2025-26
3. Fill in all budget line items
4. Ensure Q4 values are entered
5. Save and submit

#### Result B: q4_planned_budget = NULL or 0
**Meaning**: Planning exists but Q4 quarter not filled

**Solution**:
1. Go to Planning module
2. Find existing planning for HIV, Nyarugenge, 2025-26
3. Edit the form
4. Fill in Q4 column values
5. Save changes

#### Result C: q4_planned_budget = 9200 (matches error)
**Meaning**: Planning exists but budget is insufficient

**Solution Option 1 - Increase Budget**:
1. Go to Planning module
2. Edit planning form
3. Increase Q4 budget values to accommodate 20,000+ expenditures
4. Get necessary approvals
5. Save changes

**Solution Option 2 - Reduce Expenditures**:
1. Stay in Execution form
2. Review Section B (Expenditures)
3. Reduce amounts to stay within 9,200 budget
4. Consider moving some expenses to other quarters

#### Result D: q4_planned_budget >= 20000
**Meaning**: Budget is sufficient but frontend not reading correctly

**Solution**:
1. Clear browser cache
2. Refresh the page
3. Check browser console for errors
4. Verify API response in Network tab
5. Check if multiple planning entries exist (run detailed queries)

## Detailed Investigation

If quick check doesn't resolve the issue, run the comprehensive queries:

### Step 3: Run Full Investigation
```bash
# File: BUDGET_INVESTIGATION_SQL.sql
# Run queries STEP 1 through STEP 12 in order
```

### Step 4: Key Queries to Focus On

#### Query 1: Check Planning Data Structure
```sql
SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    status,
    computed_values->'totals'->>'q4_total' as q4_total,
    created_at,
    updated_at
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

**What to look for**:
- `id`: Should have at least one record
- `q4_total`: Should be >= 20000 (or match your needs)
- `status`: Should be 'approved' or 'submitted'
- `created_at/updated_at`: Check if data is recent

#### Query 2: Check for Multiple Entries
```sql
SELECT 
    COUNT(*) as total_entries,
    array_agg(id) as entry_ids,
    array_agg(status) as statuses,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as total_q4
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

**What to look for**:
- `total_entries`: Should be 1 (or a reasonable number)
- If > 1: Multiple planning entries might be causing confusion
- `total_q4`: Sum of all Q4 budgets

#### Query 3: Activity-Level Breakdown
```sql
SELECT 
    da.code,
    da.name,
    sfd.form_data->>'q4_amount' as q4_amount,
    sfd.computed_values
FROM schema_form_data_entries sfd
LEFT JOIN dynamic_activities da ON sfd.entity_id = da.id
WHERE sfd.entity_type = 'planning'
  AND sfd.facility_id = 338
  AND sfd.reporting_period_id = 2
  AND (sfd.form_data->>'q4_amount' IS NOT NULL)
ORDER BY da.code;
```

**What to look for**:
- Individual activity budgets for Q4
- Which activities have budget allocated
- Sum should equal the total Q4 budget

## Common Issues and SQL Fixes

### Issue 1: Planning Data Not Computed
**Symptom**: `computed_values` is NULL or empty

**Check**:
```sql
SELECT 
    id,
    computed_values IS NULL as is_null,
    computed_values::text as raw_json
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

**Fix**: Trigger recomputation through the application

### Issue 2: Wrong Project ID
**Symptom**: No data found

**Check**:
```sql
-- Find all planning for this facility
SELECT 
    project_id,
    COUNT(*) as entries,
    array_agg(DISTINCT reporting_period_id) as periods
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
GROUP BY project_id;
```

**Fix**: Use correct project_id in URL

### Issue 3: Wrong Reporting Period
**Symptom**: No data found or wrong year

**Check**:
```sql
-- Find all planning for this facility and project
SELECT 
    reporting_period_id,
    rp.name as period_name,
    rp.year,
    COUNT(*) as entries
FROM schema_form_data_entries sfd
LEFT JOIN reporting_periods rp ON sfd.reporting_period_id = rp.id
WHERE sfd.entity_type = 'planning'
  AND sfd.facility_id = 338
  AND sfd.project_id = 1
GROUP BY reporting_period_id, rp.name, rp.year;
```

**Fix**: Use correct reportingPeriodId in URL

### Issue 4: Data in Wrong Quarter
**Symptom**: Q4 is 0 but other quarters have values

**Check**:
```sql
SELECT 
    CAST(computed_values->'totals'->>'q1_total' AS NUMERIC) as q1,
    CAST(computed_values->'totals'->>'q2_total' AS NUMERIC) as q2,
    CAST(computed_values->'totals'->>'q3_total' AS NUMERIC) as q3,
    CAST(computed_values->'totals'->>'q4_total' AS NUMERIC) as q4
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

**Fix**: Move budget to Q4 or execute in correct quarter

## Expected vs Actual

Based on your error message:

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| Q4 Planned Budget | >= 20,000 | 9,200 | ❌ Too Low |
| Q4 Expenditures | <= Budget | 20,000 | ❌ Over Budget |
| Variance | 0 | -10,800 | ❌ Over by 10,800 |

## Resolution Checklist

- [ ] Run QUICK_BUDGET_CHECK.sql
- [ ] Verify planning_entries_found > 0
- [ ] Check q4_planned_budget value
- [ ] Confirm project_id, facility_id, reporting_period_id are correct
- [ ] Review planning form in application
- [ ] Update budget or reduce expenditures
- [ ] Retest execution form submission

## Files Reference

1. **QUICK_BUDGET_CHECK.sql** - Fast diagnostic queries (start here)
2. **BUDGET_INVESTIGATION_SQL.sql** - Comprehensive investigation queries
3. **SQL_INVESTIGATION_GUIDE.md** - This file (step-by-step guide)
4. **BUDGET_ERROR_SUMMARY.md** - Non-technical summary
5. **BUDGET_VALIDATION_ERROR_ANALYSIS.md** - Technical analysis

## Need More Help?

If SQL investigation shows:
- ✅ Planning data exists
- ✅ Q4 budget >= 20,000
- ❌ Still getting error

Then the issue is likely:
1. Frontend caching (clear browser cache)
2. API not returning correct data (check Network tab)
3. Multiple planning entries causing confusion (check for duplicates)
4. Wrong quarter parameter in URL (verify quarter=Q4)

Run the browser diagnostic script from `BUDGET_DEBUG_SCRIPT.md` to investigate frontend issues.
