-- ============================================================================
-- CORRECTED BUDGET INVESTIGATION - Based on Actual Schema
-- ============================================================================
-- Finding: Q4 Budget = 9,200 RWF (confirmed)
-- Issue: Need to see WHY it's only 9,200 instead of 20,000+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Get the actual planning data structure
-- ----------------------------------------------------------------------------
SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    entity_type,
    -- Show the actual form_data JSON
    jsonb_pretty(form_data) as form_data_readable,
    -- Show computed totals
    computed_values->'totals'->>'q1_total' as q1_total,
    computed_values->'totals'->>'q2_total' as q2_total,
    computed_values->'totals'->>'q3_total' as q3_total,
    computed_values->'totals'->>'q4_total' as q4_total,
    computed_values->'totals'->>'annual_total' as annual_total,
    created_at,
    updated_at
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2;

-- ----------------------------------------------------------------------------
-- 2. Extract Q4 activity details from form_data JSON
-- ----------------------------------------------------------------------------
-- This will show which activities have Q4 budget allocated
SELECT 
    id,
    key as activity_code,
    value->>'q4' as q4_value,
    value->>'total_budget' as total_budget,
    value as full_activity_data
FROM schema_form_data_entries,
     jsonb_each(form_data->'activities') 
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2
  AND (value->>'q4' IS NOT NULL AND value->>'q4' != '0');

-- ----------------------------------------------------------------------------
-- 3. Sum all Q4 values from activities to verify total
-- ----------------------------------------------------------------------------
WITH activity_q4 AS (
    SELECT 
        key as activity_code,
        CAST(value->>'q4' AS NUMERIC) as q4_amount
    FROM schema_form_data_entries,
         jsonb_each(form_data->'activities')
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
)
SELECT 
    COUNT(*) as activities_with_q4_budget,
    SUM(q4_amount) as total_q4_from_activities,
    ARRAY_AGG(activity_code) as activity_codes,
    ARRAY_AGG(q4_amount) as q4_amounts
FROM activity_q4
WHERE q4_amount > 0;

-- ----------------------------------------------------------------------------
-- 4. Get complete breakdown by category
-- ----------------------------------------------------------------------------
SELECT 
    key as activity_code,
    value->>'q1' as q1,
    value->>'q2' as q2,
    value->>'q3' as q3,
    value->>'q4' as q4,
    value->>'total_budget' as total_budget,
    value->>'comment' as comment
FROM schema_form_data_entries,
     jsonb_each(form_data->'activities')
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2
ORDER BY key;

-- ----------------------------------------------------------------------------
-- 5. Check if there are multiple planning entries
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(*) as total_entries,
    ARRAY_AGG(id) as entry_ids,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as combined_q4_total
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2;

-- ----------------------------------------------------------------------------
-- 6. Get reporting period details (corrected - no 'name' column)
-- ----------------------------------------------------------------------------
SELECT 
    id,
    year,
    start_date,
    end_date,
    is_active,
    period_type,
    created_at
FROM reporting_periods
WHERE id = 2;

-- ----------------------------------------------------------------------------
-- 7. Get facility details (corrected - no 'type' column)
-- ----------------------------------------------------------------------------
SELECT 
    id,
    name,
    code,
    district,
    province,
    facility_type,
    created_at
FROM facilities
WHERE id = 338;

-- ============================================================================
-- DIAGNOSTIC SUMMARY
-- ============================================================================
WITH planning_data AS (
    SELECT 
        id,
        form_data,
        computed_values,
        CAST(computed_values->'totals'->>'q4_total' AS NUMERIC) as q4_total
    FROM schema_form_data_entries
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
),
activity_breakdown AS (
    SELECT 
        COUNT(*) as activity_count,
        SUM(CAST(value->>'q4' AS NUMERIC)) as q4_sum
    FROM planning_data,
         jsonb_each(form_data->'activities')
    WHERE value->>'q4' IS NOT NULL
)
SELECT 
    '=== DIAGNOSIS ===' as section,
    pd.q4_total as computed_q4_total,
    ab.q4_sum as activities_q4_sum,
    ab.activity_count as activities_with_q4,
    CASE 
        WHEN pd.q4_total = 9200 THEN '✓ Confirmed: Q4 budget is 9,200'
        ELSE 'Unexpected Q4 total'
    END as confirmation,
    CASE 
        WHEN pd.q4_total < 20000 THEN '❌ ISSUE: Budget (9,200) < Required (20,000)'
        ELSE '✓ Budget sufficient'
    END as issue,
    '=== SOLUTION ===' as solution_section,
    'Go to Planning module and increase Q4 budget values' as action_required,
    'OR reduce expenditures to stay within 9,200' as alternative_action
FROM planning_data pd
CROSS JOIN activity_breakdown ab;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
/*
FINDINGS:
1. Planning data EXISTS with Q4 total = 9,200 RWF
2. Data is stored as JSON in form_data->activities
3. No execution data exists yet (q4_actual_expenditure = 0)

NEXT STEPS:
1. Run query #2 to see which activities have Q4 budget
2. Run query #3 to verify the 9,200 total
3. Run query #4 to see complete breakdown

SOLUTION:
The planning form needs to be updated to increase Q4 budget from 9,200 to at least 20,000.

To fix:
1. Go to Planning module in the application
2. Find: HIV, Nyarugenge Hospital (338), Period 2
3. Edit the planning form
4. Increase Q4 values for activities
5. Save changes
6. Return to execution form and retry
*/
