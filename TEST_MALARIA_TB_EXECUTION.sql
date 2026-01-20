-- Test Script for Malaria and TB Execution Form Mappings
-- Run this after seeding to verify everything is working correctly

-- ============================================================================
-- 1. Check Malaria Expenses and Their Payable Mappings
-- ============================================================================
SELECT 
    '=== MALARIA EXPENSES ===' as section,
    '' as name,
    '' as payable_name,
    '' as vat_category,
    '' as has_mapping
UNION ALL
SELECT 
    '',
    da.name,
    da.metadata->>'payableName' as payable_name,
    da.metadata->>'vatCategory' as vat_category,
    CASE 
        WHEN da.metadata->>'payableActivityId' IS NOT NULL THEN '✅ Mapped'
        WHEN da.metadata->>'payableName' IS NOT NULL THEN '❌ Missing'
        ELSE '⚪ N/A'
    END as has_mapping
FROM dynamic_activities da
WHERE da.project_type = 'Malaria'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'EXPENSE'
    AND da.is_total_row = false
ORDER BY da.display_order;

-- ============================================================================
-- 2. Check Malaria VAT Receivables
-- ============================================================================
SELECT 
    '=== MALARIA VAT RECEIVABLES ===' as section,
    '' as name,
    '' as vat_category
UNION ALL
SELECT 
    '',
    da.name,
    da.metadata->>'vatCategory' as vat_category
FROM dynamic_activities da
WHERE da.project_type = 'Malaria'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'VAT_RECEIVABLE'
ORDER BY da.display_order;

-- ============================================================================
-- 3. Check Malaria Payables
-- ============================================================================
SELECT 
    '=== MALARIA PAYABLES ===' as section,
    '' as name,
    '' as linked_expenses
UNION ALL
SELECT 
    '',
    da.name,
    (
        SELECT COUNT(*)::text
        FROM dynamic_activities exp
        WHERE (exp.metadata->>'payableActivityId')::integer = da.id
    ) as linked_expenses
FROM dynamic_activities da
WHERE da.project_type = 'Malaria'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'LIABILITY'
    AND da.is_total_row = false
ORDER BY da.display_order;

-- ============================================================================
-- 4. Check TB Expenses and Their Payable Mappings
-- ============================================================================
SELECT 
    '=== TB EXPENSES ===' as section,
    '' as name,
    '' as payable_name,
    '' as vat_category,
    '' as has_mapping
UNION ALL
SELECT 
    '',
    da.name,
    da.metadata->>'payableName' as payable_name,
    da.metadata->>'vatCategory' as vat_category,
    CASE 
        WHEN da.metadata->>'payableActivityId' IS NOT NULL THEN '✅ Mapped'
        WHEN da.metadata->>'payableName' IS NOT NULL THEN '❌ Missing'
        ELSE '⚪ N/A'
    END as has_mapping
FROM dynamic_activities da
WHERE da.project_type = 'TB'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'EXPENSE'
    AND da.is_total_row = false
ORDER BY da.display_order;

-- ============================================================================
-- 5. Check TB VAT Receivables
-- ============================================================================
SELECT 
    '=== TB VAT RECEIVABLES ===' as section,
    '' as name,
    '' as vat_category
UNION ALL
SELECT 
    '',
    da.name,
    da.metadata->>'vatCategory' as vat_category
FROM dynamic_activities da
WHERE da.project_type = 'TB'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'VAT_RECEIVABLE'
ORDER BY da.display_order;

-- ============================================================================
-- 6. Check TB Payables
-- ============================================================================
SELECT 
    '=== TB PAYABLES ===' as section,
    '' as name,
    '' as linked_expenses
UNION ALL
SELECT 
    '',
    da.name,
    (
        SELECT COUNT(*)::text
        FROM dynamic_activities exp
        WHERE (exp.metadata->>'payableActivityId')::integer = da.id
    ) as linked_expenses
FROM dynamic_activities da
WHERE da.project_type = 'TB'
    AND da.module_type = 'execution'
    AND da.facility_type = 'hospital'
    AND da.activity_type = 'LIABILITY'
    AND da.is_total_row = false
