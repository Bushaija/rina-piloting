# Quick Fix Card - Budget Validation Error

## 🚨 The Problem
Expenditures (20,000) > Planned Budget (9,200) for HIV, Nyarugenge Hospital, Q4

## 🔍 Quick Diagnosis (30 seconds)

### Run This SQL Query:
```sql
SELECT 
    COUNT(*) as entries,
    SUM(CAST(computed_values->'totals'->>'q4_total' AS NUMERIC)) as q4_budget
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND facility_id = 338
  AND reporting_period_id = 2;
```

## 📊 Results & Actions

### Result: entries = 0
**Problem**: No planning data exists
**Fix**: Create planning form
```
1. Go to Planning module
2. Create: HIV, Nyarugenge Hospital, 2025-26
3. Fill all budget items
4. Save & submit
```

### Result: q4_budget = 9200
**Problem**: Budget too low
**Fix Option A**: Increase budget
```
1. Go to Planning module
2. Edit existing form
3. Increase Q4 values
4. Save changes
```
**Fix Option B**: Reduce expenses
```
1. Stay in Execution form
2. Lower Section B amounts
3. Stay within 9,200
```

### Result: q4_budget = 0 or NULL
**Problem**: Q4 not filled
**Fix**: Fill Q4 column
```
1. Go to Planning module
2. Edit form
3. Fill Q4 column
4. Save changes
```

### Result: q4_budget >= 20000
**Problem**: Frontend issue
**Fix**: Clear cache
```
1. Clear browser cache
2. Refresh page
3. Check console for errors
```

## 📁 Files Created

| File | Purpose | Time |
|------|---------|------|
| QUICK_BUDGET_CHECK.sql | Fast SQL diagnostic | 2 min |
| BUDGET_INVESTIGATION_SQL.sql | Detailed SQL analysis | 10 min |
| SQL_INVESTIGATION_GUIDE.md | Step-by-step guide | - |
| BUDGET_DEBUG_SCRIPT.md | Browser console script | 5 min |
| INVESTIGATION_SUMMARY.md | Complete overview | - |
| QUICK_FIX_CARD.md | This card | 30 sec |

## 🎯 Most Likely Fix

**90% chance**: Planning form incomplete or missing

**Action**:
1. Open Planning module
2. Search: HIV + Nyarugenge + 2025-26
3. Check if form exists
4. If yes: Edit and increase Q4 budget
5. If no: Create new planning form

## ⚡ Emergency Bypass (Not Recommended)

If you absolutely must proceed without fixing planning:
1. This is a financial control - bypassing is not advised
2. Contact system administrator
3. Requires code change to disable validation
4. May violate financial policies

## 📞 Need Help?

Run SQL query → Share results → Get specific fix

**Context**:
- Facility: Nyarugenge Hospital (338)
- Program: HIV (1)
- Period: 2025-26 (2)
- Quarter: Q4
- Budget Found: 9,200
- Needed: 20,000
- Gap: 10,800
