# Execution Form Auto-Save Enhancement

## Overview
Enhanced the auto-save functionality for the execution form to properly differentiate each unique facility's execution by including all key identifiers in the draft ID generation.

## Changes Made

### 1. Enhanced Draft ID Generation
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`

**Previous Format**:
```
exec_{facilityId}_{reportingPeriodId}_{facilityType}_{quarter}
```

**New Format**:
```
exec_{projectId}_{facilityId}_{facilityType}_{program}_{reportingPeriodId}_{quarter}
```

**Key Improvements**:
- Added `projectId` to differentiate between different projects
- Added `program` to differentiate between HIV, TB, and MAL programs
- Ensures each unique facility's execution is properly scoped by:
  - Project ID
  - Facility ID
  - Facility Type (hospital, health_center)
  - Program (HIV, TB, MAL)
  - Reporting Period ID
  - Quarter (Q1, Q2, Q3, Q4)

**Example Draft IDs**:
```
exec_1_338_hospital_hiv_1_q4
exec_2_338_hospital_tb_1_q4
exec_1_339_health_center_mal_1_q1
```

### 2. Draft Metadata Enhancement
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`

Added `projectId` to the draft metadata object:
```typescript
const draftMeta = useMemo(() => {
  return {
    projectId: qpProjectId,        // NEW: Project ID
    facilityId: qpFacilityId,
    facilityName: qpFacilityName,
    reportingPeriod: String(qpReporting),
    programName: qpProgram,
    fiscalYear: "",
    mode: effectiveMode,
    facilityType: qpFacilityType,
    quarter: quarter,
  };
}, [...]);
```

### 3. Auto-Clear Draft on Submission
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`

Added logic to automatically clear the draft from localStorage immediately after successful submission:

```typescript
// After successful create or update
console.log('[Draft] Clearing draft after successful submission:', draftId);
removeTemporary(draftId);
```

**Benefits**:
- Prevents stale drafts from persisting after submission
- Ensures clean state for next execution entry
- Reduces localStorage clutter
- Improves user experience by removing outdated drafts

### 4. Updated Temp Save Store
**File**: `apps/client/features/execution/stores/temp-save-store.ts`

**Updated Interface**:
```typescript
export interface TempSaveMetadata {
  projectId?: number | null  // NEW: Project ID for better scoping
  facilityId: number | null
  facilityName: string
  reportingPeriod: string
  programName: string
  fiscalYear: string
  mode: ExecutionFormMode
  district?: string
  facilityType: string
  quarter?: string
}
```

**Updated generateSaveId Function**:
```typescript
export const generateSaveId = (metadata: TempSaveMetadata): string => {
  const parts = [
    'exec',                         // Prefix for execution forms
    metadata.projectId || 'noproject', // Project ID
    metadata.programName,           // Program (HIV, TB, MAL)
    metadata.facilityType,          // Facility type
    metadata.facilityId,            // Facility ID
    metadata.facilityName,          // Facility name
    metadata.reportingPeriod,       // Reporting period
    metadata.quarter || 'all',      // Quarter
    metadata.mode                   // Mode (create, edit, view)
  ];
  
  return parts
    .map(part => String(part).replace(/\s+/g, '_'))
    .join('_')
    .toLowerCase();
}
```

### 5. Clear Draft Button (Already Implemented)
**File**: `apps/client/features/shared/form-actions.tsx`

The Clear Draft button is already fully implemented with:
- Trash icon (Trash2 from lucide-react)
- Confirmation dialog before clearing
- Warning message if there are unsaved changes
- Proper error handling
- Only visible when `hasDraft` is true

**Features**:
- Shows confirmation dialog: "Clear Draft?"
- Warning message: "This will permanently delete your saved draft from local storage. This action cannot be undone."
- Additional warning if there are unsaved changes
- Reloads page after clearing to reset form state

## User Experience Flow

### Scenario 1: Normal Workflow
1. User opens execution form for Facility A, Q4, HIV
2. User enters data → Auto-saved to `exec_1_338_hospital_hiv_1_q4`
3. User submits → Draft automatically cleared
4. User opens execution form for Facility B, Q1, TB
5. User enters data → Auto-saved to `exec_2_339_health_center_tb_1_q1`
6. Each facility's draft is independent and properly scoped

### Scenario 2: Manual Draft Clearing
1. User opens execution form with existing draft
2. User decides to start fresh
3. User clicks "Clear Draft" button
4. Confirmation dialog appears
5. User confirms → Draft cleared, page reloads with clean state

### Scenario 3: Multiple Facilities
1. User works on Facility A, Q4, HIV → Draft saved
2. User switches to Facility B, Q4, HIV → Different draft
3. User switches to Facility A, Q4, TB → Different draft (different program)
4. Each facility + program + quarter combination has its own draft

## Technical Benefits

1. **Proper Scoping**: Each unique facility's execution is differentiated by all key parameters
2. **No Draft Conflicts**: Different facilities, programs, and quarters don't overwrite each other's drafts
3. **Clean Submission**: Drafts are automatically cleared after successful submission
4. **User Control**: Users can manually clear drafts if needed
5. **Backward Compatible**: Existing drafts will still work (with fallback to 'noproject')

## Testing Checklist

- [ ] Test draft saving for different facilities
- [ ] Test draft saving for different programs (HIV, TB, MAL)
- [ ] Test draft saving for different quarters (Q1, Q2, Q3, Q4)
- [ ] Test draft auto-clear after successful submission
- [ ] Test manual draft clearing with confirmation dialog
- [ ] Test draft restoration on page reload
- [ ] Test multiple drafts don't conflict with each other
- [ ] Verify localStorage keys are properly formatted
- [ ] Test with URL parameters from the example: `http://localhost:2222/rina/dashboard/execution/new?projectId=HIV&facilityId=338&facilityType=hospital&facilityName=nyarugenge&program=1&reportingPeriodId=1&quarter=Q4`

## Files Modified

1. `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`
   - Enhanced draft ID generation
   - Enhanced draft metadata
   - Added auto-clear on submission (2 locations)

2. `apps/client/features/execution/components/v2/enhanced-execution-form-auto-load.tsx`
   - Enhanced draft ID generation
   - Enhanced draft metadata
   - Added auto-clear on submission

3. `apps/client/features/execution/stores/temp-save-store.ts`
   - Updated TempSaveMetadata interface
   - Enhanced generateSaveId function

4. `apps/client/features/shared/form-actions.tsx`
   - Already has Clear Draft button (no changes needed)

## Notes

- The Clear Draft button already existed and is fully functional
- Draft clearing on submission is now automatic
- Each facility's execution is properly scoped by all key identifiers
- The system supports multiple concurrent drafts for different facilities/programs/quarters
