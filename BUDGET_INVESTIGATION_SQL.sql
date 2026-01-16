-- ============================================================================
-- BUDGET VALIDATION INVESTIGATION SQL QUERIES
-- ============================================================================
-- Context: HIV Program, Nyarugenge Hospital (ID: 338), Period: 2, Quarter: Q4
-- Error: Expenditures (20,000) exceed planned budget (9,200)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Identify Project and Reporting Period IDs
-- ----------------------------------------------------------------------------

-- Find HIV Project ID
SELECT 
    id,
    name,
    code,
    description,
    created_at
FROM projects
WHERE UPPER(name) LIKE '%HIV%' OR UPPER(code) LIKE '%HIV%'
ORDER BY created_at DESC;

-- Find Reporting Period for 2025-26
SELECT 
    id,
    name,
    year,
    start_date,
    end_date,
    is_active,
    created_at
FROM reporting_periods
WHERE year IN (2025, 2026)
   OR name LIKE '%2025%'
   OR name LIKE '%2026%'
ORDER BY year DESC, start_date DESC;

-- Verify Facility
SELECT 
    id,
    name,
    type,
    district,
    created_at
FROM facilities
WHERE id = 338
   OR LOWER(name) LIKE '%nyarugenge%';

-- ----------------------------------------------------------------------------
-- STEP 2: Check Planning Data Existence
-- ----------------------------------------------------------------------------

-- Check if planning data exists for this context
SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    entity_type,
    entity_id,
    status,
    created_at,
    updated_at,
    created_by,
    updated_by
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1  -- Replace with actual HIV project ID from STEP 1
  AND facility_id = 338
  AND reporting_period_id = 2  -- Replace with actual period ID from STEP 1
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- STEP 3: Examine Planning Data Details
-- ----------------------------------------------------------------------------

-- Get planning data with computed quarterly totals
SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    entity_type,
    status,
    -- Extract quarterly totals from computed_values
    computed_values->'totals'->>'q1_total' as q1_total,
    computed_values->'totals'->>'q2_total' as q2_total,
    computed_values->'totals'->>'q3_total' as q3_total,
    computed_values->'totals'->>'q4_total' as q4_total,
    computed_values->'totals'->>'annual_total' as annual_total,
    -- Metadata
    metadata,
    created_at,
    updated_at
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1  -- Replace with actual HIV project ID
  AND facility_id = 338
  AND reporting_period_id = 2  -- Replace with actual period ID
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- STEP 4: Detailed Planning Activities Breakdown
-- ----------------------------------------------------------------------------

-- Get individual planning activities with quarterly breakdown
SELECT 
    sfd.id as entry_id,
    sfd.project_id,
    sfd.facility_id,
    sfd.reporting_period_id,
    da.code as activity_code,
    da.name as activity_name,
    sac.code as category_code,
    sac.name as category_name,
    -- Extract form data
    sfd.form_data,
    -- Extract computed values
    sfd.computed_values,
    sfd.created_at,
    sfd.updated_at
FROM schema_form_data_entries sfd
LEFT JOIN dynamic_activities da ON sfd.entity_id = da.id
LEFT JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE sfd.entity_type = 'planning'
  AND sfd.project_id = 1  -- Replace with actual HIV project ID
  AND sfd.facility_id = 338
  AND sfd.reporting_period_id = 2  -- Replace with actual period ID
ORDER BY sac.display_order, da.display_order;

-- ----------------------------------------------------------------------------
-- STEP 5: Calculate Q4 Budget Total
-- ----------------------------------------------------------------------------

-- Sum all Q4 planning totals for this facility/period
WITH planning_data AS (
    SELECT 
        id,
        CAST(computed_values->'totals'->>'q4_total' AS NUMERIC) as q4_total
    FROM schema_form_data_entries
    WHERE entity_type = 'planning'
      AND project_id = 1  -- Replace with actual HIV project ID
      AND facility_id = 338
      AND reporting_period_id = 2  -- Replace with actual period ID
)
SELECT 
    COUNT(*) as total_entries,
    SUM(q4_total) as total_q4_budget,
    AVG(q4_total) as avg_q4_budget,
    MIN(q4_total) as min_q4_budget,
    MAX(q4_total) as max_q4_budget
FROM planning_data;

-- ----------------------------------------------------------------------------
-- STEP 6: Check Execution Data (Current Expenditures)
-- ----------------------------------------------------------------------------

