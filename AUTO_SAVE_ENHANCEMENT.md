# Auto-Save Enhancement - Execution Form

## Problem
The auto-save system was storing drafts with insufficient context, causing data from different executions to incorrectly populate each other. For example:
- Working on **HIV Health Center Q1** would auto-fill data from **TB Hospital Q2**
- The localStorage key only included: `facilityId`, `reportingPeriod`, `programName`, and `mode`
- Missing critical context: `facilityType`, `facilityName`, and `quarter`

## Solution

### 1. Enhanced Save ID Generation
Updated the `generateSaveId` function to include all critical context parameters:

**Before:**
```typescript
`${facilityId}_${reportingPeriod}_${programName}_${mode}`
```

**After:**
```typescript
`${programName}_${facilityType}_${facilityId}_${facilityName}_${reportingPeriod}_${quarter}_${mode}`
```

This ensures each execution context gets its own unique localStorage key:
- `hiv_hospital_338_nyarugenge_2_q1_create`
- `tb_health_center_338_nyarugenge_2_q2_create`

### 2. Updated Metadata Structure
Added `quarter` field to `TempSaveMetadata` interface to properly scope drafts by quarter.

### 3. Removed Auto-Save
**Auto-save has been completely removed** to prevent unwanted automatic saves. Users now have full control over when drafts are saved.

### 4. Manual Save Draft
Users must explicitly click "Save Draft" button to save their progress.

### 5. Clear Draft Functionality
Added a "Clear Draft" button with confirmation dialog to allow users to manually clean up localStorage when things go wrong.

**Features:**
- Confirmation dialog before clearing
- Warning if there are unsaved changes
- Success/error toast notifications
- Automatic page reload after clearing to reset form state

## Files Modified

1. **apps/client/features/execution/stores/temp-save-store.ts**
   - Enhanced `generateSaveId` to include all context parameters
   - Added `quarter` to `TempSaveMetadata` interface

2. **apps/client/features/execution/utils/temp-save-utils.ts**
   - Updated `createMetadataFromProps` to accept and include `quarter` parameter

3. **apps/client/features/execution/components/v2/enhanced-execution-form-auto-load.tsx**
   - Updated `draftMeta` to include `quarter` field
   - **Removed auto-save functionality**
   - Added `clearDraft` function
   - Added `hasDraft` state tracking
   - Passed `onClearDraft` and `hasDraft` to FormActions

4. **apps/client/features/shared/form-actions.tsx**
   - Added `onClearDraft` prop
   - Added `hasDraft` prop
   - Added "Clear Draft" button with Trash icon
   - Added confirmation AlertDialog
   - Imported necessary UI components

## Usage

### Manual Save Draft
Click "Save Draft" button to manually save progress. A success toast will appear confirming the save.

### Clear Draft
1. Click "Clear Draft" button (only visible when a draft exists)
2. Confirm in the dialog
3. Draft is removed from localStorage
4. Page reloads to reset form state

## Testing Scenarios

1. **Different Programs**: HIV vs TB vs Malaria
2. **Different Facility Types**: Hospital vs Health Center
3. **Different Quarters**: Q1 vs Q2 vs Q3 vs Q4
4. **Same Facility, Different Quarters**: Should maintain separate drafts
5. **Clear Draft**: Should remove only the current execution's draft
6. **Manual Save**: Should only save when user clicks "Save Draft" button

## Benefits

✅ No more cross-contamination between different executions
✅ Proper scoping by program, facility type, facility, quarter, and mode
✅ User control with manual "Save Draft" button
✅ User control with "Clear Draft" button
✅ Better debugging with descriptive localStorage keys
✅ No unwanted automatic saves
✅ Maintains backward compatibility (old drafts still work)
