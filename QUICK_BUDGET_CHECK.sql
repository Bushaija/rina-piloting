-- ============================================================================
-- QUICK BUDGET CHECK - Run This First
-- ============================================================================
-- Based on URL: projectId=HIV, facilityId=338, reportingPeriodId=2, quarter=Q4
-- ============================================================================

-- ----------------------------------------------------------------------------
-- QUICK DIAGNOSTIC (Run this single query first)
-- ----------------------------------------------------------------------------

SELECT 
    '=== PLANNING DATA CHECK ===' as section,
    COUNT(*) as planning_entries_found,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_planned_budget,
    SUM(CAST(computed_values->'totals'->>'annual_total' AS NUMERIC)) as annual_planned_budget,
    MIN(created_at) as first_created,
    MAX(updated_at) as last_updated,
    array_agg(DISTINCT status) as statuses,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ NO PLANNING DATA - Create planning form first'
        WHEN SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) IS NULL THEN '❌ Q4 BUDGET IS NULL - Check planning form'
        WHEN SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) = 0 THEN '❌ Q4 BUDGET IS ZERO - Fill Q4 values in planning'
        WHEN SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) < 20000 THEN '⚠️ Q4 BUDGET TOO LOW - Increase budget or reduce expenditures'
        ELSE '✅ Q4 BUDGET SUFFICIENT'
    END as diagnosis
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;

-- ----------------------------------------------------------------------------
-- If planning data exists, check the breakdown
-- ----------------------------------------------------------------------------

SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    status,
    CAST(computed_values->'totals'->>'q1_total' AS NUMERIC) as q1_budget,
    CAST(computed_values->'totals'->>'q2_total' AS NUMERIC) as q2_budget,
    CAST(computed_values->'totals'->>'q3_total' AS NUMERIC) as q3_budget,
    CAST(computed_values->'totals'->>'q4_total' AS NUMERIC) as q4_budget,
    CAST(computed_values->'totals'->>'annual_total' AS NUMERIC) as annual_budget,
    created_at,
    updated_at
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- Check project and period details
-- ----------------------------------------------------------------------------

-- Verify Project ID
SELECT 
    id,
    name,
    code,
    'Project Info' as info_type
FROM projects
WHERE UPPER(name) LIKE '%HIV%' OR UPPER(code) LIKE '%HIV%'
LIMIT 5;

-- Verify Reporting Period
SELECT 
    id,
    name,
    year,
    start_date,
    end_date,
    is_active,
    'Period Info' as info_type
FROM reporting_periods
WHERE id = 2 OR year IN (2025, 2026)
ORDER BY year DESC
LIMIT 5;

-- Verify Facility
SELECT 
    id,
    name,
    type,
    district,
    'Facility Info' as info_type
FROM facilities
WHERE id = 338;

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
/*
SCENARIO 1: planning_entries_found = 0
→ NO PLANNING DATA EXISTS
→ Action: Create planning form for HIV, Facility 338, Period 2

SCENARIO 2: q4_planned_budget = NULL or 0
→ PLANNING EXISTS BUT Q4 NOT FILLED
→ Action: Edit planning form and fill Q4 values

SCENARIO 3: q4_planned_budget = 9200 (matches error)
→ PLANNING EXISTS BUT INSUFFICIENT
→ Action: Update planning to increase Q4 budget to at least 20,000
→ OR: Reduce expenditures to stay within 9,200

SCENARIO 4: q4_planned_budget >= 20000
→ PLANNING IS SUFFICIENT
→ Issue: Frontend might be reading wrong data
→ Action: Check browser console, clear cache, refresh page

EXPECTED OUTPUT (based on error):
- planning_entries_found: 1 or more
- q4_planned_budget: 9200.00
- diagnosis: "⚠️ Q4 BUDGET TOO LOW - Increase budget or reduce expenditures"

NEXT STEPS:
1. If no planning data: Create planning form
2. If Q4 is 0 or NULL: Fill Q4 values in planning
3. If Q4 is 9200: Either increase budget or reduce expenditures
4. If Q4 is sufficient: Check frontend/cache issues
*/
