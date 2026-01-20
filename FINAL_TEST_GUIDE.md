# Final Test Guide - Malaria Execution Form

## 🧪 Complete Test in 10 Minutes

### Setup
1. Clear browser cache: **Ctrl+Shift+R**
2. Navigate: **Execution → Malaria hospital → Q1 2024**
3. Open browser console (F12)

---

### Test 1: Basic VAT Expenses (4 tests)

```
✅ Communication - All = 1000 (unpaid)
   Expected: Payable 5 = 1180, VAT Receivable 1 = 180

✅ Maintenance = 500 (unpaid)
   Expected: Payable 6 = 590, VAT Receivable 2 = 90

✅ Fuel = 300 (unpaid)
   Expected: Payable 7 = 354, VAT Receivable 3 = 54

✅ Office supplies = 1000 (unpaid)
   Expected: Payable 8 = 1180, VAT Receivable 4 = 180
```

---

### Test 2: Malaria-Specific VAT Expenses (2 tests)

```
✅ Car Hiring on entomological surviellance = 1000 (unpaid)
   Check: VAT dialog appears ✓
   Expected: Payable 9 = 1180, VAT Receivable 5 = 180

✅ Consumable (supplies, stationaries, & human landing) = 1000 (unpaid)
   Check: VAT dialog appears ✓
   Expected: Payable 10 = 1180, VAT Receivable 6 = 180
```

---

### Test 3: Other Payables (1 test)

```
✅ X. Other Payables = 1500
   Expected: 
   - Cash at Bank = +1500
   - Payable 11: Other payables = 1500
```

---

## ✅ Console Verification

Look for these success messages:

```
🗺️ [Expense-to-Payable Mapping]: { totalMappings: 25 }

✅ [DB-Driven] Communication - All → MAL_EXEC_HOSPITAL_E_5
✅ [DB-Driven] Office supplies → MAL_EXEC_HOSPITAL_E_8
✅ [DB-Driven] Car Hiring → MAL_EXEC_HOSPITAL_E_9
✅ [DB-Driven] Consumable → MAL_EXEC_HOSPITAL_E_10

Payable MAL_EXEC_HOSPITAL_E_11: SKIPPED (calculated from Section X)

✅ [X->D/E Calculation] Found Other Payables: {
  code: "MAL_EXEC_HOSPITAL_E_11"
}
✅ [X->D/E Calculation] Updating Other Payables to: 1500
```

---

## ❌ If Something Fails

1. **Clear cache again**: Ctrl+Shift+R
2. **Check console for errors**
3. **Verify seeder ran**: `cd apps/server && pnpm db:seed:execution`
4. **Restart dev server**: `pnpm dev`

---

## 🎉 All Pass?

If all 7 tests pass, you're done! All issues are resolved.

**Total Time**: ~10 minutes  
**Tests**: 7  
**Expected Result**: All ✅
