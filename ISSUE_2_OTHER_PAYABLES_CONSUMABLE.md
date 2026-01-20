# Issue 2: Other Payables & Consumable Mapping Problems

## 🐛 Issues Identified

### Issue 2.1: Other Payables (Section X → Section E)
**Problem**: When user enters "Other Payables" in Section X (e.g., 1500), Cash at Bank increases by 1500 but "Payable 11: Other payables" in Section E is not updated.

**Expected Behavior**:
- Input: X. Other Payables = 1500
- Cash at Bank: +1500 (increases) ✅
- E. Payable 11: Other payables = 1500 (increases) ❌ NOT WORKING

**Root Cause**: The code in `use-execution-form.ts` is looking for `_E_16` (HIV payable number) instead of `_E_11` (Malaria payable number).

### Issue 2.2: Consumable Mapping (Section B → Section E)
**Problem**: "Consumable (supplies, stationaries, & human landing)" expense maps to "Payable 8: Office supplies" instead of "Payable 10: Consumable".

**Expected Behavior**:
- Input: Office supplies = 1000 (unpaid)
- Output: Payable 8: Office supplies = 1180 ✅
- Input: Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
- Output: Payable 10: Consumable = 1180 ❌ NOT WORKING (goes to Payable 8 instead)

**Root Cause**: Pattern matching in `expense-to-payable-mapping.ts` checks for "supplies" before "consumable", causing mismatches.

---

## 🔍 Detailed Analysis

### Issue 2.1: Other Payables Mapping

#### Current Code (use-execution-form.ts, line ~950)
```typescript
// Find Payable 16 code - first try formData, then hierarchical data
let otherPayablesCode = eCodes.find(c => c.includes('_E_16'));
```

**Problem**: This hardcodes `_E_16` which is the HIV payable number.

**Malaria Structure**:
- HIV: Payable 16: Other payables → `HIV_EXEC_HOSPITAL_E_16`
- Malaria: Payable 11: Other payables → `MAL_EXEC_HOSPITAL_E_11`
- TB: Payable 9: Other payables → `TB_EXEC_HOSPITAL_E_9`

**Why It Fails**:
```typescript
// For Malaria
eCodes = ["MAL_EXEC_HOSPITAL_E_1", "MAL_EXEC_HOSPITAL_E_2", ..., "MAL_EXEC_HOSPITAL_E_11"]
eCodes.find(c => c.includes('_E_16')) // Returns undefined ❌
```

#### Solution
Use name-based matching instead of hardcoded numbers:

```typescript
// Find Other Payables code by name (works for all programs)
let otherPayablesCode = eCodes.find(c => {
  const activity = Object.values(hierarchicalData?.E?.items || []).find((item: any) => item.code === c);
  return activity?.name?.toLowerCase().includes('other payable');
});
```

---

### Issue 2.2: Consumable vs Office Supplies

#### Current Code (expense-to-payable-mapping.ts, line 197-201)
```typescript
case 'B-04': // Overheads
  if (expenseNameLower.includes('communication')) {
    payableCode = findPayableByPattern(payablesByName, ['communication']);
  } else if (expenseNameLower.includes('maintenance')) {
    payableCode = findPayableByPattern(payablesByName, ['maintenance']);
  } else if (expenseNameLower.includes('fuel')) {
    payableCode = findPayableByPattern(payablesByName, ['fuel']);
  } else if (expenseNameLower.includes('supplies')) {  // ❌ MATCHES FIRST
    payableCode = findPayableByPattern(payablesByName, ['supplies']);
  } else if (expenseNameLower.includes('consumable')) {  // ❌ NEVER REACHED
    payableCode = findPayableByPattern(payablesByName, ['consumable']);
  }
```

**Problem**: 
- Expense name: "Consumable (supplies, stationaries, & human landing)"
- Contains "supplies" → matches first condition
- Maps to "Payable 8: Office supplies" instead of "Payable 10: Consumable"

#### Solution
Check for "consumable" **before** "supplies":

```typescript
case 'B-04': // Overheads
  if (expenseNameLower.includes('communication')) {
    payableCode = findPayableByPattern(payablesByName, ['communication']);
  } else if (expenseNameLower.includes('maintenance')) {
    payableCode = findPayableByPattern(payablesByName, ['maintenance']);
  } else if (expenseNameLower.includes('fuel')) {
    payableCode = findPayableByPattern(payablesByName, ['fuel']);
  } else if (expenseNameLower.includes('consumable')) {  // ✅ CHECK FIRST
    payableCode = findPayableByPattern(payablesByName, ['consumable']);
  } else if (expenseNameLower.includes('supplies')) {  // ✅ CHECK AFTER
    payableCode = findPayableByPattern(payablesByName, ['supplies']);
  } else if (expenseNameLower.includes('car') && expenseNameLower.includes('hiring')) {
    payableCode = findPayableByPattern(payablesByName, ['car', 'hiring']);
  }
```

---

## ✅ Fixes to Apply

### Fix 2.1: Other Payables Mapping

**File**: `apps/client/hooks/use-execution-form.ts`  
**Line**: ~950

**Replace**:
```typescript
// Find Payable 16 code - first try formData, then hierarchical data
let otherPayablesCode = eCodes.find(c => c.includes('_E_16'));

// If not in formData, search in hierarchical data (for computed activities)
if (!otherPayablesCode && activitiesQuery.data) {
  const hierarchicalData = activitiesQuery.data as any;
  const sectionE = hierarchicalData?.E;
  if (sectionE?.items) {
    // Try multiple matching strategies for robustness
    const found = sectionE.items.find((item: any) => 
      item.code?.includes('_E_16') || 
      item.code?.endsWith('_E_16') ||
      item.name?.toLowerCase().includes('payable 16') ||
      (item.name?.toLowerCase().includes('other payable') && item.displayOrder === 16)
    );
    if (found) {
      otherPayablesCode = found.code;
```

