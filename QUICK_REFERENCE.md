# Quick Reference - Auto-Save Enhancement

## What Changed?

### Before
❌ Auto-save used weak keys: `facilityId_reportingPeriod_programName_mode`
❌ Data from HIV Health Center appeared in TB Hospital forms
❌ Auto-save ran every 2 seconds automatically
❌ No way to manually clear corrupted drafts

### After
✅ Enhanced keys: `programName_facilityType_facilityId_facilityName_reportingPeriod_quarter_mode`
✅ Each execution context has its own isolated draft
✅ **Auto-save completely removed** - users have full control
✅ Manual "Save Draft" button for explicit saves
✅ "Clear Draft" button for manual cleanup

## Key Format Examples

```
hiv_hospital_338_nyarugenge_2_q1_create
tb_health_center_338_nyarugenge_2_q2_create
mal_hospital_338_nyarugenge_2_q3_create
```

## User Features

### Save Draft (Manual)
- Click "Save Draft" button
- Shows success toast
- Saves immediately
- **User must explicitly click to save**

### Clear Draft (Manual)
- Click "Clear Draft" button (red trash icon)
- Confirm in dialog
- Draft removed from localStorage
- Page reloads to reset form

## For Developers

### Modified Files (6 total)
1. `apps/client/features/execution/stores/temp-save-store.ts` - Enhanced key generation
2. `apps/client/features/execution/utils/temp-save-utils.ts` - Added quarter to metadata
3. `apps/client/features/execution/components/v2/enhanced-execution-form-auto-load.tsx` - Added clear draft
4. `apps/client/features/execution/components/v2/enhanced-execution-form.tsx` - Added clear draft
5. `apps/client/features/execution/components/v2/enhanced-execution-form-updated.tsx` - Added clear draft
6. `apps/client/features/shared/form-actions.tsx` - Added clear draft button

### Key Functions

```typescript
// Generate unique save ID
generateSaveId(metadata: TempSaveMetadata): string

// Save draft
saveTemporary(id, formData, formValues, expandedRows, metadata)

// Restore draft
restoreTemporary(id): TempSaveData | null

// Remove draft
removeTemporary(id): void

// Check if draft exists
hasDraft = !!saves[draftId]
```

### Testing Commands

```bash
# Check localStorage in browser console
localStorage.getItem('execution-form-temp-saves')

# Clear all drafts (for testing)
localStorage.removeItem('execution-form-temp-saves')

# Check specific draft
const store = JSON.parse(localStorage.getItem('execution-form-temp-saves'))
console.log(Object.keys(store.state.saves))
```

## Troubleshooting

### Issue: Draft not saving
**Check:**
- Is form dirty? (has changes)
- Is draftId stable? (check console logs)
- Is localStorage available?
- Is localStorage quota exceeded?

### Issue: Wrong data appearing
**Check:**
- Verify the draftId includes all context (program, facility type, quarter)
- Check localStorage keys match expected format
- Clear old drafts using "Clear Draft" button

### Issue: Clear Draft not working
**Check:**
- Is hasDraft true?
- Check console for errors
- Verify removeTemporary is called
- Check if page reloads after clearing

## Browser DevTools

### View All Drafts
```javascript
// In browser console
const store = JSON.parse(localStorage.getItem('execution-form-temp-saves'))
console.table(Object.keys(store.state.saves))
```

### View Specific Draft
```javascript
const store = JSON.parse(localStorage.getItem('execution-form-temp-saves'))
const draftId = 'hiv_hospital_338_nyarugenge_2_q1_create'
console.log(store.state.saves[draftId])
```

### Clear Specific Draft
```javascript
const store = JSON.parse(localStorage.getItem('execution-form-temp-saves'))
delete store.state.saves['hiv_hospital_338_nyarugenge_2_q1_create']
localStorage.setItem('execution-form-temp-saves', JSON.stringify(store))
```

## Documentation Files

- `AUTO_SAVE_ENHANCEMENT.md` - Technical details of the enhancement
- `CLEAR_DRAFT_FEATURE.md` - User guide for Clear Draft feature
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `QUICK_REFERENCE.md` - This file (quick reference)
