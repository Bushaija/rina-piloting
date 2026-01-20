# VAT Clearance Button Fix - Car Hiring & Consumables

## 🎯 Issue

The "Clear VAT" button was not appearing for VAT Receivable 5 (Car hiring) and VAT Receivable 6 (Consumables), even though it appeared for the other VAT receivables.

## 🔍 Root Cause

The `findExpenseCodeForVATCategory()` function in `table.tsx` had a hardcoded `namePatterns` object that only included HIV's 4 VAT categories. Without finding the expense code, the Clear VAT button wouldn't render.

### The Bug (Line 115-119)

```typescript
const namePatterns: Record<VATApplicableCategory, string[]> = {
  'communication_all': ['communication - all', 'communication-all', 'communication all'],
  'maintenance': ['maintenance'],
  'fuel': ['fuel'],
  'office_supplies': ['office supplies', 'supplies'],
  // ❌ Missing car_hiring and consumables
};
```

**Result**: 
- `findExpenseCodeForVATCategory('car_hiring', ...)` → returns `null`
- `findExpenseCodeForVATCategory('consumables', ...)` → returns `null`
- Without expense code, Clear VAT button doesn't render

## ✅ Fix Applied

```typescript
const namePatterns: Record<VATApplicableCategory, string[]> = {
  'communication_all': ['communication - all', 'communication-all', 'communication all'],
  'maintenance': ['maintenance'],
  'fuel': ['fuel'],
  'office_supplies': ['office supplies', 'supplies'],
  'car_hiring': ['car hiring', 'car-hiring', 'entomological'],  // ✅ ADDED
  'consumables': ['consumable'],                                  // ✅ ADDED
};
```

**Why these patterns**:
- `car_hiring`: Matches "Car Hiring on entomological surviellance"
- `consumables`: Matches "Consumable (supplies, stationaries, & human landing)"

## 📊 Expected Results

### Before (Broken)
```
✅ VAT Receivable 4: Office supplies = 180
   → "Clear VAT" button appears ✅

❌ VAT Receivable 5: Car hiring = 180
   → "Clear VAT" button missing ❌

❌ VAT Receivable 6: Consumables = 180
   → "Clear VAT" button missing ❌
```

### After (Fixed)
```
✅ VAT Receivable 4: Office supplies = 180
   → "Clear VAT" button appears ✅

✅ VAT Receivable 5: Car hiring = 180
   → "Clear VAT" button appears ✅

✅ VAT Receivable 6: Consumables = 180
   → "Clear VAT" button appears ✅
```

## 🧪 Testing

1. **Navigate**: Malaria execution form → Q1 2024
2. **Enter**:
   - Car Hiring = 1000 (unpaid)
   - Consumable = 1000 (unpaid)
3. **Verify**:
   - VAT Receivable 5: Car hiring = 180
   - VAT Receivable 6: Consumables = 180
4. **Check**: Both should have "Clear VAT" button
5. **Test Clearance**:
   - Click "Clear VAT" on Car hiring
   - Enter amount: 100
   - Verify: VAT Receivable 5 = 80 (180 - 100)
6. **Test Rollover**:
   - Save Q1
   - Create Q2
   - Verify: Q2 opens with Car hiring VAT = 80 (rolled over)

## 🔄 VAT Receivable System Requirements

### ✅ Clearable
- VAT receivables can be cleared when RRA refunds the VAT
- Clear VAT button appears for all VAT receivable categories
- Cleared amount reduces the receivable balance

### ✅ Rolls Over
- VAT receivables are balance sheet items (point-in-time)
- Closing balance of Q(n) = Opening balance of Q(n+1)
- Formula: Closing = Opening + Incurred - Cleared

### Example Flow
```
Q1:
  Opening: 0
  Incurred: 180 (from Car Hiring expense)
  Cleared: 0
  Closing: 180

Q2:
  Opening: 180 (rolled over from Q1)
  Incurred: 0
  Cleared: 100 (RRA refund received)
  Closing: 80

Q3:
  Opening: 80 (rolled over from Q2)
  Incurred: 90 (new Car Hiring expense)
  Cleared: 0
  Closing: 170
```

## 📝 Summary

This was the **11th location** where VAT categories needed to be updated:

1-10. Previous fixes (constants, detection, mapping, calculation)
11. ✅ `table.tsx` - `findExpenseCodeForVATCategory()` name patterns

**All VAT category references now updated!**

---

**Status**: ✅ FIXED  
**File Modified**: `apps/client/features/execution/components/v2/table.tsx`  
**Lines Changed**: 2  
**Risk**: Low (adds new patterns, doesn't affect existing)
