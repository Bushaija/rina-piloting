-- Diagnostic Investigation: Malaria & TB Payable Mapping
-- Purpose: Verify database state and identify why payables aren't being created

-- ============================================================================
-- PART 1: Verify Metadata Structure for All Programs
-- ============================================================================

-- Check HIV expense activities with metadata
SELECT 
    'HIV' as program,
    name,
    code,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'payableActivityId' as payable_activity_id,
    display_order
FROM dynamic_activities
WHERE project_type = 'HIV'
    AND module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND code LIKE '%_B_%'
    AND is_active = true
ORDER BY display_order;

-- Check Malaria expense activities with metadata
SELECT 
    'Malaria' as program,
    name,
    code,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'payableActivityId' as payable_activity_id,
    display_order
FROM dynamic_activities
WHERE project_type = 'Malaria'
    AND module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND code LIKE '%_B_%'
    AND is_active = true
ORDER BY display_order;

-- Check TB expense activities with metadata
SELECT 
    'TB' as program,
    name,
    code,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'payableActivityId' as payable_activity_id,
    display_order
FROM dynamic_activities
WHERE project_type = 'TB'
    AND module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND code LIKE '%_B_%'
    AND is_active = true
ORDER BY display_order;

-- ============================================================================
-- PART 2: Verify Payable Activities Exist
-- ============================================================================

-- Check HIV payable activities
SELECT 
    'HIV' as program,
    id,
    name,
    code,
    activity_type,
    display_order
FROM dynamic_activities
WHERE project_type = 'HIV'
    AND module_type = 'execution'
    AND activity_type = 'PAYABLE'
    AND facility_type = 'hospital'
    AND is_active = true
ORDER BY display_order;

-- Check Malaria payable activities
SELECT 
    'Malaria' as program,
    id,
    name,
    code,
    activity_type,
    display_order
FROM dynamic_activities
WHERE project_type = 'Malaria'
    AND module_type = 'execution'
    AND activity_type = 'PAYABLE'
    AND facility_type = 'hospital'
    AND is_active = true
ORDER BY display_order;

-- Check TB payable activities
SELECT 
    'TB' as program,
    id,
    name,
    code,
    activity_type,
    display_order
FROM dynamic_activities
WHERE project_type = 'TB'
    AND module_type = 'execution'
    AND activity_type = 'PAYABLE'
    AND facility_type = 'hospital'
    AND is_active = true
ORDER BY display_order;

-- ============================================================================
-- PART 3: Verify Mapping Completeness
-- ============================================================================

-- Count expenses WITH payableActivityId mapping
SELECT 
    project_type,
    COUNT(*) as expenses_with_mapping
FROM dynamic_activities
WHERE module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND is_active = true
    AND metadata->>'payableActivityId' IS NOT NULL
    AND metadata->>'payableActivityId' != ''
GROUP BY project_type
ORDER BY project_type;

-- Count expenses WITHOUT payableActivityId mapping
SELECT 
    project_type,
    COUNT(*) as expenses_without_mapping
FROM dynamic_activities
WHERE module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND is_active = true
    AND (metadata->>'payableActivityId' IS NULL OR metadata->>'payableActivityId' = '')
GROUP BY project_type
ORDER BY project_type;

-- ============================================================================
-- PART 4: Verify Specific Malaria Expense (Communication - All)
-- ============================================================================

-- Find Communication - All expense for Malaria
SELECT 
    'Malaria Communication Expense' as item,
    id,
    name,
    code,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'payableActivityId' as payable_activity_id,
    metadata
FROM dynamic_activities
WHERE project_type = 'Malaria'
    AND module_type = 'execution'
    AND facility_type = 'hospital'
    AND name ILIKE '%communication%'
    AND activity_type = 'EXPENSE'
    AND is_active = true;

-- Find corresponding payable for Malaria Communication
SELECT 
    'Malaria Communication Payable' as item,
    id,
    name,
    code,
    activity_type
FROM dynamic_activities
WHERE project_type = 'Malaria'
    AND module_type = 'execution'
    AND facility_type = 'hospital'
    AND name ILIKE '%payable%communication%'
    AND activity_type = 'PAYABLE'
    AND is_active = true;

-- ============================================================================
-- PART 5: Cross-Reference Mapping Integrity
-- ============================================================================

-- Verify that payableActivityId references valid payable IDs
SELECT 
    e.project_type,
    e.name as expense_name,
    e.code as expense_code,
    e.metadata->>'payableActivityId' as payable_activity_id,
    p.id as actual_payable_id,
    p.name as payable_name,
    p.code as payable_code,
    CASE 
        WHEN p.id IS NULL THEN '❌ BROKEN REFERENCE'
        ELSE '✅ VALID'
    END as mapping_status
FROM dynamic_activities e
LEFT JOIN dynamic_activities p ON p.id = (e.metadata->>'payableActivityId')::integer
WHERE e.module_type = 'execution'
    AND e.activity_type = 'EXPENSE'
    AND e.facility_type = 'hospital'
    AND e.is_active = true
    AND e.metadata->>'payableActivityId' IS NOT NULL
    AND e.project_type IN ('HIV', 'Malaria', 'TB')
ORDER BY e.project_type, e.display_order;

-- ============================================================================
-- PART 6: Summary Statistics
-- ============================================================================

-- Overall mapping statistics by program
SELECT 
    project_type,
    COUNT(*) as total_expenses,
    COUNT(CASE WHEN metadata->>'payableActivityId' IS NOT NULL THEN 1 END) as mapped_expenses,
    COUNT(CASE WHEN metadata->>'payableActivityId' IS NULL THEN 1 END) as unmapped_expenses,
    ROUND(
        100.0 * COUNT(CASE WHEN metadata->>'payableActivityId' IS NOT NULL THEN 1 END) / COUNT(*),
        2
    ) as mapping_percentage
FROM dynamic_activities
WHERE module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND facility_type = 'hospital'
    AND is_active = true
    AND project_type IN ('HIV', 'Malaria', 'TB')
GROUP BY project_type
ORDER BY project_type;