**With**:
```typescript
// Find Other Payables code by name (works for all programs: HIV E_16, Malaria E_11, TB E_9)
let otherPayablesCode: string | undefined;

// First try to find in formData
const hierarchicalData = activitiesQuery.data as any;
const sectionE = hierarchicalData?.E;

if (sectionE?.items) {
  // Find by name pattern (most reliable across programs)
  const found = sectionE.items.find((item: any) => 
    item.name?.toLowerCase().includes('other payable')
  );
  
  if (found) {
    otherPayablesCode = found.code;
    console.log('🔍 [X->D/E Calculation] Found Other Payables:', {
      code: otherPayablesCode,
      name: found.name,
      displayOrder: found.displayOrder
    });
    
    // Initialize in formData if not present (critical for computed activities)
    if (!(otherPayablesCode in formData)) {
```

### Fix 2.2: Consumable Pattern Matching

**File**: `apps/client/features/execution/utils/expense-to-payable-mapping.ts`  
**Line**: ~197

**Replace**:
```typescript
        case 'B-04': // Overheads
          if (expenseNameLower.includes('communication')) {
            payableCode = findPayableByPattern(payablesByName, ['communication']);
          } else if (expenseNameLower.includes('maintenance')) {
            payableCode = findPayableByPattern(payablesByName, ['maintenance']);
          } else if (expenseNameLower.includes('fuel')) {
            payableCode = findPayableByPattern(payablesByName, ['fuel']);
          } else if (expenseNameLower.includes('supplies')) {
            payableCode = findPayableByPattern(payablesByName, ['supplies']);
          } else if (expenseNameLower.includes('car') && expenseNameLower.includes('hiring')) {
            payableCode = findPayableByPattern(payablesByName, ['car', 'hiring']);
          } else if (expenseNameLower.includes('consumable')) {
            payableCode = findPayableByPattern(payablesByName, ['consumable']);
```

**With**:
```typescript
        case 'B-04': // Overheads
          if (expenseNameLower.includes('communication')) {
            payableCode = findPayableByPattern(payablesByName, ['communication']);
          } else if (expenseNameLower.includes('maintenance')) {
            payableCode = findPayableByPattern(payablesByName, ['maintenance']);
          } else if (expenseNameLower.includes('fuel')) {
            payableCode = findPayableByPattern(payablesByName, ['fuel']);
          } else if (expenseNameLower.includes('consumable')) {
            // Check for consumable BEFORE supplies (consumable name contains "supplies")
            payableCode = findPayableByPattern(payablesByName, ['consumable']);
          } else if (expenseNameLower.includes('supplies')) {
            // Check for supplies AFTER consumable to avoid false matches
            payableCode = findPayableByPattern(payablesByName, ['supplies']);
          } else if (expenseNameLower.includes('car') && expenseNameLower.includes('hiring')) {
            payableCode = findPayableByPattern(payablesByName, ['car', 'hiring']);
```

---

## 🧪 Testing Instructions

### Test 2.1: Other Payables
1. Navigate to Malaria execution form
2. Enter: X. Other Payables = 1500
3. Verify:
   - Cash at Bank increases by 1500 ✅
   - Payable 11: Other payables = 1500 ✅
4. Check console for: `✅ [X->D/E Calculation] Updating Payable 11 to: 1500`

### Test 2.2: Consumable Mapping
1. Navigate to Malaria execution form
2. Enter: Office supplies = 1000 (unpaid)
3. Verify: Payable 8: Office supplies = 1180 ✅
4. Enter: Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
5. Verify: Payable 10: Consumable = 1180 ✅
6. Check console for: `✅ [DB-Driven] Consumable → MAL_EXEC_HOSPITAL_E_10`

---

## 📊 Expected Results After Fix

### Malaria
```
Input:  X. Other Payables = 1500
Output: Cash at Bank = +1500 ✅
        Payable 11: Other payables = 1500 ✅

Input:  Office supplies = 1000 (unpaid)
Output: Payable 8: Office supplies = 1180 ✅

Input:  Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
Output: Payable 10: Consumable = 1180 ✅
```

### HIV (Backward Compatibility)
```
Input:  X. Other Payables = 1500
Output: Cash at Bank = +1500 ✅
        Payable 16: Other payables = 1500 ✅

Input:  Office supplies = 1000 (unpaid)
Output: Payable 15: Office supplies = 1180 ✅
```

### TB
```
Input:  X. Other Payables = 1500
Output: Cash at Bank = +1500 ✅
        Payable 9: Other payables = 1500 ✅

Input:  Office supplies = 1000 (unpaid)
Output: Payable 7: Office supplies = 1180 ✅
```

---

## 🚨 Why Database-Driven Approach Helps

**Note**: These issues only occur when the database-driven mapping fails and the system falls back to pattern matching. The proper fix is to ensure the database has correct mappings:

1. **Other Payables**: Should be marked as computed/special in seeder
2. **Consumable**: Should have correct `payableActivityId` in metadata

However, the pattern matching fallback should still be fixed for robustness.

---

**Status**: ✅ ISSUES IDENTIFIED  
**Next Action**: Apply fixes to both files  
**Estimated Time**: 10 minutes  
**Risk**: Low (improves fallback logic, doesn't affect database-driven approach)
