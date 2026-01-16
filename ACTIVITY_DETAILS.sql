-- ============================================================================
-- ACTIVITY DETAILS - See What Each Activity ID Represents
-- ============================================================================

-- Get details for activities 281-307 to see which ones need budget
SELECT 
    da.id,
    da.code,
    da.name,
    sac.name as category_name,
    sac.code as category_code,
    da.display_order,
    da.is_active
FROM dynamic_activities da
LEFT JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.id BETWEEN 281 AND 307
ORDER BY sac.display_order, da.display_order;

-- ============================================================================
-- PLANNING FORM COMPLETION STATUS
-- ============================================================================

-- Show which activities have budget and which don't
WITH planning_activities AS (
    SELECT 
        key::integer as activity_id,
        value->>'q1_amount' as q1,
        value->>'q2_amount' as q2,
        value->>'q3_amount' as q3,
        value->>'q4_amount' as q4,
        value->>'total_budget' as total
    FROM schema_form_data_entries,
         jsonb_each(form_data->'activities')
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
)
SELECT 
    da.id,
    da.name as activity_name,
    sac.name as category_name,
    COALESCE(pa.q4, '0') as q4_budget,
    COALESCE(pa.total, '0') as total_budget,
    CASE 
        WHEN COALESCE(pa.q4, '0')::numeric > 0 THEN '✓ Has Budget'
        ELSE '✗ No Budget'
    END as status
FROM dynamic_activities da
LEFT JOIN schema_activity_categories sac ON da.category_id = sac.id
LEFT JOIN planning_activities pa ON da.id = pa.activity_id
WHERE da.id BETWEEN 281 AND 307
ORDER BY sac.display_order, da.display_order;

-- ============================================================================
-- SUMMARY: How Many Activities Need Budget
-- ============================================================================

WITH planning_activities AS (
    SELECT 
        key::integer as activity_id,
        value->>'q4_amount' as q4
    FROM schema_form_data_entries,
         jsonb_each(form_data->'activities')
    WHERE entity_type = 'planning'
      AND project_id = 1
      AND facility_id = 338
      AND reporting_period_id = 2
)
SELECT 
    COUNT(*) as total_activities,
    COUNT(CASE WHEN COALESCE(pa.q4, '0')::numeric > 0 THEN 1 END) as activities_with_budget,
    COUNT(CASE WHEN COALESCE(pa.q4, '0')::numeric = 0 THEN 1 END) as activities_without_budget,
    SUM(COALESCE(pa.q4, '0')::numeric) as current_q4_total,
    20000 - SUM(COALESCE(pa.q4, '0')::numeric) as additional_budget_needed
FROM dynamic_activities da
LEFT JOIN planning_activities pa ON da.id = pa.activity_id
WHERE da.id BETWEEN 281 AND 307;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
/*
These queries will show you:

1. First query: Names of all activities (281-307)
   - See what each activity represents
   - Identify which ones should have budget

2. Second query: Completion status
   - Which activities have Q4 budget
   - Which activities need Q4 budget
   - Current budget amounts

3. Third query: Summary statistics
   - Total activities: 27
   - Activities with budget: 1 (only activity 281)
   - Activities without budget: 26
   - Current Q4 total: 9,200
   - Additional needed: 10,800

NEXT STEPS:
1. Run these queries to see activity names
2. Identify which activities should have budget
3. Go to Planning module
4. Fill in Q4 values for those activities
5. Ensure total reaches 20,000
*/
