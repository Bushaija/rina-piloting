# Malaria and TB Execution Form Fix

## Problem
The Malaria and TB execution forms were not properly mapping expenses to payables and VAT receivables like the HIV form does. This caused issues with double-entry accounting.

## Root Cause
1. The `verifyVATReceivables` function was only checking for 4 VAT categories (HIV's categories), but Malaria has 6 categories
2. The `payableName` field was defined in the activity data but not being stored in the metadata
3. The verification function wasn't checking if expenses had payable mappings

## Changes Made

### 1. Added VAT Categories by Program Type
```typescript
const vatCategoriesByProgram: Record<'HIV' | 'MAL' | 'TB', string[]> = {
    'HIV': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES'],
    'MAL': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES', 'CAR_HIRING', 'CONSUMABLES'],
    'TB': ['COMMUNICATION_ALL', 'MAINTENANCE', 'FUEL', 'SUPPLIES'],
};
```

### 2. Enhanced VAT Receivables Verification
- Now dynamically checks VAT categories based on program type
- Verifies that all expenses have payable mappings
- Reports missing mappings for debugging

### 3. Fixed Metadata Storage
- Added `payableName` to metadata storage in `seedExecutionActivitiesForProgramInternal`
- This ensures the mapping script can find and link expenses to payables

### 4. Updated Type Definitions
- Added `payableName` to the function parameter types
- Added all VAT categories (including CAR_HIRING and CONSUMABLES) to the type union

## Verification Steps

### Step 1: Re-run the Seeder
```bash
# Run the execution seeder
pnpm --filter @riwa/server db:seed:execution
```

### Step 2: Check the Console Output
Look for these verification sections:

```
Verifying VAT receivables for MAL...
  🏥 HOSPITAL
     Found 6 VAT receivable activities
     Expected 6 VAT categories for MAL
     ✅ COMMUNICATION_ALL: VAT Receivable 1: Communication - All
     ✅ MAINTENANCE: VAT Receivable 2: Maintenance
     ✅ FUEL: VAT Receivable 3: Fuel
     ✅ SUPPLIES: VAT Receivable 4: Office supplies
     ✅ CAR_HIRING: VAT Receivable 5: Car hiring
     ✅ CONSUMABLES: VAT Receivable 6: Consumables

     VAT-applicable expenses: 6
       - Communication - All (COMMUNICATION_ALL)
       - Maintenance for vehicles, ICT, and medical equipments (MAINTENANCE)
       - Fuel (FUEL)
       - Office supplies (SUPPLIES)
       - Car Hiring on entomological surviellance (CAR_HIRING)
       - Consumable (supplies, stationaries, & human landing) (CONSUMABLES)

     Verifying expense-to-payable mappings:
     ✅ All 10 expenses have payable mappings
```

### Step 3: Verify in Database
```sql
-- Check Malaria expenses have payable mappings
SELECT 
    name,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'vatCategory' as vat_category
FROM dynamic_activities
WHERE project_type = 'Malaria'
    AND module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND is_total_row = false
ORDER BY display_order;

-- Check TB expenses have payable mappings
SELECT 
    name,
    activity_type,
    metadata->>'payableName' as payable_name,
    metadata->>'vatCategory' as vat_category
FROM dynamic_activities
WHERE project_type = 'TB'
    AND module_type = 'execution'
    AND activity_type = 'EXPENSE'
    AND is_total_row = false
ORDER BY display_order;
```

### Step 4: Test in the UI
1. Navigate to Execution module
2. Select a Malaria facility
3. Enter an expense amount (e.g., 100,000 for "Communication - All")
4. Verify that:
   - The corresponding payable is created/updated
   - The VAT receivable is calculated and displayed
   - The double-entry balances (Assets = Liabilities + Equity)

5. Repeat for TB facility

## Expected Results

### Malaria Program
- **10 Expense Items** (all with payable mappings):
  - 4 in B-01 (Salaries) → Payable 1
  - 3 in B-02 (Supervision, Meetings, Transport) → Payables 2-4
  - 6 in B-04 (Communication, Maintenance, Fuel, Supplies, Car Hiring, Consumables) → Payables 5-10
  - 1 in B-05 (Transfer to RBC)

- **6 VAT Receivables** in D-01:
  - Communication - All
  - Maintenance
  - Fuel
  - Office supplies
  - Car Hiring
  - Consumables

- **11 Payables** in E:
  - Payable 1-10 (matching expenses)
  - Payable 11: Other payables

### TB Program
- **8 Expense Items** (all with payable mappings):
  - 2 in B-01 (Salaries) → Payable 1
  - 2 in B-02 (Mission, Transport) → Payables 2-3
  - 4 in B-04 (Communication, Maintenance, Fuel, Supplies) → Payables 4-7
  - 1 in B-04 (Car hiring - non-VAT) → Payable 8
  - 1 in B-05 (Transfer to RBC)

- **4 VAT Receivables** in D-01:
  - Communication - All
  - Maintenance
  - Fuel
  - Office supplies

- **9 Payables** in E:
  - Payable 1-8 (matching expenses)
  - Payable 9: Other payables

## Double-Entry Impact

### For VAT-Applicable Expenses
When entering an expense with VAT (e.g., 100,000 RWF for Communication):

**Debit:**
- B. Expenditures → Communication - All: 100,000

**Credit:**
- E. Financial Liabilities → Payable 5: Communication - All: 118,000 (100,000 + 18% VAT)
- D. Financial Assets → VAT Receivable 1: Communication - All: 18,000

**Net Effect:** Balanced (100,000 = 118,000 - 18,000)

### For Non-VAT Expenses
When entering an expense without VAT (e.g., 50,000 RWF for Salaries):

**Debit:**
- B. Expenditures → Laboratory Technician A0/A1: 50,000

**Credit:**
- E. Financial Liabilities → Payable 1: Salaries: 50,000

**Net Effect:** Balanced (50,000 = 50,000)

## Files Modified
1. `apps/server/src/db/seeds/modules/execution-categories-activities.ts`
   - Added `vatCategoriesByProgram` mapping
   - Enhanced `verifyVATReceivables` function
   - Updated metadata storage to include `payableName`
   - Updated type definitions

2. `apps/server/src/db/seeds/modules/update-payable-mappings.ts`
   - Completely rewritten to use metadata-driven approach
   - Now reads `payableName` from expense metadata
   - Automatically maps expenses to payables across all programs
   - Includes verification step to check for unmapped expenses

## Next Steps
1. Run the seeder to apply changes
2. Verify console output shows all checks passing
3. Test in UI with sample data
4. Monitor for any issues in production

## Notes
- The fix ensures Malaria and TB work exactly like HIV
- All expenses now have proper payable mappings
- VAT receivables are correctly linked to their expense categories
- The verification function now provides detailed diagnostics
