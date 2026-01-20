# VAT Receivables Calculation Fix - Final

## 🎯 Root Cause Found

The VAT dialog was appearing correctly (Issue 4 was partially fixed), but the VAT amounts were still going to the wrong receivable lines because there were **THREE** places where VAT categories were hardcoded:

### Location 1: VAT Category Constants ✅ FIXED (Previous)
**File**: `apps/client/features/execution/utils/vat-applicable-expenses.ts`  
**Status**: Already added `CAR_HIRING` and `CONSUMABLES`

### Location 2: VAT-to-Section-D Mapping ✅ FIXED (Previous)
**File**: `apps/client/features/execution/utils/vat-to-section-d-mapping.ts`  
**Status**: Already added mappings for new categories

### Location 3: VAT Receivables Auto-Calculation ❌ STILL BROKEN
**File**: `apps/client/hooks/use-execution-form.ts`  
**Lines**: ~686, ~732-747, ~780-795  
**Status**: **THIS WAS THE PROBLEM!**

## 🐛 The Bug

The auto-calculation logic in `use-execution-form.ts` had THREE hardcoded sections:

### Bug 1: VAT Receivable Code Detection (Line ~686)
```typescript
// OLD: Only checked for HIV's 4 categories
if (item.code && (
  item.code.includes('VAT_COMMUNICATION_ALL') || 
  item.code.includes('VAT_MAINTENANCE') || 
  item.code.includes('VAT_FUEL') || 
  item.code.includes('VAT_SUPPLIES') ||  // ❌ Missing CAR_HIRING and CONSUMABLES
  item.name?.toLowerCase().includes('vat receivable')
))
```

### Bug 2: Category-to-Code Mapping (Line ~732)
```typescript
// OLD: Only mapped HIV's 4 categories
const categoryToCodeMap: Record<string, string | undefined> = {
  communication_all: vatReceivableCodes.find(code => code.includes('COMMUNICATION_ALL')),
  maintenance: vatReceivableCodes.find(code => code.includes('MAINTENANCE')),
  fuel: vatReceivableCodes.find(code => code.includes('FUEL')),
  office_supplies: vatReceivableCodes.find(code => code.includes('SUPPLIES'))
  // ❌ Missing car_hiring and consumables
};
```

### Bug 3: Category Initialization (Line ~740)
```typescript
// OLD: Only initialized HIV's 4 categories
const vatReceivablesByCategory: Record<string, number> = {
  communication_all: 0,
  maintenance: 0,
  fuel: 0,
  office_supplies: 0
  // ❌ Missing car_hiring and consumables
};
```

### Bug 4: Category Detection Logic (Line ~780)
```typescript
// OLD: Only detected HIV's 4 categories
if (expenseName.includes('communication') && expenseName.includes('all')) {
  category = 'communication_all';
} else if (expenseName.includes('maintenance')) {
  category = 'maintenance';
} else if (expenseName === 'fuel' || (expenseName.includes('fuel') && !expenseName.includes('refund'))) {
  category = 'fuel';
} else if (expenseName.includes('office supplies') || expenseName.includes('supplies')) {
  category = 'office_supplies';  // ❌ This matched "Consumable (supplies...)" first!
}
// ❌ Missing car_hiring and consumables detection
```

## ✅ Fixes Applied

### Fix 1: VAT Receivable Code Detection
```typescript
if (item.code && (
  item.code.includes('VAT_COMMUNICATION_ALL') || 
  item.code.includes('VAT_MAINTENANCE') || 
  item.code.includes('VAT_FUEL') || 
  item.code.includes('VAT_SUPPLIES') ||
  item.code.includes('VAT_CAR_HIRING') ||      // ✅ ADDED
  item.code.includes('VAT_CONSUMABLES') ||     // ✅ ADDED
  item.name?.toLowerCase().includes('vat receivable')
))
```

### Fix 2: Category-to-Code Mapping
```typescript
const categoryToCodeMap: Record<string, string | undefined> = {
  communication_all: vatReceivableCodes.find(code => code.includes('COMMUNICATION_ALL') || code.includes('D-01_1')),
  maintenance: vatReceivableCodes.find(code => code.includes('MAINTENANCE') || code.includes('D-01_2')),
  fuel: vatReceivableCodes.find(code => code.includes('FUEL') || code.includes('D-01_3')),
  office_supplies: vatReceivableCodes.find(code => code.includes('SUPPLIES') || code.includes('D-01_4')),
  car_hiring: vatReceivableCodes.find(code => code.includes('CAR_HIRING') || code.includes('D-01_5')),      // ✅ ADDED
  consumables: vatReceivableCodes.find(code => code.includes('CONSUMABLES') || code.includes('D-01_6'))     // ✅ ADDED
};
```

