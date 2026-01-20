# ROOT CAUSE IDENTIFIED: Duplicate Hardcoded Mapping Logic

## 🎯 Root Cause

**File**: `apps/client/hooks/use-execution-form.ts`  
**Lines**: 520-605  
**Issue**: Duplicate hardcoded expense-to-payable mapping logic using HIV-specific payable numbers

## 🔍 The Problem

There are **TWO** places where expense-to-payable mapping is being built:

### 1. ✅ CORRECT: Database-Driven Mapping (expense-to-payable-mapping.ts)
**File**: `apps/client/features/execution/utils/expense-to-payable-mapping.ts`  
**Function**: `generateExpenseToPayableMapping()`  
**Approach**: 
- Uses `metadata.payableActivityId` from database (Priority 1)
- Falls back to `metadata.payableName` (Priority 2)
- Falls back to pattern matching (Priority 3)
- **Works for all programs** (HIV, Malaria, TB)

### 2. ❌ WRONG: Hardcoded Mapping (use-execution-form.ts)
**File**: `apps/client/hooks/use-execution-form.ts`  
**Lines**: 520-605  
**Approach**:
- Builds mapping using hardcoded pattern matching
- Uses HIV-specific payable numbers: `E_12`, `E_13`, `E_14`, `E_15`
- **Only works for HIV** because Malaria/TB have different payable numbers

## 📊 Why HIV Works But Malaria/TB Don't

### HIV Payable Numbers (Overheads)
```
Payable 12: Communication - All  → E_12 ✅
Payable 13: Maintenance          → E_13 ✅
Payable 14: Fuel                 → E_14 ✅
Payable 15: Office supplies      → E_15 ✅
```

### Malaria Payable Numbers (Overheads)
```
Payable 5: Communication - All   → E_5  ❌ (looking for E_12)
Payable 6: Maintenance           → E_6  ❌ (looking for E_13)
Payable 7: Fuel                  → E_7  ❌ (looking for E_14)
Payable 8: Office supplies       → E_8  ❌ (looking for E_15)
```

### TB Payable Numbers (Overheads)
```
Payable 5: Communication - All   → E_5  ❌ (looking for E_12)
Payable 6: Maintenance           → E_6  ❌ (looking for E_13)
Payable 7: Fuel                  → E_7  ❌ (looking for E_14)
Payable 8: Office supplies       → E_8  ❌ (looking for E_15)
```

## 🐛 The Bug

In `use-execution-form.ts`, the code does this:

```typescript
// Line 588-605
} else if (expenseName.includes('communication') && expenseName.includes('all')) {
  // B-04: Communication - All → Payable 12 (E_12)
  const payableCode = payableCodes.find(code => code.includes('_E_12'));  // ❌ HARDCODED
  if (payableCode) expenseToPayableMap[expenseCode] = payableCode;
} else if (expenseName.includes('maintenance')) {
  // B-04: Maintenance → Payable 13 (E_13)
  const payableCode = payableCodes.find(code => code.includes('_E_13'));  // ❌ HARDCODED
  if (payableCode) expenseToPayableMap[expenseCode] = payableCode;
} else if (expenseName === 'fuel' || (expenseName.includes('fuel') && !expenseName.includes('refund'))) {
  // B-04: Fuel → Payable 14 (E_14)
  const payableCode = payableCodes.find(code => code.includes('_E_14'));  // ❌ HARDCODED
  if (payableCode) expenseToPayableMap[expenseCode] = payableCode;
} else if (expenseName.includes('office supplies') || (expenseName.includes('supplies') && !expenseName.includes('consumable'))) {
  // B-04: Office supplies → Payable 15 (E_15)
  const payableCode = payableCodes.find(code => code.includes('_E_15'));  // ❌ HARDCODED
  if (payableCode) expenseToPayableMap[expenseCode] = payableCode;
}
```

**Problem**: 
- For Malaria, `payableCodes` contains `MAL_EXEC_HOSPITAL_E_5`, `MAL_EXEC_HOSPITAL_E_6`, etc.
- The code looks for `_E_12`, `_E_13`, `_E_14`, `_E_15`
- `payableCodes.find(code => code.includes('_E_12'))` returns `undefined` ❌
- No mapping is created for Malaria/TB expenses
- Payables remain at 0

