# Fixes Applied: Other Payables & Consumable Issues

## ✅ Issues Fixed

### Issue 2.1: Other Payables (Section X → Section E) ✅ FIXED
**Problem**: Other Payables in Section E not updating when user enters value in Section X.

**Root Cause**: Hardcoded `_E_16` (HIV payable number) instead of dynamic lookup.

**Solution**: Changed to name-based matching that works for all programs.

### Issue 2.2: Consumable Mapping ✅ FIXED
**Problem**: "Consumable (supplies, stationaries, & human landing)" mapping to "Payable 8: Office supplies" instead of "Payable 10: Consumable".

**Root Cause**: Pattern matching checked "supplies" before "consumable", causing false match.

**Solution**: Reordered pattern matching to check "consumable" before "supplies".

---

## 🔧 Changes Made

### Change 2.1: Other Payables Dynamic Lookup

**File**: `apps/client/hooks/use-execution-form.ts`  
**Lines**: ~940-980

**Before**:
```typescript
// Find Payable 16 code - first try formData, then hierarchical data
let otherPayablesCode = eCodes.find(c => c.includes('_E_16'));  // ❌ Hardcoded HIV number
```

**After**:
```typescript
// Find Other Payables code by name (works for all programs: HIV E_16, Malaria E_11, TB E_9)
let otherPayablesCode: string | undefined;

// Search in hierarchical data for Other Payables activity
if (activitiesQuery.data) {
  const hierarchicalData = activitiesQuery.data as any;
  const sectionE = hierarchicalData?.E;
  if (sectionE?.items) {
    // Find by name pattern (most reliable across programs)
    const found = sectionE.items.find((item: any) => 
      item.name?.toLowerCase().includes('other payable')  // ✅ Name-based matching
    );
```

**Why It Works**:
- HIV: Finds "Payable 16: Other payables" → `HIV_EXEC_HOSPITAL_E_16` ✅
- Malaria: Finds "Payable 11: Other payables" → `MAL_EXEC_HOSPITAL_E_11` ✅
- TB: Finds "Payable 9: Other payables" → `TB_EXEC_HOSPITAL_E_9` ✅

---

### Change 2.2: Consumable Pattern Priority

**File**: `apps/client/features/execution/utils/expense-to-payable-mapping.ts`  
**Lines**: ~197-210

**Before**:
```typescript
} else if (expenseNameLower.includes('supplies')) {  // ❌ Matches first
  payableCode = findPayableByPattern(payablesByName, ['supplies']);
} else if (expenseNameLower.includes('consumable')) {  // ❌ Never reached
  payableCode = findPayableByPattern(payablesByName, ['consumable']);
}
```

**After**:
```typescript
} else if (expenseNameLower.includes('consumable')) {  // ✅ Check first
  // Check for consumable BEFORE supplies (consumable name contains "supplies")
  payableCode = findPayableByPattern(payablesByName, ['consumable']);
} else if (expenseNameLower.includes('supplies')) {  // ✅ Check after
  // Check for supplies AFTER consumable to avoid false matches
  payableCode = findPayableByPattern(payablesByName, ['supplies']);
}
```

**Why It Works**:
- "Office supplies" → matches "supplies" → Payable 8 ✅
- "Consumable (supplies, stationaries, & human landing)" → matches "consumable" first → Payable 10 ✅

---

## 🧪 Testing Instructions

### Test 2.1: Other Payables

1. **Navigate to Malaria execution form**
2. **Enter**: X. Other Payables = 1500
3. **Verify**:
   - Cash at Bank increases by 1500 ✅
   - Payable 11: Other payables = 1500 ✅
4. **Check console**:
   ```
   🔍 [X->D/E Calculation] Found Other Payables: {
     code: "MAL_EXEC_HOSPITAL_E_11",
     name: "Payable 11: Other payables",
     displayOrder: 11
   }
   ✅ [X->D/E Calculation] Updating Other Payables to: 1500
   ```

### Test 2.2: Consumable Mapping

1. **Navigate to Malaria execution form**
2. **Test Office Supplies**:
   - Enter: Office supplies = 1000 (unpaid)
   - Verify: Payable 8: Office supplies = 1180 ✅
3. **Test Consumable**:
   - Enter: Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
   - Verify: Payable 10: Consumable = 1180 ✅
4. **Check console**:
   ```
   ✅ [DB-Driven] Office supplies → MAL_EXEC_HOSPITAL_E_8
   ✅ [DB-Driven] Consumable (supplies, stationaries, & human landing) → MAL_EXEC_HOSPITAL_E_10
   ```

---

## 📊 Expected Results

### Malaria
```
✅ X. Other Payables = 1500
   → Cash at Bank = +1500
   → Payable 11: Other payables = 1500

✅ Office supplies = 1000 (unpaid)
   → Payable 8: Office supplies = 1180

✅ Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
   → Payable 10: Consumable = 1180
```

### HIV (Backward Compatibility)
```
✅ X. Other Payables = 1500
   → Cash at Bank = +1500
   → Payable 16: Other payables = 1500

✅ Office supplies = 1000 (unpaid)
   → Payable 15: Office supplies = 1180
```

### TB
```
✅ X. Other Payables = 1500
   → Cash at Bank = +1500
   → Payable 9: Other payables = 1500

✅ Office supplies = 1000 (unpaid)
   → Payable 7: Office supplies = 1180
```

---

## 🔍 Why These Fixes Work

### Fix 2.1: Name-Based Matching
- **Program-Agnostic**: Works for any program without hardcoded numbers
- **Reliable**: Uses activity name which is consistent across programs
- **Maintainable**: Adding new programs doesn't require code changes

### Fix 2.2: Pattern Priority
- **Specific First**: Checks more specific patterns before generic ones
- **Prevents False Matches**: "Consumable (supplies...)" won't match "supplies" first
- **Backward Compatible**: Doesn't affect existing mappings

---

## 🚨 Troubleshooting

### Issue: Other Payables still not updating

**Check**:
1. Open browser console
2. Look for: `🔍 [X->D/E Calculation] Found Other Payables`
3. If not found, check if Section E has "Other payables" activity

**Solution**:
- Verify seeder created "Other payables" activity
- Check activity name matches pattern (case-insensitive)

### Issue: Consumable still mapping to Office supplies

**Check**:
1. Open browser console
2. Look for mapping logs
3. Check if database-driven mapping is working

**Solution**:
- If database mapping exists, it should work (Priority 1)
- If falling back to pattern matching, verify expense name contains "consumable"
- Clear browser cache and restart dev server

---

## 📝 Summary

Both issues were caused by hardcoded program-specific logic:

1. **Other Payables**: Hardcoded `_E_16` only worked for HIV
2. **Consumable**: Pattern matching order caused false matches

The fixes make the code program-agnostic and more robust:

1. **Other Payables**: Name-based matching works for all programs
2. **Consumable**: Correct pattern priority prevents false matches

Both fixes are backward compatible and don't affect the database-driven approach (Priority 1).

---

**Status**: ✅ FIXES APPLIED  
**Test**: ⏳ PENDING USER VERIFICATION  
**Files Modified**: 2
- `apps/client/hooks/use-execution-form.ts`
- `apps/client/features/execution/utils/expense-to-payable-mapping.ts`

**Risk**: Low (improves fallback logic, maintains backward compatibility)
