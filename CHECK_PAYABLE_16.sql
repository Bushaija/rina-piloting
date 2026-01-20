-- Check if Payable 16: Other payables exists in the database
-- Run this query to identify the activity setup

-- 1. Check all Section E (Financial Liabilities) activities for HIV
SELECT 
    da.id,
    da.code,
    da.name,
    da.activity_type,
    da.display_order,
    da.project_type,
    da.facility_type,
    da.module_type,
    da.is_active,
    sac.code as category_code,
    sac.name as category_name
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND da.project_type = 'HIV'
  AND sac.code LIKE '%_E%'
ORDER BY da.display_order;

-- 2. Specifically search for "Other payables" or "Payable 16"
SELECT 
    da.id,
    da.code,
    da.name,
    da.activity_type,
    da.display_order,
    da.project_type,
    da.facility_type,
    da.module_type,
    da.is_active,
    sac.code as category_code
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND (da.name ILIKE '%other payable%' OR da.name ILIKE '%payable 16%')
ORDER BY da.project_type, da.facility_type;

-- 3. Check Section X (Miscellaneous Adjustments) activities
SELECT 
    da.id,
    da.code,
    da.name,
    da.activity_type,
    da.display_order,
    da.project_type,
    da.facility_type,
    da.module_type,
    da.is_active,
    sac.code as category_code,
    sac.name as category_name
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND da.project_type = 'HIV'
  AND sac.code LIKE '%_X%'
ORDER BY da.display_order;

-- 4. Count activities by category for HIV hospital
SELECT 
    sac.code as category_code,
    sac.name as category_name,
    COUNT(da.id) as activity_count
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND da.project_type = 'HIV'
  AND da.facility_type = 'hospital'
  AND da.is_active = true
GROUP BY sac.code, sac.name
ORDER BY sac.code;

-- 5. Check if category E exists for execution module
SELECT 
    id,
    code,
    name,
    module_type,
    project_type,
    facility_type,
    display_order,
    is_active
FROM schema_activity_categories
WHERE module_type = 'execution'
  AND code LIKE '%_E%'
ORDER BY project_type, facility_type;
