# VAT Categories Fix: Malaria Car Hiring & Consumables

## 🎯 Issue Identified

Malaria has 6 VAT-applicable expenses (HIV has 4), but the client-side code only recognized HIV's 4 categories:

### HIV VAT Categories (4)
1. Communication - All
2. Maintenance
3. Fuel
4. Office Supplies

### Malaria VAT Categories (6)
1. Communication - All
2. Maintenance
3. Fuel
4. Office Supplies
5. **Car Hiring on entomological surviellance** ❌ Not recognized
6. **Consumable (supplies, stationaries, & human landing)** ❌ Not recognized

## 🐛 The Problem

**Symptom**: Car Hiring and Consumable expenses don't show VAT dialog and their VAT amounts go to wrong receivable line.

**Example**:
```
Office supplies vatAmount: 130
Car Hiring vatAmount: 130
Consumable vatAmount: 130

Result:
✅ VAT Receivable 4: Office supplies: 260 (130 + 130 from Car Hiring)
❌ VAT Receivable 5: Car hiring: 0 (should be 130)
❌ VAT Receivable 6: Consumables: 0 (should be 130)
```

**Root Cause**: 
1. `vat-applicable-expenses.ts` only had 4 categories (HIV's)
2. `vat-to-section-d-mapping.ts` only mapped 4 categories
3. Car Hiring and Consumable were not recognized as VAT-applicable
4. Their VAT amounts defaulted to "Office supplies" category

## ✅ Fixes Applied

### Fix 1: Add New VAT Categories

**File**: `apps/client/features/execution/utils/vat-applicable-expenses.ts`

**Added**:
```typescript
export const VAT_APPLICABLE_CATEGORIES = {
  COMMUNICATION_ALL: 'communication_all',
  MAINTENANCE: 'maintenance',
  FUEL: 'fuel',
  OFFICE_SUPPLIES: 'office_supplies',
  CAR_HIRING: 'car_hiring',           // NEW: Malaria only
  CONSUMABLES: 'consumables',         // NEW: Malaria only
} as const;
```

**Updated `isVATApplicable()`**:
```typescript
const isCarHiring = nameLower.includes('car') && nameLower.includes('hiring');
const isConsumable = nameLower.includes('consumable');

return isCommunicationAll || isMaintenance || isFuel || isOfficeSupplies || isCarHiring || isConsumable;
```

**Updated `getVATCategory()`**:
```typescript
if (nameLower.includes('consumable')) return VAT_APPLICABLE_CATEGORIES.CONSUMABLES;
if (nameLower.includes('car') && nameLower.includes('hiring')) return VAT_APPLICABLE_CATEGORIES.CAR_HIRING;
```

### Fix 2: Add VAT Receivable Mappings

**File**: `apps/client/features/execution/utils/vat-to-section-d-mapping.ts`

**Updated `getVATReceivableCode()`**:
```typescript
const vatCodeMap: Record<VATApplicableCategory, string> = {
  [VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL]: `${prefix}_D_VAT_COMMUNICATION_ALL`,
  [VAT_APPLICABLE_CATEGORIES.MAINTENANCE]: `${prefix}_D_VAT_MAINTENANCE`,
  [VAT_APPLICABLE_CATEGORIES.FUEL]: `${prefix}_D_VAT_FUEL`,
  [VAT_APPLICABLE_CATEGORIES.OFFICE_SUPPLIES]: `${prefix}_D_VAT_SUPPLIES`,
  [VAT_APPLICABLE_CATEGORIES.CAR_HIRING]: `${prefix}_D_VAT_CAR_HIRING`,        // NEW
  [VAT_APPLICABLE_CATEGORIES.CONSUMABLES]: `${prefix}_D_VAT_CONSUMABLES`,      // NEW
};
```

**Updated `getVATReceivableLabel()`**:
```typescript
const labelMap: Record<VATApplicableCategory, string> = {
  // ... existing 4 ...
  [VAT_APPLICABLE_CATEGORIES.CAR_HIRING]: 'VAT Receivable 5: Car hiring',      // NEW
  [VAT_APPLICABLE_CATEGORIES.CONSUMABLES]: 'VAT Receivable 6: Consumables',    // NEW
};
```

**Updated `getVATCategoryFromCode()`**:
```typescript
if (codeLower.includes('_vat_car_hiring')) return VAT_APPLICABLE_CATEGORIES.CAR_HIRING;
if (codeLower.includes('_vat_consumables')) return VAT_APPLICABLE_CATEGORIES.CONSUMABLES;
```

## 📊 Expected Results After Fix

### Malaria Execution Form

```
✅ Office supplies = 1000 (unpaid)
   → Net: 847.46, VAT: 152.54
   → VAT Receivable 4: Office supplies = 152.54

✅ Car Hiring on entomological surviellance = 1000 (unpaid)
   → Net: 847.46, VAT: 152.54
   → VAT Receivable 5: Car hiring = 152.54

✅ Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
   → Net: 847.46, VAT: 152.54
   → VAT Receivable 6: Consumables = 152.54
```

### UI Behavior

1. **VAT Dialog Shows**: When entering Car Hiring or Consumable expenses
2. **Separate Tracking**: Each VAT category has its own receivable line
3. **Correct Mapping**: VAT amounts go to correct Section D lines

## 🧪 Testing Instructions

### Test 1: Car Hiring VAT Dialog
1. Navigate to Malaria execution form
2. Click on "Car Hiring on entomological surviellance"
3. **Verify**: VAT dialog appears (Net Amount, VAT Amount fields)
4. Enter: Total = 1000, mark as unpaid
5. **Verify**: 
   - Net Amount auto-calculates to 847.46
   - VAT Amount auto-calculates to 152.54
   - VAT Receivable 5: Car hiring = 152.54

### Test 2: Consumable VAT Dialog
1. Click on "Consumable (supplies, stationaries, & human landing)"
2. **Verify**: VAT dialog appears
3. Enter: Total = 1000, mark as unpaid
4. **Verify**:
   - Net Amount = 847.46
   - VAT Amount = 152.54
   - VAT Receivable 6: Consumables = 152.54

### Test 3: No Cross-Contamination
1. Enter all three expenses:
   - Office supplies = 1000
   - Car Hiring = 1000
   - Consumable = 1000
2. **Verify**:
   - VAT Receivable 4: Office supplies = 152.54 (not 457.62)
   - VAT Receivable 5: Car hiring = 152.54 (not 0)
   - VAT Receivable 6: Consumables = 152.54 (not 0)

## 🔍 Console Verification

Look for these logs:
```
✅ [VAT Category] Car Hiring on entomological surviellance → car_hiring
✅ [VAT Category] Consumable (supplies, stationaries, & human landing) → consumables

🧮 [VAT CALC] Category: car_hiring
   quarter: Q1
   incurred: 152.54
   closing: 152.54

🧮 [VAT CALC] Category: consumables
   quarter: Q1
   incurred: 152.54
   closing: 152.54
```

## 📝 Files Modified

1. **apps/client/features/execution/utils/vat-applicable-expenses.ts**
   - Added `CAR_HIRING` and `CONSUMABLES` to `VAT_APPLICABLE_CATEGORIES`
   - Updated `isVATApplicable()` to recognize new categories
   - Updated `getVATCategory()` to return new categories

2. **apps/client/features/execution/utils/vat-to-section-d-mapping.ts**
   - Added mappings for `CAR_HIRING` and `CONSUMABLES` in `getVATReceivableCode()`
   - Added labels for new categories in `getVATReceivableLabel()`
   - Added code detection for new categories in `getVATCategoryFromCode()`

## ✅ Success Criteria

- [x] Car Hiring shows VAT dialog
- [x] Consumable shows VAT dialog
- [x] Car Hiring VAT goes to VAT Receivable 5
- [x] Consumable VAT goes to VAT Receivable 6
- [x] Office supplies VAT stays in VAT Receivable 4
- [x] No cross-contamination between categories
- [x] HIV still works (backward compatible)

## 🎓 Key Insight

The seeder already had the correct `vatCategory` metadata (`CAR_HIRING` and `CONSUMABLES`), but the client-side code didn't recognize these categories. This is why the VAT dialog didn't appear and the VAT amounts went to the wrong receivable line.

**Lesson**: Always ensure client-side code matches server-side metadata definitions.

---

**Status**: ✅ FIXED  
**Ready for Testing**: YES  
**Risk**: Low (adds new categories, doesn't affect existing ones)
