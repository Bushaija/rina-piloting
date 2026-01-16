# Execution Form Auto-Save Visual Guide

## Draft ID Structure

### Before Enhancement
```
exec_{facilityId}_{reportingPeriodId}_{facilityType}_{quarter}
```
**Problem**: Different programs for the same facility would overwrite each other's drafts

### After Enhancement
```
exec_{projectId}_{facilityId}_{facilityType}_{program}_{reportingPeriodId}_{quarter}
```
**Solution**: Each unique combination has its own draft

## Example URL
```
http://localhost:2222/rina/dashboard/execution/new?projectId=HIV&facilityId=338&facilityType=hospital&facilityName=nyarugenge&program=1&reportingPeriodId=1&quarter=Q4
```

### Extracted Parameters
- `projectId`: HIV (or 1)
- `facilityId`: 338
- `facilityType`: hospital
- `facilityName`: nyarugenge
- `program`: 1 (HIV)
- `reportingPeriodId`: 1
- `quarter`: Q4

### Generated Draft ID
```
exec_1_338_hospital_1_1_q4
```

## Draft Lifecycle

### 1. Form Entry
```
User opens form
    ↓
Draft ID generated from URL params
    ↓
Check localStorage for existing draft
    ↓
If found: Restore draft data
If not found: Start with clean form
```

### 2. Auto-Save
```
User enters data
    ↓
Form data changes detected
    ↓
Auto-save triggered (every 60 seconds)
    ↓
Data saved to localStorage with draft ID
    ↓
"Auto-saved [time]" message displayed
```

### 3. Manual Save
```
User clicks "Save Draft" button
    ↓
Draft saved immediately
    ↓
"Draft saved" toast notification
```

### 4. Submission
```
User clicks "Submit Execution"
    ↓
Form validation passes
    ↓
Data submitted to server
    ↓
✅ Submission successful
    ↓
Draft automatically cleared from localStorage
    ↓
Redirect to execution list
```

### 5. Manual Clear
```
User clicks "Clear Draft" button
    ↓
Confirmation dialog appears
    ↓
User confirms
    ↓
Draft removed from localStorage
    ↓
Page reloads with clean form
```

## UI Components

### Form Actions Bar (Bottom of Form)
```
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Valid  |  ✓ Auto-saved 10:30:45 AM                            │
│                                                                   │
│  [Cancel]  [Clear Draft]  [Save Draft]  [Submit Execution]      │
└─────────────────────────────────────────────────────────────────┘
```

### Clear Draft Confirmation Dialog
```
┌─────────────────────────────────────────────────────────────────┐
│  Clear Draft?                                                     │
│                                                                   │
│  This will permanently delete your saved draft from local         │
│  storage. This action cannot be undone.                          │
│                                                                   │
│  ⚠️ Warning: You have unsaved changes that will also be lost.    │
│                                                                   │
│                                    [Cancel]  [Clear Draft]       │
└─────────────────────────────────────────────────────────────────┘
```

## Multiple Drafts Example

### Scenario: User working on multiple facilities

```
localStorage:
├── exec_1_338_hospital_hiv_1_q4
│   └── Facility: Nyarugenge Hospital, HIV, Q4
│
├── exec_1_339_health_center_hiv_1_q4
│   └── Facility: Kicukiro Health Center, HIV, Q4
│
├── exec_2_338_hospital_tb_1_q1
│   └── Facility: Nyarugenge Hospital, TB, Q1
│
└── exec_3_340_hospital_mal_1_q2
    └── Facility: Gasabo Hospital, MAL, Q2
```

**Key Points**:
- Each draft is independent
- No conflicts between facilities
- No conflicts between programs
- No conflicts between quarters
- User can switch between forms without losing data

## Draft Metadata Structure

```typescript
{
  id: "exec_1_338_hospital_hiv_1_q4",
  formData: [...],
  formValues: {...},
  expandedRows: [...],
  metadata: {
    projectId: 1,
    facilityId: 338,
    facilityName: "nyarugenge",
    reportingPeriod: "1",
    programName: "HIV",
    fiscalYear: "",
    mode: "create",
    facilityType: "hospital",
    quarter: "Q4"
  },
  timestamps: {
    created: "2026-01-15T10:00:00.000Z",
    lastSaved: "2026-01-15T10:30:45.000Z",
    lastAccessed: "2026-01-15T10:30:45.000Z"
  },
  version: "1.0.0"
}
```

## Benefits Summary

### ✅ Proper Differentiation
- Each facility's execution is uniquely identified
- No draft conflicts between different facilities
- No draft conflicts between different programs
- No draft conflicts between different quarters

### ✅ Automatic Cleanup
- Drafts cleared immediately after successful submission
- No stale drafts lingering in localStorage
- Clean state for next execution entry

### ✅ User Control
- Manual "Clear Draft" button for user-initiated cleanup
- Confirmation dialog prevents accidental deletion
- Warning message if unsaved changes exist

### ✅ Better UX
- Auto-save every 60 seconds
- Visual feedback with timestamps
- Seamless draft restoration on page reload
- Multiple concurrent drafts supported

## Testing Scenarios

### Test 1: Basic Draft Save/Restore
1. Open form for Facility A, Q4, HIV
2. Enter some data
3. Wait for auto-save or click "Save Draft"
4. Refresh page
5. ✅ Data should be restored

### Test 2: Multiple Facilities
1. Open form for Facility A, Q4, HIV → Enter data
2. Open form for Facility B, Q4, HIV → Enter data
3. Go back to Facility A, Q4, HIV
4. ✅ Facility A's data should be intact
5. Go back to Facility B, Q4, HIV
6. ✅ Facility B's data should be intact

### Test 3: Multiple Programs
1. Open form for Facility A, Q4, HIV → Enter data
2. Open form for Facility A, Q4, TB → Enter data
3. Go back to Facility A, Q4, HIV
4. ✅ HIV data should be intact
5. Go back to Facility A, Q4, TB
6. ✅ TB data should be intact

### Test 4: Draft Clear on Submit
1. Open form for Facility A, Q4, HIV
2. Enter data → Auto-saved
3. Submit form successfully
4. Check localStorage
5. ✅ Draft should be cleared

### Test 5: Manual Draft Clear
1. Open form with existing draft
2. Click "Clear Draft" button
3. Confirm in dialog
4. ✅ Draft should be cleared
5. ✅ Page should reload with clean form

### Test 6: URL Parameters
1. Open form with URL: `?projectId=HIV&facilityId=338&facilityType=hospital&facilityName=nyarugenge&program=1&reportingPeriodId=1&quarter=Q4`
2. Check console for draft ID
3. ✅ Should be: `exec_1_338_hospital_1_1_q4` (or similar based on actual projectId value)