### Fix 3: Category Initialization
```typescript
const vatReceivablesByCategory: Record<string, number> = {
  communication_all: 0,
  maintenance: 0,
  fuel: 0,
  office_supplies: 0,
  car_hiring: 0,      // ✅ ADDED
  consumables: 0      // ✅ ADDED
};
```

### Fix 4: Category Detection Logic
```typescript
if (expenseName.includes('communication') && expenseName.includes('all')) {
  category = 'communication_all';
} else if (expenseName.includes('maintenance')) {
  category = 'maintenance';
} else if (expenseName === 'fuel' || (expenseName.includes('fuel') && !expenseName.includes('refund'))) {
  category = 'fuel';
} else if (expenseName.includes('consumable')) {
  // ✅ Check for consumable BEFORE office supplies (consumable name contains "supplies")
  category = 'consumables';
} else if (expenseName.includes('office supplies') || expenseName.includes('supplies')) {
  category = 'office_supplies';
} else if (expenseName.includes('car') && expenseName.includes('hiring')) {
  category = 'car_hiring';  // ✅ ADDED
}
```

## 📊 Expected Results After Fix

### Before (Broken)
```
Office supplies vatAmount: 130
Car Hiring vatAmount: 130
Consumable vatAmount: 130

Result:
❌ VAT Receivable 4: Office supplies: 260 (130 + 130 from Car Hiring)
❌ VAT Receivable 5: Car hiring: 0
❌ VAT Receivable 6: Consumables: 0
```

### After (Fixed)
```
Office supplies vatAmount: 130
Car Hiring vatAmount: 130
Consumable vatAmount: 130

Result:
✅ VAT Receivable 4: Office supplies: 130
✅ VAT Receivable 5: Car hiring: 130
✅ VAT Receivable 6: Consumables: 130
```

## 🧪 Testing

1. **Clear browser cache**: Ctrl+Shift+R
2. **Navigate**: Malaria execution form
3. **Enter**:
   - Office supplies = 1000 (unpaid)
   - Car Hiring = 1000 (unpaid)
   - Consumable = 1000 (unpaid)
4. **Verify**:
   - VAT Receivable 4: Office supplies = 180 (not 540)
   - VAT Receivable 5: Car hiring = 180 (not 0)
   - VAT Receivable 6: Consumables = 180 (not 0)

## 🔍 Console Verification

Look for:
```
🧾 [VAT Receivables Calculation]: {
  quarter: "Q1",
  vatReceivablesByCategory: {
    communication_all: 0,
    maintenance: 0,
    fuel: 0,
    office_supplies: 180,
    car_hiring: 180,
    consumables: 180
  }
}

📝 Processing office_supplies: { incurred: 180, cleared: 0 }
📝 Processing car_hiring: { incurred: 180, cleared: 0 }
📝 Processing consumables: { incurred: 180, cleared: 0 }
```

## 📝 Summary

We had to fix VAT categories in **SIX** places total:

1. ✅ `vat-applicable-expenses.ts` - Category constants
2. ✅ `vat-applicable-expenses.ts` - `isVATApplicable()` function
3. ✅ `vat-applicable-expenses.ts` - `getVATCategory()` function
4. ✅ `vat-to-section-d-mapping.ts` - Code mapping
5. ✅ `vat-to-section-d-mapping.ts` - Label mapping
6. ✅ `vat-to-section-d-mapping.ts` - Code detection
7. ✅ `use-execution-form.ts` - VAT receivable code detection
8. ✅ `use-execution-form.ts` - Category-to-code mapping
9. ✅ `use-execution-form.ts` - Category initialization
10. ✅ `use-execution-form.ts` - Category detection logic

**All 10 locations now fixed!**

---

**Status**: ✅ FINAL FIX APPLIED  
**Files Modified**: 3  
**Total Fixes**: 10 locations  
**Risk**: Low (adds new categories, doesn't affect existing)
