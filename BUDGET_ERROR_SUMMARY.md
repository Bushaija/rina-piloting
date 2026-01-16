# Budget Validation Error - Quick Summary

## The Error
```
Form validation failed
Total expenditures (20000.00) exceed the planned budget (9200.00). 
Please adjust your expenses to stay within budget.
```

**Context**: HIV Program, Nyarugenge Hospital, 2025-26

## What This Means

You're trying to enter **20,000.00 RWF** in expenditures, but the system found only **9,200.00 RWF** in the planning/budget for this facility and period.

## Why This Happens

The execution form validates that your actual expenditures don't exceed what was planned/budgeted. This is a financial control to prevent overspending.

## Most Likely Causes

### 1. Incomplete Planning (Most Common)
The planning form for HIV at Nyarugenge Hospital for 2025-26 was not fully completed. Only 9,200 was budgeted instead of the full amount needed.

### 2. Wrong Quarter
The 9,200 budget might be for a different quarter (Q1, Q2, Q3, or Q4) than the one you're executing.

### 3. Missing Planning Data
No planning form was submitted for this facility/program/period, or it wasn't saved correctly.

### 4. Budget Needs Revision
The original budget (9,200) is insufficient for actual needs (20,000).

## Quick Solutions

### Solution 1: Check Planning Form (Recommended)
1. Go to **Planning module**
2. Filter: HIV, Nyarugenge Hospital, 2025-26
3. Check if planning form exists and is complete
4. If incomplete, fill in all budget line items
5. Save and return to execution form

### Solution 2: Adjust Expenditures
If the budget is correct:
1. Review your entered amounts in Section B (Expenditures)
2. Reduce amounts to stay within 9,200 budget
3. Consider if some expenses belong in different quarters

### Solution 3: Request Budget Increase
If you need more than 9,200:
1. Update planning form with revised budget
2. Get necessary approvals
3. Resubmit planning
4. Return to execution

## Debugging Steps

### Step 1: Run Diagnostic Script
Open browser console (F12) and paste the script from `BUDGET_DEBUG_SCRIPT.md`

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Look for `/planning/summary` request
3. Check the response data
4. Verify `quarterlyTotals` values

### Step 3: Verify Planning Data
Navigate to Planning module and confirm:
- Planning form exists for this facility/period
- All budget line items are filled
- Quarterly totals are correct
- Form was saved/submitted

## Expected Values

Based on your error:
- **Planned Budget (from system)**: 9,200.00 RWF
- **Entered Expenditures**: 20,000.00 RWF
- **Difference**: 10,800.00 RWF over budget

## Next Steps

1. **Immediate**: Run the diagnostic script to see what planning data exists
2. **Short-term**: Check and complete planning form if needed
3. **Long-term**: Ensure planning is done before execution

## Files for Reference

- `BUDGET_VALIDATION_ERROR_ANALYSIS.md` - Detailed technical analysis
- `BUDGET_DEBUG_SCRIPT.md` - Browser console diagnostic script
- `BUDGET_ERROR_SUMMARY.md` - This file (quick summary)

## Need Help?

If you've checked planning and the issue persists:
1. Share the diagnostic script output
2. Provide screenshots of planning form
3. Confirm facility ID, program ID, and period ID
4. Check if multiple planning entries exist
