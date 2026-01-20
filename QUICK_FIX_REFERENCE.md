# Quick Reference: Malaria & TB Execution Fix

## What Was Fixed?
Malaria and TB execution forms now have proper double-entry accounting like HIV, with expenses automatically linked to payables and VAT receivables.

## Quick Test

### 1. Run Seeder
```bash
cd apps/server
pnpm db:seed:execution
```

### 2. Look for Success Messages
```
✅ All 10 expenses have payable mappings (Malaria)
✅ All 8 expenses have payable mappings (TB)
✅ Payable mappings established
```

### 3. Quick SQL Check
```sql
-- Should return 0 rows (all expenses mapped)
SELECT name, metadata->>'payableName' as expected_payable
FROM dynamic_activities
WHERE module_type = 'execution'
  AND activity_type = 'EXPENSE'
  AND is_total_row = false
  AND payable_activity_id IS NULL
  AND metadata->>'payableName' IS NOT NULL;
```

## Key Differences by Program

| Feature | HIV | Malaria | TB |
|---------|-----|---------|-----|
| **Expenses** | 15 | 10 | 8 |
| **VAT Categories** | 4 | 6 | 4 |
| **Payables** | 16 | 11 | 9 |
| **Unique VAT Items** | - | Car Hiring, Consumables | - |

## Malaria-Specific VAT Items
1. **Car Hiring** (18% VAT)
   - Expense: "Car Hiring on entomological surveillance"
   - Payable: "Payable 9: Car Hiring"
   - Receivable: "VAT Receivable 5: Car hiring"

2. **Consumables** (18% VAT)
   - Expense: "Consumable (supplies, stationaries, & human landing)"
   - Payable: "Payable 10: Consumable"
   - Receivable: "VAT Receivable 6: Consumables"

## Common Issues & Solutions

### Issue: "No matching payable found"
**Solution:** Check that payable names in expense metadata match exactly with payable activity names.

### Issue: "VAT receivable not found"
**Solution:** Verify `vatCategory` is set in expense metadata and matches receivable's `vatCategory`.

### Issue: "Balance sheet doesn't balance"
**Solution:** Ensure all VAT-applicable expenses have corresponding receivables created.

## Testing Checklist

- [ ] Seeder runs without errors
- [ ] Console shows all expenses mapped
- [ ] SQL verification returns 0 unmapped expenses
- [ ] Malaria has 6 VAT receivables
- [ ] TB has 4 VAT receivables
- [ ] UI test: Enter expense, verify payable created
- [ ] UI test: VAT receivable calculated correctly
- [ ] UI test: Balance sheet balances

## Files Changed
1. `apps/server/src/db/seeds/modules/execution-categories-activities.ts`
2. `apps/server/src/db/seeds/modules/update-payable-mappings.ts`

## Rollback
```bash
git checkout HEAD~1 apps/server/src/db/seeds/modules/execution-categories-activities.ts
git checkout HEAD~1 apps/server/src/db/seeds/modules/update-payable-mappings.ts
pnpm db:seed:execution
```

## Need Help?
1. Check `EXECUTION_FIX_SUMMARY.md` for detailed explanation
2. Run `TEST_MALARIA_TB_EXECUTION.sql` for comprehensive verification
3. Review console output from seeder for specific errors
