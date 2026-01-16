# Execution Form Auto-Save - Quick Reference

## Draft ID Format
```
exec_{projectId}_{facilityId}_{facilityType}_{program}_{reportingPeriodId}_{quarter}
```

## Key Features

### 1. Unique Draft per Facility/Program/Quarter
Each combination gets its own draft:
- ✅ Facility A + HIV + Q4 → Separate draft
- ✅ Facility A + TB + Q4 → Separate draft
- ✅ Facility B + HIV + Q4 → Separate draft

### 2. Auto-Clear on Submit
Draft is automatically removed from localStorage after successful submission.

### 3. Manual Clear Button
User can manually clear draft with confirmation dialog.

## Code Locations

### Draft ID Generation
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`
```typescript
const draftId = useMemo(() => {
  const facilityId = facilityIdProp || Number(searchParams?.get("facilityId") || 0) || 0;
  const reportingPeriodId = reportingPeriodIdProp || searchParams?.get("reportingPeriodId") || currentReportingPeriod?.id || "";
  const facType = (searchParams?.get("facilityType") as any) || facilityType;
  const program = programNameProp || searchParams?.get("program") || projectType;
  const projectIdValue = projectIdProp || Number(searchParams?.get("projectId") || 0) || 0;
  
  const raw = `exec_${projectIdValue}_${facilityId}_${facType}_${program}_${reportingPeriodId}_${quarter}`;
  const id = raw.replace(/\s+/g, '_').toLowerCase();
  
  return id;
}, [...]);
```

### Draft Clearing on Submit
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`
```typescript
// After successful submission
console.log('[Draft] Clearing draft after successful submission:', draftId);
removeTemporary(draftId);
```

### Clear Draft Function
**File**: `apps/client/features/execution/components/v2/enhanced-execution-form.tsx`
```typescript
const clearDraft = useCallback(() => {
  try {
    console.log('[Draft] Clearing draft with id:', draftId);
    removeTemporary(draftId);
    
    toast.success("Draft cleared successfully", {
      description: "Your saved draft has been removed from local storage.",
      duration: 3000,
    });
    
    // Reload page to reset form state
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 500);
  } catch (err) {
    console.error("[Draft] clearDraft:error", err);
    toast.error("Failed to clear draft", {
      description: "An error occurred while clearing your draft.",
      duration: 4000,
    });
  }
}, [removeTemporary, draftId]);
```

### generateSaveId Function
**File**: `apps/client/features/execution/stores/temp-save-store.ts`
```typescript
export const generateSaveId = (metadata: TempSaveMetadata): string => {
  const parts = [
    'exec',
    metadata.projectId || 'noproject',
    metadata.programName,
    metadata.facilityType,
    metadata.facilityId,
    metadata.facilityName,
    metadata.reportingPeriod,
    metadata.quarter || 'all',
    metadata.mode
  ];
  
  return parts
    .map(part => String(part).replace(/\s+/g, '_'))
    .join('_')
    .toLowerCase();
}
```

## Usage in FormActions

```typescript
<FormActions
  module="execution"
  onSaveDraft={saveDraft}
  onClearDraft={clearDraft}
  hasDraft={hasDraft}
  onSubmit={handleSubmit}
  // ... other props
/>
```

## localStorage Structure

```javascript
// Key format
"execution-form-temp-saves"

// Value structure
{
  saves: {
    "exec_1_338_hospital_hiv_1_q4": {
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
  },
  autoSaveEnabled: true,
  autoSaveInterval: 60000
}
```

## Debug Console Logs

### Draft ID Generation
```
[Draft] Generated draftId: exec_1_338_hospital_hiv_1_q4
{ projectId: 1, facilityId: 338, facilityType: 'hospital', program: 'HIV', reportingPeriodId: 1, quarter: 'Q4' }
```

### Draft Save
```
[Draft] Saving draft with id: exec_1_338_hospital_hiv_1_q4 formValues keys: 150
[TempSaveStore] Saving: { id: 'exec_1_338_hospital_hiv_1_q4', formValuesKeys: 150 }
[TempSaveStore] Save size: 45678 bytes
[TempSaveStore] Save successful for id: exec_1_338_hospital_hiv_1_q4
```

### Draft Restore
```
[Draft] Restore effect running: { draftId: 'exec_1_338_hospital_hiv_1_q4', ... }
[TempSaveStore] Restoring: exec_1_338_hospital_hiv_1_q4
[TempSaveStore] Found save: { id: 'exec_1_338_hospital_hiv_1_q4', formValuesKeys: 150, lastSaved: '2026-01-15T10:30:45.000Z' }
```

### Draft Clear on Submit
```
[Draft] Clearing draft after successful submission: exec_1_338_hospital_hiv_1_q4
```

### Manual Draft Clear
```
[Draft] Clearing draft with id: exec_1_338_hospital_hiv_1_q4
```

## Common Issues & Solutions

### Issue: Draft not saving
**Check**:
1. Is `draftMeta.facilityId` set?
2. Is `draftMeta.reportingPeriod` set?
3. Check console for warnings: `[Draft] saveDraft: draftId not stable yet, skipping save`

### Issue: Draft not restoring
**Check**:
1. Are activities loaded? `hasActivities` should be true
2. Is draftId stable? Check console logs
3. Is it edit mode with initialData? (Restore is skipped in this case)

### Issue: Multiple facilities overwriting each other
**Solution**: This should be fixed with the new draft ID format that includes all key identifiers

### Issue: Draft persists after submission
**Check**:
1. Is submission successful?
2. Check console for: `[Draft] Clearing draft after successful submission`
3. Check if `removeTemporary(draftId)` is being called

## Testing Commands

### Check localStorage
```javascript
// In browser console
localStorage.getItem('execution-form-temp-saves')
```

### Clear all drafts
```javascript
// In browser console
localStorage.removeItem('execution-form-temp-saves')
```

### Inspect specific draft
```javascript
// In browser console
const saves = JSON.parse(localStorage.getItem('execution-form-temp-saves') || '{}');
console.log(saves.saves);
```

## Related Files

1. `apps/client/features/execution/components/v2/enhanced-execution-form.tsx` - Main form component
2. `apps/client/features/execution/stores/temp-save-store.ts` - Zustand store for drafts
3. `apps/client/features/shared/form-actions.tsx` - Form actions UI component
4. `apps/client/lib/planning/storage.ts` - Legacy storage utilities (not used for execution)

## Migration Notes

### From Old Format to New Format
Old drafts with format `exec_{facilityId}_{reportingPeriodId}_{facilityType}_{quarter}` will not be automatically migrated. Users will need to re-enter data or manually clear old drafts.

### Backward Compatibility
The `generateSaveId` function uses `metadata.projectId || 'noproject'` as a fallback, ensuring the function doesn't break if projectId is missing.
