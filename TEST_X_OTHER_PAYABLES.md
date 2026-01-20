# Testing Guide: X. Other Payables → E. Payable 16

## Quick Test Steps

### 1. Open Browser Console
- Open execution form in edit mode
- Open browser DevTools (F12)
- Go to Console tab

### 2. Enter Test Value
1. Navigate to Section X: Miscellaneous Adjustments
2. Find "Other Payables" row (display order 2)
3. Enter value: **1000** in Q1 column
4. Watch console logs

### 3. Expected Console Logs

Look for these log messages:

```
🔄 [X->D/E Calculation] useEffect triggered
🔄 [X->D/E Calculation] Found codes: {
  otherPayablesXCode: "HIV_EXEC_HOSPITAL_X_2",
  otherPayablesCode: "HIV_EXEC_HOSPITAL_E_16",
  ...
}
🔄 [X->D/E Calculation] Payable 16 calculation: {
  otherPayablesXValue: 1000,
  calculatedValue: 1000,
  shouldUpdate: true
}
✅ [X->D/E Calculation] Updating Payable 16 to: 1000
```

### 4. Expected UI Changes

After entering 1000 in X. Other Payables:

| Section | Field | Expected Value | Reason |
|---------|-------|----------------|--------|
| X | Other Payables | 1000 | User input |
| D | Cash at Bank | +1000 | Cash increases (debit) |
| E | Payable 16: Other payables | 1000 | Liability increases (credit) |
| F | Net Financial Assets | 0 change | D↑ and E↑ cancel out |
| G | Surplus/Deficit | -1000 | Expense recognized |

### 5. Troubleshooting

#### Issue: Payable 16 doesn't update

**Check Console for:**
```
⚠️ [X->D/E Calculation] Cannot calculate Payable 16: {
  hasPayable16Code: false,  // ❌ Problem!
  hasOtherPayablesXCode: true
}
```

**Solution**: Payable 16 not found in activities. Check:
1. Is Payable 16 seeded in database?
2. Is it marked as `isComputed`?
3. Run SQL check (see below)

#### Issue: Payable 16 found but not initialized

**Check Console for:**
```
🔧 [X->D/E Calculation] Initializing Payable 16 in formData
```

**Solution**: This is normal! The code will initialize it and update on next render.

#### Issue: Update skipped

**Check Console for:**
```
⏭️ [X->D/E Calculation] Skipping Payable 16 update (no change or duplicate)
```

**Reason**: Value already correct or duplicate calculation prevented.

## SQL Verification

### Check if Payable 16 exists:

```sql
SELECT 
    da.id,
    da.code,
    da.name,
    da.display_order,
    da.activity_type,
    da.is_computed,
    da.project_type,
    da.facility_type,
    da.is_active
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND (da.code LIKE '%_E_16' OR da.name ILIKE '%payable 16%')
ORDER BY da.project_type, da.facility_type;
```

**Expected Result**: Should return rows for each project/facility combination:
- HIV_EXEC_HOSPITAL_E_16
- HIV_EXEC_HEALTH_CENTER_E_16
- MAL_EXEC_HOSPITAL_E_16
- etc.

### Check Section X activities:

```sql
SELECT 
    da.id,
    da.code,
    da.name,
    da.display_order,
    da.activity_type,
    da.project_type,
    da.facility_type
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND sac.code LIKE '%_X'
ORDER BY da.project_type, da.facility_type, da.display_order;
```

**Expected Result**: Should show:
- Display Order 1: Other Receivable
- Display Order 2: Other Payables

## Manual Testing Scenarios

### Scenario 1: Basic Entry (Q1)
1. Q1: Enter 1000 in X. Other Payables
2. Verify:
   - Cash at Bank = Opening + 1000
   - Payable 16 = 1000
   - F = G validation passes

### Scenario 2: Multiple Quarters
1. Q1: Enter 1000 in X. Other Payables
2. Q2: Enter 500 in X. Other Payables
3. Verify:
   - Q2 Cash at Bank = Q1 Cash + 500
   - Q2 Payable 16 = 1000 + 500 = 1500

### Scenario 3: With Clearance
1. Q1: Enter 1000 in X. Other Payables
2. Q2: Clear 300 from Payable 16
3. Verify:
   - Q2 Payable 16 = 1000 - 300 = 700
   - Q2 Cash at Bank decreases by 300

### Scenario 4: Different Projects
Test with:
- HIV Hospital
- HIV Health Center
- Malaria Hospital
- TB Hospital

Each should have its own Payable 16 code pattern.

## Success Criteria

✅ Console shows all expected logs
✅ Payable 16 updates immediately when X. Other Payables changes
✅ Cash at Bank increases correctly
✅ F = G validation passes
✅ Values persist after save/reload
✅ Works across all quarters
✅ Works for all project/facility types

## Common Issues & Fixes

### Issue: "Cannot find Payable 16"
**Fix**: Run seed script to create missing activities

### Issue: "Payable 16 is read-only"
**Fix**: Check if marked as `isComputed` - should be editable for clearances

### Issue: "Values don't persist"
**Fix**: Check save/load logic in edit page

### Issue: "F ≠ G validation fails"
**Fix**: Check if Surplus/Deficit calculation includes X. Other Payables as expense

## Next Steps After Testing

1. If working: Remove excessive console logs (keep key ones)
2. If not working: Share console logs for debugging
3. Add automated tests
4. Update user documentation