## ✅ The Solution

**REMOVE** the hardcoded mapping logic from `use-execution-form.ts` and **USE** the database-driven mapping from `expense-to-payable-mapping.ts`.

### Step 1: Import the Mapping Utility

```typescript
// At the top of use-execution-form.ts
import { generateExpenseToPayableMapping } from '@/features/execution/utils/expense-to-payable-mapping';
```

### Step 2: Replace Hardcoded Logic

**REMOVE** lines 520-605 (the entire hardcoded mapping logic)

**REPLACE** with:

```typescript
// Generate expense-to-payable mapping using database-driven approach
const expenseToPayableMap = generateExpenseToPayableMapping(hierarchicalData);

console.log('🗺️ [Expense-to-Payable Mapping]:', {
  totalMappings: Object.keys(expenseToPayableMap).length,
  mappings: expenseToPayableMap
});
```

### Step 3: Keep the Rest of the Logic

The rest of the payable calculation logic (lines 606+) can stay as-is because it uses the `expenseToPayableMap` object, which will now be correctly populated for all programs.

## 🎯 Why This Fix Works

1. **Database-Driven**: Uses `metadata.payableActivityId` from database
2. **Program-Agnostic**: Works for HIV, Malaria, TB without hardcoded numbers
3. **Centralized**: Single source of truth for mapping logic
4. **Maintainable**: Changes to mapping only need to be made in one place
5. **Backward Compatible**: Falls back to pattern matching for legacy data

## 📝 Implementation Plan

### File to Modify
- `apps/client/hooks/use-execution-form.ts`

### Changes Required
1. Add import for `generateExpenseToPayableMapping`
2. Remove lines 520-605 (hardcoded mapping logic)
3. Replace with single line: `const expenseToPayableMap = generateExpenseToPayableMapping(hierarchicalData);`
4. Add console logging for debugging

### Testing
1. Navigate to Malaria execution form
2. Enter: Communication - All (unpaid) = 1000
3. Verify: Payable 5: Communication - All = 1180 (with 18% VAT)
4. Check console logs for mapping confirmation

## 🚀 Expected Results After Fix

### Malaria
```
Input:  Communication - All = 1000 (unpaid)
Output: Payable 5: Communication - All = 1180 ✅
```

### TB
```
Input:  Communication - All = 1000 (unpaid)
Output: Payable 5: Communication - All = 1180 ✅
```

### HIV (Backward Compatibility)
```
Input:  Communication - All = 1000 (unpaid)
Output: Payable 12: Communication - All = 1180 ✅
```

## 🔄 Why Previous Fixes Didn't Work

Previous fixes focused on:
1. ✅ Seeder - storing `payableName` in metadata
2. ✅ Mapping script - setting `payableActivityId` in metadata
3. ✅ API - returning metadata field
4. ✅ Mapping utility - using database-driven approach

**BUT** we missed:
- ❌ The duplicate hardcoded mapping logic in `use-execution-form.ts`
- ❌ This logic was overriding the database-driven mapping
- ❌ It was only working for HIV because of hardcoded numbers

## 📊 Code Flow (After Fix)

```
1. User enters expense
   └─> use-execution-form.ts: Auto-calculate Payables effect

2. Generate mapping
   └─> generateExpenseToPayableMapping(hierarchicalData)
   └─> Uses metadata.payableActivityId from database
   └─> Returns: { expenseCode: payableCode }

3. Calculate payables
   └─> For each expense, find mapped payable
   └─> Calculate unpaid amount
   └─> Update payable value

4. Update form state
   └─> setFormData with new payable values
   └─> UI re-renders with updated payables
```

## ✅ Success Criteria

- [ ] Hardcoded mapping logic removed from use-execution-form.ts
- [ ] Database-driven mapping utility imported and used
- [ ] Malaria expenses create correct payables
- [ ] TB expenses create correct payables
- [ ] HIV still works (backward compatibility)
- [ ] Console logs show correct mappings
- [ ] No pattern match failures for Malaria/TB

---

**Status**: ✅ ROOT CAUSE IDENTIFIED  
**Next Action**: Implement the fix in `use-execution-form.ts`  
**Estimated Time**: 5 minutes  
**Risk**: Low (backward compatible, well-tested utility)
