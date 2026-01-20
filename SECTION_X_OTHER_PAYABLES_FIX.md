# Section X Other Payables → E. Payable 16 Double-Entry Fix

## Problem Summary

When users enter an amount in **X. Other Payables** (Section X, display order 2):
- ✅ **Cash at Bank increases** (UI shows correct value)
- ❌ **E. Payable 16: Other payables does NOT increase** (missing double-entry)

This breaks the double-entry accounting principle where:
- **Debit**: Cash at Bank (asset increases)
- **Credit**: Payable 16: Other payables (liability increases)

## Current Implementation Analysis

### 1. Database Structure (Correct)

**Section X Activities** (`execution-categories-activities.ts`):
```typescript
// X. Miscellaneous Adjustments
{ categoryCode: 'X', name: 'Other Receivable', displayOrder: 1, activityType: 'MISCELLANEOUS_ADJUSTMENT' }
{ categoryCode: 'X', name: 'Other Payables', displayOrder: 2, activityType: 'MISCELLANEOUS_ADJUSTMENT' }
```

**Section E Activities**:
```typescript
{ categoryCode: 'E', name: 'Payable 16: Other payables', displayOrder: 16, activityType: 'LIABILITY' }
```

**Activity Code Pattern**:
```
{PROJECT}_EXEC_{FACILITY}_X_{displayOrder}
{PROJECT}_EXEC_{FACILITY}_E_{displayOrder}

Examples:
- HIV_EXEC_HOSPITAL_X_2 (Other Payables in Section X)
- HIV_EXEC_HOSPITAL_E_16 (Payable 16: Other payables)
```

### 2. Cash Calculation (Working)

**File**: `apps/client/hooks/use-execution-form.ts` (lines 350-437)

```typescript
// Calculate total miscellaneous adjustments from Section X
let otherReceivableAmount = 0; // Decreases cash
let otherPayablesAmount = 0;   // Increases cash

miscAdjustmentCodes.forEach(code => {
  if (code.includes('_X_1')) {
    otherReceivableAmount += value;
  } else if (code.includes('_X_2')) {
    otherPayablesAmount += value;  // ✅ Correctly identified
  }
});

// Cash calculation
const calculatedCashAtBank = previousQuarterCash + totalReceipts - totalPaidExpenses 
  - otherReceivableAmount + otherPayablesAmount + ...;  // ✅ Correctly adds Other Payables
```

**Status**: ✅ Working correctly - Cash increases when X. Other Payables is entered

### 3. Payable 16 Calculation (Broken)

**File**: `apps/client/hooks/use-execution-form.ts` (lines 950-1050)

```typescript
useEffect(() => {
  // Find Payable 16 code
  let otherPayablesCode = eCodes.find(c => c.includes('_E_16'));  // ❌ PROBLEM HERE
  
  // Calculate: Opening + X section value - Cleared
  const calculatedValue = openingBalance + otherPayablesXValue - clearedAmount;
  
  // Update Payable 16
  setFormData(prev => ({
    ...prev,
    [otherPayablesCode]: {
      ...existingData,
      [quarterKey]: calculatedValue,
    }
  }));
}, [formData, quarter, previousQuarterBalances, activitiesQuery.data]);
```

**Status**: ❌ Broken - The code exists but has issues

## Root Cause Analysis

### Issue 1: Code Pattern Matching
The code searches for `_E_16` but the actual pattern is `_E_16` at the END of the code:
- Actual: `HIV_EXEC_HOSPITAL_E_16`
- Search: `c.includes('_E_16')` ✅ Should work

### Issue 2: Payable 16 Not in formData Initially
The code first searches in `formData`, but Payable 16 might not exist in formData if:
1. It's marked as `isComputed` or has no initial value
2. The activity hasn't been initialized yet

The fallback searches `hierarchicalData` (activities schema), which should work.

### Issue 3: Effect Dependencies
The useEffect depends on `[formData, quarter, previousQuarterBalances, activitiesQuery.data]`

When user types in X. Other Payables:
1. `formData` changes → useEffect triggers ✅
2. Code finds `otherPayablesXCode` (X_2) ✅
3. Code should find `otherPayablesCode` (E_16) ✅
4. Code calculates and updates Payable 16 ✅

**But why doesn't it work?**

### Issue 4: Payable 16 Initialization
Looking at line 169-171 in `use-execution-form.ts`:
```typescript
// Include Payable 16 (E_16) even if marked as computed
const isPayable16 = item.code?.includes('_E_16') || item.name?.toLowerCase().includes('payable 16');
if (!item.isTotalRow && (!item.isComputed || isPayable16)) {
  editableActivities.push(item);
}
```

This suggests Payable 16 might be marked as `isComputed` in the database, which could prevent it from being initialized in formData.

## Proposed Fix

### Option 1: Ensure Payable 16 is Initialized (Recommended)

**File**: `apps/client/hooks/use-execution-form.ts`

Add initialization logic to ensure Payable 16 exists in formData:

```typescript
// After line 950, before the useEffect
useEffect(() => {
  if (!activitiesQuery.data) return;
  
  const hierarchicalData = activitiesQuery.data as any;
  const sectionE = hierarchicalData?.E;
  
  // Find Payable 16 activity
  const payable16Activity = sectionE?.items?.find((item: any) => 
    item.code?.includes('_E_16') || item.name?.toLowerCase().includes('payable 16')
  );
  
  if (payable16Activity && !formData[payable16Activity.code]) {
    // Initialize Payable 16 in formData if it doesn't exist
    setFormData(prev => ({
      ...prev,
      [payable16Activity.code]: {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        comment: '',
        payableCleared: {},
        priorYearAdjustment: {},
      }
    }));
  }
}, [activitiesQuery.data, formData]);
```

### Option 2: Improve Code Finding Logic

**File**: `apps/client/hooks/use-execution-form.ts` (line 978)

Make the code finding more robust:

```typescript
// Find Payable 16 code - try multiple strategies
let otherPayablesCode = eCodes.find(c => c.includes('_E_16'));

if (!otherPayablesCode && activitiesQuery.data) {
  const hierarchicalData = activitiesQuery.data as any;
  const sectionE = hierarchicalData?.E;
  
  if (sectionE?.items) {
    // Try multiple matching strategies
    const found = sectionE.items.find((item: any) => 
      item.code?.includes('_E_16') || 
      item.code?.endsWith('_E_16') ||
      item.name?.toLowerCase().includes('payable 16') ||
      item.name?.toLowerCase().includes('other payable') ||
      (item.displayOrder === 16 && item.categoryCode === 'E')
    );
    
    if (found) {
      otherPayablesCode = found.code;
      console.log('🔍 [X->D/E Calculation] Found Payable 16:', otherPayablesCode);
      
      // Initialize in formData if not present
      if (!formData[otherPayablesCode]) {
        setFormData(prev => ({
          ...prev,
          [otherPayablesCode]: {
            q1: 0, q2: 0, q3: 0, q4: 0,
            comment: '',
            payableCleared: {},
            priorYearAdjustment: {},
          }
        }));
      }
    }
  }
}
```

### Option 3: Add Logging for Debugging

Add comprehensive logging to understand what's happening:

```typescript
console.log('🔄 [X->D/E Calculation] Debug info:', {
  otherPayablesXCode,
  otherPayablesXValue: formData[otherPayablesXCode || '']?.[quarterKey],
  otherPayablesCode,
  otherPayablesCodeExists: !!otherPayablesCode,
  otherPayablesCodeInFormData: otherPayablesCode ? (otherPayablesCode in formData) : false,
  currentPayable16Value: otherPayablesCode ? formData[otherPayablesCode]?.[quarterKey] : 'N/A',
  allECodes: eCodes,
  sectionEItems: hierarchicalData?.E?.items?.map((i: any) => ({ code: i.code, name: i.name, displayOrder: i.displayOrder }))
});
```

## Testing Plan

### 1. Verify Current State
```sql
-- Check if Payable 16 exists and its properties
SELECT 
    da.id,
    da.code,
    da.name,
    da.display_order,
    da.activity_type,
    da.is_computed,
    da.project_type,
    da.facility_type
FROM dynamic_activities da
JOIN schema_activity_categories sac ON da.category_id = sac.id
WHERE da.module_type = 'execution'
  AND da.name ILIKE '%payable 16%'
ORDER BY da.project_type, da.facility_type;
```

### 2. Test Scenario
1. Open execution form for Q1
2. Enter 1000 in X. Other Payables
3. Verify:
   - ✅ Cash at Bank increases by 1000
   - ✅ E. Payable 16: Other payables increases by 1000
   - ✅ F. Net Financial Assets remains unchanged (D increases, E increases equally)
   - ✅ G. Closing Balance decreases by 1000 (expense recognized)

### 3. Edge Cases
- Test with previous quarter balance
- Test with payable clearance
- Test across multiple quarters
- Test with different project types (HIV, MAL, TB)
- Test with different facility types (hospital, health_center)

## Double-Entry Accounting Verification

When X. Other Payables = 1000:

| Account | Debit | Credit | Balance Change |
|---------|-------|--------|----------------|
| Cash at Bank (D) | 1000 | | +1000 |
| Payable 16 (E) | | 1000 | +1000 |
| Surplus/Deficit (C) | | 1000 | -1000 |

**Net Effect**:
- Assets (D) = +1000
- Liabilities (E) = +1000
- Net Financial Assets (F = D - E) = 0 (balanced)
- Equity (G) = -1000 (expense recognized)

## Implementation Priority

1. **High Priority**: Add logging to understand current behavior
2. **High Priority**: Implement Option 2 (Improve code finding + initialization)
3. **Medium Priority**: Add comprehensive tests
4. **Low Priority**: Update documentation

## Files to Modify

1. `apps/client/hooks/use-execution-form.ts` (lines 950-1050)
   - Improve Payable 16 code finding
   - Add initialization logic
   - Add comprehensive logging

2. `apps/client/features/execution/components/v2/table.tsx`
   - Verify Payable 16 is displayed correctly
   - Add tooltip explaining auto-calculation

3. `apps/app-doc/execution-activity-impacts.md`
   - Document X. Other Payables impact on E. Payable 16
