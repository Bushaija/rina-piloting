# Execution Form Fix Summary - Malaria & TB Programs

## Overview
Fixed the Malaria and TB execution forms to work exactly like the HIV form, with proper double-entry accounting for expenses, payables, and VAT receivables.

## Key Changes

### 1. VAT Categories Configuration
Added program-specific VAT category definitions:

```typescript
const vatCategoriesByProgram: Record<'HIV' | 'MAL' | 'TB', string[]> = {
    'HIV': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES'],
    'MAL': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES', 'CAR_HIRING', 'CONSUMABLES'],
    'TB': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES'],
};
```

### 2. Enhanced Verification Function
Updated `verifyVATReceivables()` to:
- Dynamically check VAT categories based on program type
- Verify expense-to-payable mappings
- Report missing mappings for debugging
- Check VAT category consistency

### 3. Metadata Storage
Updated `seedExecutionActivitiesForProgramInternal()` to store `payableName` in metadata:

```typescript
metadata: {
    // ... other fields
    ...(activity.vatCategory && { vatCategory: activity.vatCategory }),
    ...(activity.payableName && { payableName: activity.payableName })
}
```

### 4. Payable Mapping Script
Completely rewrote `update-payable-mappings.ts` to:
- Read `payableName` from expense metadata
- Automatically map expenses to payables
- Work across all programs (HIV, Malaria, TB)
- Include verification step

## Program-Specific Details

### Malaria Program

**Expenses (10 items):**
- B-01: 4 salary items → Payable 1: Salaries
- B-02: 3 monitoring items → Payables 2-4
- B-04: 6 overhead items → Payables 5-10
  - 6 with VAT (Communication, Maintenance, Fuel, Supplies, Car Hiring, Consumables)
  - 1 without VAT (Bank charges)
- B-05: 1 transfer item (no payable)

**VAT Receivables (6 items):**
1. Communication - All
2. Maintenance
3. Fuel
4. Office supplies
5. Car Hiring
6. Consumables

**Payables (11 items):**
- Payable 1-10: Matching expenses
- Payable 11: Other payables

### TB Program

**Expenses (8 items):**
- B-01: 2 salary items → Payable 1: Salaries
- B-02: 2 monitoring items → Payables 2-3
- B-04: 6 overhead items → Payables 4-8
  - 4 with VAT (Communication, Maintenance, Fuel, Supplies)
  - 2 without VAT (Car hiring, Bank charges)
- B-05: 1 transfer item (no payable)

**VAT Receivables (4 items):**
1. Communication - All
2. Maintenance
3. Fuel
4. Office supplies

**Payables (9 items):**
- Payable 1-8: Matching expenses
- Payable 9: Other payables

## Double-Entry Accounting

### Example 1: VAT-Applicable Expense (Malaria - Communication)
**User enters:** 100,000 RWF

**System creates:**
```
Debit:  B. Expenditures → Communication - All: 100,000
Credit: E. Liabilities → Payable 5: Communication - All: 118,000
Credit: D. Assets → VAT Receivable 1: Communication - All: -18,000

Net: 100,000 = 118,000 - 18,000 ✅
```

### Example 2: Non-VAT Expense (TB - Salaries)
**User enters:** 50,000 RWF

**System creates:**
```
Debit:  B. Expenditures → TB Coordinator salary: 50,000
Credit: E. Liabilities → Payable 1: Salaries: 50,000

Net: 50,000 = 50,000 ✅
```

### Example 3: Malaria-Specific VAT Expense (Car Hiring)
**User enters:** 200,000 RWF

**System creates:**
```
Debit:  B. Expenditures → Car Hiring on entomological surveillance: 200,000
Credit: E. Liabilities → Payable 9: Car Hiring: 236,000
Credit: D. Assets → VAT Receivable 5: Car hiring: -36,000

Net: 200,000 = 236,000 - 36,000 ✅
```

## Testing Instructions

### Step 1: Run the Seeder
```bash
cd apps/server
pnpm db:seed:execution
```

### Step 2: Check Console Output
Look for these success indicators:
```
✅ COMMUNICATION_ALL: VAT Receivable 1: Communication - All
✅ MAINTENANCE: VAT Receivable 2: Maintenance
✅ FUEL: VAT Receivable 3: Fuel
✅ SUPPLIES: VAT Receivable 4: Office supplies
✅ CAR_HIRING: VAT Receivable 5: Car hiring (Malaria only)
✅ CONSUMABLES: VAT Receivable 6: Consumables (Malaria only)

✅ All X expenses have payable mappings
```

### Step 3: Run SQL Verification
```bash
psql -d your_database -f TEST_MALARIA_TB_EXECUTION.sql
```

Expected results:
- All expenses show "✅ Mapped" status
- VAT receivables match VAT-applicable expenses
- Each payable has linked expenses
- No unmapped expenses (except Bank charges, Transfers)

### Step 4: Test in UI
1. Navigate to Execution module
2. Select a Malaria hospital facility
3. Enter test data:
   - Communication - All: 100,000
   - Car Hiring: 200,000
   - Salaries: 50,000
4. Verify:
   - Payables are created with VAT included
   - VAT receivables are calculated correctly
   - Balance sheet balances (D = E + G)

5. Repeat for TB facility

## Files Modified

1. **apps/server/src/db/seeds/modules/execution-categories-activities.ts**
   - Added `vatCategoriesByProgram` mapping
   - Enhanced `verifyVATReceivables()` function
   - Updated metadata storage to include `payableName`
   - Updated type definitions to include all VAT categories

2. **apps/server/src/db/seeds/modules/update-payable-mappings.ts**
   - Completely rewritten to use metadata-driven approach
   - Reads `payableName` from expense metadata
   - Automatically maps expenses to payables
   - Includes verification step

## Expected Outcomes

### Before Fix
- ❌ Malaria and TB expenses not linked to payables
- ❌ VAT receivables missing for Malaria-specific categories
- ❌ Double-entry accounting broken
- ❌ Balance sheet doesn't balance

### After Fix
- ✅ All expenses properly linked to payables
- ✅ All VAT receivables created for applicable expenses
- ✅ Double-entry accounting works correctly
- ✅ Balance sheet balances perfectly
- ✅ Malaria and TB work exactly like HIV

## Rollback Plan
If issues occur:
1. Restore database from backup
2. Revert changes to the two modified files
3. Re-run the old seeder

## Next Steps
1. ✅ Code changes complete
2. ⏳ Run seeder to apply changes
3. ⏳ Verify with SQL test script
4. ⏳ Test in UI with sample data
5. ⏳ Deploy to staging
6. ⏳ User acceptance testing
7. ⏳ Deploy to production

## Support
If you encounter issues:
1. Check console output for error messages
2. Run the SQL verification script
3. Check the verification section in seeder output
4. Review the double-entry logic in the execution service
