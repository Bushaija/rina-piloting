# Budget Validation Debug Script

## Run This in Browser Console

Copy and paste this script into your browser console while on the execution form page to diagnose the budget validation issue:

```javascript
// Budget Validation Diagnostic Script
console.log('🔍 Starting Budget Validation Diagnostic...\n');

// 1. Check URL parameters
const url = new URL(window.location.href);
const params = {
  projectId: url.searchParams.get('projectId'),
  facilityId: url.searchParams.get('facilityId'),
  facilityName: url.searchParams.get('facilityName'),
  facilityType: url.searchParams.get('facilityType'),
  reportingPeriodId: url.searchParams.get('reportingPeriodId'),
  quarter: url.searchParams.get('quarter'),
  program: url.searchParams.get('program')
};

console.log('📋 URL Parameters:', params);

// 2. Check localStorage for planning data cache
const planningCacheKey = `planning-summary-${params.projectId}-${params.facilityId}-${params.reportingPeriodId}`;
console.log('\n💾 Checking localStorage for cached planning data...');
console.log('Cache key:', planningCacheKey);

// 3. Check React Query cache (if available)
if (window.__REACT_QUERY_DEVTOOLS_CACHE__) {
  console.log('\n🔄 React Query Cache Available');
  const queryCache = window.__REACT_QUERY_DEVTOOLS_CACHE__;
  console.log('Query Cache:', queryCache);
}

// 4. Check for planning data in network requests
console.log('\n🌐 Check Network Tab for:');
console.log(`   GET /planning/summary?projectId=${params.projectId}&facilityId=${params.facilityId}&reportingPeriodId=${params.reportingPeriodId}`);

// 5. Calculate expected budget from form
console.log('\n💰 To manually check budget:');
console.log('1. Open Network tab');
console.log('2. Find /planning/summary request');
console.log('3. Check response.data array');
console.log('4. For each item, check quarterlyTotals');
console.log(`5. Sum all ${params.quarter?.toLowerCase()}_total values`);

// 6. Calculate current expenditures
console.log('\n💸 To check current expenditures:');
console.log('1. Look at all Section B (Expenditure) fields');
console.log('2. Sum all values for current quarter');
console.log('3. Compare with planned budget');

// 7. Provide diagnostic commands
console.log('\n🛠️ Diagnostic Commands:');
console.log('Run these in console to get more info:\n');

console.log('// Get planning data from API:');
console.log(`fetch('/api/planning/summary?projectId=${params.projectId}&facilityId=${params.facilityId}&reportingPeriodId=${params.reportingPeriodId}')
  .then(r => r.json())
  .then(data => {
    console.log('Planning Data:', data);
    const quarter = '${params.quarter?.toLowerCase()}';
    let total = 0;
    data.data?.forEach(item => {
      if (item.quarterlyTotals) {
        const qTotal = item.quarterlyTotals[\`\${quarter}_total\`] || 0;
        console.log('Item:', item.id, 'Quarter Total:', qTotal);
        total += qTotal;
      }
    });
    console.log('Total Planned Budget for ${params.quarter}:', total);
  });
`);

console.log('\n✅ Diagnostic script complete. Check output above.');
console.log('📊 Next steps:');
console.log('1. Review URL parameters');
console.log('2. Check Network tab for /planning/summary request');
console.log('3. Run the fetch command above to see planning data');
console.log('4. Compare planned budget with entered expenditures');
```

## Expected Output

### Good Output (Planning Data Exists)
```
🔍 Starting Budget Validation Diagnostic...

📋 URL Parameters: {
  projectId: "1",
  facilityId: "338",
  facilityName: "nyarugenge",
  facilityType: "hospital",
  reportingPeriodId: "2",
  quarter: "Q1",
  program: "HIV"
}

🌐 Check Network Tab for:
   GET /planning/summary?projectId=1&facilityId=338&reportingPeriodId=2

Planning Data: {
  data: [
    {
      id: 123,
      quarterlyTotals: {
        q1_total: 9200,
        q2_total: 0,
        q3_total: 0,
        q4_total: 0,
        annual_total: 9200
      }
    }
  ]
}

Total Planned Budget for Q1: 9200
```

### Bad Output (No Planning Data)
```
Planning Data: {
  data: []
}

Total Planned Budget for Q1: 0
```

## Manual Verification Steps

### Step 1: Check Planning Module
1. Navigate to Planning module
2. Filter by:
   - Program: HIV
   - Facility: Nyarugenge Hospital
   - Period: 2025-26
3. Check if planning form exists and is completed

### Step 2: Check Database Directly
If you have database access, run:

```sql
-- Check if planning data exists
SELECT 
  id,
  project_id,
  facility_id,
  reporting_period_id,
  entity_type,
  computed_values->'totals' as totals,
  created_at,
  updated_at
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1  -- HIV
  AND facility_id = 338  -- Nyarugenge
  AND reporting_period_id = 2;  -- 2025-26

-- Check quarterly breakdown
SELECT 
  id,
  computed_values->'totals'->>'q1_total' as q1_total,
  computed_values->'totals'->>'q2_total' as q2_total,
  computed_values->'totals'->>'q3_total' as q3_total,
  computed_values->'totals'->>'q4_total' as q4_total,
  computed_values->'totals'->>'annual_total' as annual_total
FROM schema_form_data_entries
WHERE entity_type = 'planning'
  AND project_id = 1
  AND facility_id = 338
  AND reporting_period_id = 2;
```

### Step 3: Verify Expenditure Calculation
In the execution form, check Section B (Expenditures):

```javascript
// Run in console to calculate total expenditures
let totalExpenses = 0;
const formData = {}; // Get from React state

Object.entries(formData).forEach(([code, data]) => {
  if (code.includes('_B_')) {  // Section B
    const q1Value = Number(data.q1) || 0;
    console.log(code, ':', q1Value);
    totalExpenses += q1Value;
  }
});

console.log('Total Expenditures:', totalExpenses);
```

## Common Issues and Fixes

### Issue: Planning Data Not Found
**Fix**: Complete planning form first
```
1. Go to Planning module
2. Create/complete planning for HIV, Nyarugenge Hospital, 2025-26
3. Save and submit
4. Return to execution form
```

### Issue: Wrong Quarter
**Fix**: Check quarter parameter
```
1. Verify URL has correct quarter parameter
2. Check planning data has values for that quarter
3. Ensure you're executing the right quarter
```

### Issue: Partial Planning Data
**Fix**: Complete all budget line items
```
1. Review planning form
2. Fill in all required fields
3. Ensure quarterly breakdown is complete
4. Save changes
```

### Issue: Budget Too Low
**Fix**: Request budget revision
```
1. Review actual needs
2. Update planning form with revised budget
3. Get necessary approvals
4. Resubmit planning
```

## Quick Resolution

If you need to proceed immediately:

### Option 1: Adjust Expenditures
Reduce entered amounts to stay within 9,200.00 budget

### Option 2: Update Planning
Increase planned budget to accommodate 20,000.00 expenditures

### Option 3: Split Across Quarters
Distribute expenditures across multiple quarters if appropriate

## Support

If issue persists after running diagnostics:
1. Share console output
2. Share network request/response
3. Share database query results
4. Provide screenshots of planning form
5. Confirm facility/program/period details