-- Check if execution data already exists for Q4
SELECT 
    id,
    project_id,
    facility_id,
    reporting_period_id,
    entity_type,
    status,
    -- Extract quarterly totals
    computed_values->'totals'->>'q4_total' as q4_expenditure,
    metadata,
    created_at,
    updated_at
FROM schema_form_data_entries
WHERE entity_type = 'execution'
  AND project_id = 1  -- Replace with actual HIV project ID
  AND facility_id = 338
  AND reporting_period_id = 2  -- Replace with actual period ID
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- STEP 7: Compare Planning vs Execution
-- ----------------------------------------------------------------------------

-- Compare planned budget vs actual expenditures for Q4
WITH planning_totals AS (
    SELECT 
        project_id,
        facility_id,
        reporting_period_id,
        SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_planned
    FROM schema_form_data_entries
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
    GROUP BY project_id, facility_id, reporting_period_id
),
execution_totals AS (
    SELECT 
        project_id,
        facility_id,
        reporting_period_id,
        SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_actual
    FROM schema_form_data_entries
    WHERE entity_type = 'execution'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
    GROUP BY project_id, facility_id, reporting_period_id
)
SELECT 
    p.project_id,
    p.facility_id,
    p.reporting_period_id,
    COALESCE(p.q4_planned, 0) as q4_planned_budget,
    COALESCE(e.q4_actual, 0) as q4_actual_expenditure,
    COALESCE(e.q4_actual, 0) - COALESCE(p.q4_planned, 0) as variance,
    CASE 
        WHEN COALESCE(p.q4_planned, 0) = 0 THEN 'No Planning Data'
        WHEN COALESCE(e.q4_actual, 0) > COALESCE(p.q4_planned, 0) THEN 'Over Budget'
        WHEN COALESCE(e.q4_actual, 0) < COALESCE(p.q4_planned, 0) THEN 'Under Budget'
        ELSE 'On Budget'
    END as budget_status
FROM planning_totals p
FULL OUTER JOIN execution_totals e 
    ON p.project_id = e.project_id 
    AND p.facility_id = e.facility_id 
    AND p.reporting_period_id = e.reporting_period_id;

-- ----------------------------------------------------------------------------
-- STEP 8: Detailed Activity-Level Breakdown
-- ----------------------------------------------------------------------------

-- Get detailed breakdown of planning activities for Q4
SELECT 
    da.code as activity_code,
    da.name as activity_name,
    sac.code as category_code,
    sac.name as category_name,
    sfd.form_data->>'q4_amount' as q4_planned_amount,
    sfd.form_data->>'q4_count' as q4_count,
    sfd.form_data->>'unit_cost' as unit_cost,
    sfd.computed_values,
    sfd.created_at
FROM schema_form_data_entries sfd
LEFT JOIN dynamic_activities da ON sfd.entity_id = da.id
LEFT JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE sfd.entity_type = 'planning'
  AND sfd.project_id = 1
  AND sfd.facility_id = 338
  AND sfd.reporting_period_id = 2
  AND (sfd.form_data->>'q4_amount' IS NOT NULL 
       OR sfd.form_data->>'q4_count' IS NOT NULL)
ORDER BY sac.display_order, da.display_order;

-- ----------------------------------------------------------------------------
-- STEP 9: Check for Multiple Planning Entries
-- ----------------------------------------------------------------------------

-- Check if there are multiple planning entries (which might cause issues)
SELECT 
    COUNT(*) as total_planning_entries,
    COUNT(DISTINCT entity_id) as unique_activities,
    MIN(created_at) as first_entry,
    MAX(created_at) as last_entry,
    array_agg(DISTINCT status) as statuses
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2;

-- ----------------------------------------------------------------------------
-- STEP 10: Check Schema and Activities Configuration
-- ----------------------------------------------------------------------------

-- Verify the schema being used
SELECT 
    s.id,
    s.name,
    s.project_id,
    s.facility_type,
    s.is_active,
    p.name as project_name,
    COUNT(da.id) as activity_count
FROM schemas s
LEFT JOIN projects p ON s.project_id = p.id
LEFT JOIN dynamic_activities da ON da.schema_id = s.id
WHERE s.project_id = 1
  AND LOWER(s.facility_type) = 'hospital'
  AND s.is_active = true