ORDER BY da.display_order;

-- ============================================================================
-- 7. Summary Statistics
-- ============================================================================
SELECT 
    '=== SUMMARY STATISTICS ===' as metric,
    '' as malaria,
    '' as tb,
    '' as hiv
UNION ALL
SELECT 
    'Total Expenses',
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'Malaria' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'TB' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'HIV' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital')
UNION ALL
SELECT 
    'Expenses with Payable Mapping',
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'Malaria' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital' AND metadata->>'payableActivityId' IS NOT NULL),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'TB' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital' AND metadata->>'payableActivityId' IS NOT NULL),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'HIV' AND module_type = 'execution' AND activity_type = 'EXPENSE' AND is_total_row = false AND facility_type = 'hospital' AND metadata->>'payableActivityId' IS NOT NULL)
UNION ALL
SELECT 
    'VAT Receivables',
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'Malaria' AND module_type = 'execution' AND activity_type = 'VAT_RECEIVABLE' AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'TB' AND module_type = 'execution' AND activity_type = 'VAT_RECEIVABLE' AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'HIV' AND module_type = 'execution' AND activity_type = 'VAT_RECEIVABLE' AND facility_type = 'hospital')
UNION ALL
SELECT 
    'Payables',
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'Malaria' AND module_type = 'execution' AND activity_type = 'LIABILITY' AND is_total_row = false AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'TB' AND module_type = 'execution' AND activity_type = 'LIABILITY' AND is_total_row = false AND facility_type = 'hospital'),
    (SELECT COUNT(*)::text FROM dynamic_activities WHERE project_type = 'HIV' AND module_type = 'execution' AND activity_type = 'LIABILITY' AND is_total_row = false AND facility_type = 'hospital');

-- ============================================================================
-- 8. Check for Unmapped Expenses (Should be empty or only non-payable items)
-- ============================================================================
SELECT 
    '=== UNMAPPED EXPENSES (Should only be Bank charges, Transfers, etc.) ===' as section,
    '' as project,
    '' as name,
    '' as expected_payable
UNION ALL
SELECT 
    '',
    da.project_type::text,
    da.name,
    da.metadata->>'payableName' as expected_payable
FROM dynamic_activities da
WHERE da.module_type = 'execution'
    AND da.activity_type = 'EXPENSE'
    AND da.is_total_row = false
    AND da.metadata->>'payableActivityId' IS NULL
    AND da.metadata->>'payableName' IS NOT NULL
    AND da.facility_type = 'hospital'
ORDER BY da.project_type, da.name;

-- ============================================================================
-- 9. Verify VAT Category Consistency
-- ============================================================================
SELECT 
    '=== VAT CATEGORY CONSISTENCY CHECK ===' as section,
    '' as project,
    '' as vat_category,
    '' as has_expense,
    '' as has_receivable
UNION ALL
SELECT 
    '',
    project_type::text,
    vat_category,
    CASE WHEN expense_count > 0 THEN '✅' ELSE '❌' END as has_expense,
    CASE WHEN receivable_count > 0 THEN '✅' ELSE '❌' END as has_receivable
FROM (
    SELECT 
        e.project_type,
        e.metadata->>'vatCategory' as vat_category,
        COUNT(DISTINCT e.id) as expense_count,
        COUNT(DISTINCT r.id) as receivable_count
    FROM dynamic_activities e
    LEFT JOIN dynamic_activities r ON 
        r.project_type = e.project_type 
        AND r.facility_type = e.facility_type
        AND r.module_type = 'execution'
        AND r.activity_type = 'VAT_RECEIVABLE'
        AND r.metadata->>'vatCategory' = e.metadata->>'vatCategory'
    WHERE e.module_type = 'execution'
        AND e.activity_type = 'EXPENSE'
        AND e.metadata->>'vatCategory' IS NOT NULL
        AND e.facility_type = 'hospital'
    GROUP BY e.project_type, e.metadata->>'vatCategory'
) vat_check
ORDER BY project_type, vat_category;
