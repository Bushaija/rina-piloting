# Malaria Other Receivables Fix - Section X → Section D

## 🐛 Problem

When entering "X. miscellaneous Other receivable" in Malaria program:
- ✅ **Cash at Bank correctly DECREASES** (working)
- ❌ **D. Other Receivables does NOT increase** (broken)

**HIV works fine, but Malaria doesn't!**

## 🔍 Root Cause

The code was looking for Section D activities using `sectionD?.children` structure, but the actual data structure uses `sectionD?.subCategories` and `sectionD?.items`.

### Data Structure Comparison

**HIV (Working):**
```
HIV_EXEC_HOSPITAL_X_1 → Other Receivable (Section X)
HIV_EXEC_HOSPITAL_D_D-01_5 → Other Receivables (Section D, display_order 5)
```

**Malaria (Broken):**
```
MAL_EXEC_HOSPITAL_X_1 → Other Receivable (Section X)
MAL_EXEC_HOSPITAL_D_D-01_7 → Other Receivables (Section D, display_order 7)
```

**Why different display orders?**
- HIV has 4 VAT receivables → Other Receivables is #5
- Malaria has 6 VAT receivables → Other Receivables is #7

### The Bug

The code was searching for "Other Receivables" in Section D using:
```typescript
if (sectionD?.children) {
  // Search through children...
}
```

But `children` array doesn't exist in the raw hierarchical data! It's only created during table building. The actual structure is:
```typescript
{
  D: {
    items: [...],           // Direct items (Cash at bank, etc.)
    subCategories: {
      'D-01': {
        items: [...]        // VAT Receivables + Other Receivables
      }
    }
  }
}
```

## ✅ Solution

Changed all three locations where Section D "Other Receivables" is searched to use the correct structure:

1. **Initialization effect** (line ~915)
2. **X→D/E Calculation effect** (line ~997)
3. **Cash at Bank calculation** (line ~400)

### Before (Broken):
```typescript
if (sectionD?.children) {
  for (const child of sectionD.children) {
    if (child.isSubcategory && child.children) {
      // Search in subcategory children...
    }
  }
}
```

### After (Fixed):
```typescript
// Check direct items first
if (sectionD?.items) {
  const found = sectionD.items.find((item: any) => 
    item.code === c && item.name?.toLowerCase().includes('other receivable')
  );
  if (found) return true;
}

// Check subcategories (D-01 contains VAT receivables and Other Receivables)
if (sectionD?.subCategories) {
  for (const subCat of Object.values(sectionD.subCategories) as any[]) {
    if (subCat.items) {
      const found = subCat.items.find((item: any) => 
        item.code === c && item.name?.toLowerCase().includes('other receivable')
      );
      if (found) return true;
    }
  }
}
```

## 📝 Files Modified

- `apps/client/hooks/use-execution-form.ts` (3 locations)

## 🧪 Testing

### Test Scenario (Malaria Program)
1. Open Malaria Hospital execution Q1
2. Navigate to Section X: Miscellaneous Adjustments
3. Enter **1000** in "Other Receivable" (X_1)
4. Check results:
   - ✅ Cash at Bank should DECREASE by 1000
   - ✅ D. Other Receivables should INCREASE by 1000

### Expected Console Output
```
🔧 [X->D/E Calculation] Found codes: {
  otherReceivableXCode: "MAL_EXEC_HOSPITAL_X_1",
  otherReceivablesCode: "MAL_EXEC_HOSPITAL_D_D-01_7",
  ...
}
🔄 [X->D/E Calculation] Other Receivables calculation: {
  otherReceivableXValue: 1000,
  calculatedValue: 1000,
  ...
}
✅ [X->D/E Calculation] Updating Other Receivables to: 1000
```

### Verify Both Programs
- ✅ **HIV**: Should still work (backward compatibility)
- ✅ **Malaria**: Should now work (fixed)
- ✅ **TB**: Should work (uses same structure)

## 💡 Why This Matters

This is a **double-entry accounting** issue:
- When you give credit (Other Receivable), cash decreases
- But you should also record the receivable asset increase
- Without this, the balance sheet is incorrect!

**Accounting equation:**
```
Assets = Liabilities + Equity
```

If cash decreases but receivables don't increase, assets are understated!

## ✅ Impact

- Fixes Malaria program's Other Receivables calculation
- Maintains HIV program compatibility
- Ensures proper double-entry accounting across all programs
- Corrects balance sheet reporting