GROUP BY s.id, s.name, s.project_id, s.facility_type, s.is_active, p.name;

-- ----------------------------------------------------------------------------
-- STEP 11: Audit Trail
-- ----------------------------------------------------------------------------

-- Check who created/updated the planning data
SELECT 
    sfd.id,
    sfd.entity_type,
    sfd.status,
    sfd.created_at,
    sfd.updated_at,
    u_created.username as created_by_user,
    u_updated.username as updated_by_user,
    CAST(sfd.computed_values->'totals'->>'q4_total' AS NUMERIC) as q4_total
FROM schema_form_data_entries sfd
LEFT JOIN users u_created ON sfd.created_by = u_created.id
LEFT JOIN users u_updated ON sfd.updated_by = u_updated.id
WHERE sfd.entity_type = 'planning'
  AND sfd.project_id = 1
  AND sfd.facility_id = 338
  AND sfd.reporting_period_id = 2
ORDER BY sfd.created_at DESC;

-- ----------------------------------------------------------------------------
-- STEP 12: Raw JSON Data Inspection
-- ----------------------------------------------------------------------------

-- Get raw JSON data for manual inspection
SELECT 
    id,
    entity_type,
    status,
    form_data::text as form_data_json,
    computed_values::text as computed_values_json,
    metadata::text as metadata_json
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2
LIMIT 5;

-- ============================================================================
-- DIAGNOSTIC SUMMARY QUERY
-- ============================================================================

-- Run this single query to get a comprehensive overview
WITH project_info AS (
    SELECT id, name, code FROM projects WHERE id = 1
),
period_info AS (
    SELECT id, name, year FROM reporting_periods WHERE id = 2
),
facility_info AS (
    SELECT id, name, type, district FROM facilities WHERE id = 338
),
planning_summary AS (
    SELECT 
        COUNT(*) as entry_count,
        SUM(CAST(computed_values->'totals'->>'q1_total' AS NUMERIC)) as q1_total,
        SUM(CAST(computed_values->'totals'->>'q2_total' AS NUMERIC)) as q2_total,
        SUM(CAST(computed_values->'totals'->>'q3_total' AS NUMERIC)) as q3_total,
        SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_total,
        SUM(CAST(computed_values->'totals'->>'annual_total' AS NUMERIC)) as annual_total
    FROM schema_form_data_entries
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
)
SELECT 
    '=== CONTEXT ===' as section,
    proj.name as project_name,
    per.name as period_name,
    per.year as period_year,
    fac.name as facility_name,
    fac.type as facility_type,
    fac.district as district,
    '=== PLANNING DATA ===' as planning_section,
    ps.entry_count as planning_entries,
    ps.q1_total as q1_planned,
    ps.q2_total as q2_planned,
    ps.q3_total as q3_planned,
    ps.q4_total as q4_planned,
    ps.annual_total as annual_planned,
    '=== ISSUE ===' as issue_section,
    CASE 
        WHEN ps.entry_count = 0 THEN 'NO PLANNING DATA FOUND'
        WHEN ps.q4_total IS NULL OR ps.q4_total = 0 THEN 'NO Q4 BUDGET PLANNED'
        WHEN ps.q4_total < 20000 THEN 'Q4 BUDGET TOO LOW (Expected: 20000, Found: ' || ps.q4_total || ')'
        ELSE 'Q4 BUDGET SUFFICIENT'
    END as diagnosis
FROM project_info proj
CROSS JOIN period_info per
CROSS JOIN facility_info fac
CROSS JOIN planning_summary ps;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
/*
1. Run queries in order (STEP 1 through STEP 12)
2. Replace placeholder IDs with actual values from STEP 1
3. Focus on STEP 5 to see the Q4 budget total (should be 9,200 based on error)
4. Check STEP 9 to see if multiple entries are causing issues
5. Run the DIAGNOSTIC SUMMARY QUERY at the end for a complete overview

Expected Results:
- Q4 Planned Budget: 9,200.00 (from error message)
- Q4 Actual Expenditure: 20,000.00 (from error message)
- Variance: 10,800.00 over budget

Possible Findings:
1. No planning data exists (entry_count = 0)
2. Q4 budget is incomplete (q4_total = 9,200 instead of 20,000+)
3. Multiple planning entries causing confusion
4. Wrong project/facility/period IDs
5. Planning data not properly computed/saved
*/
