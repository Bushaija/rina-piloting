-- Check if Payable 16 has is_total_row = true (which would exclude it from the form)
SELECT 
    id,
    code,
    name,
    activity_type,
    display_order,
    is_total_row,
    is_active,
    field_mappings
FROM dynamic_activities
WHERE name ILIKE '%payable 16%' OR name ILIKE '%other payable%'
ORDER BY project_type, facility_type;
