# Clear Draft Feature

## Overview
Added a "Clear Draft" button to the execution form that allows users to manually remove saved drafts from localStorage when needed.

## UI Location
The "Clear Draft" button appears in the form actions bar at the bottom of the execution form, between the "Cancel" and "Save Draft" buttons.

## Button Appearance
- **Icon**: Trash icon (🗑️)
- **Style**: Outline button with destructive text color (red)
- **Label**: "Clear Draft"
- **Visibility**: Only shown when a draft exists for the current execution

## User Flow

### 1. Click "Clear Draft"
User clicks the "Clear Draft" button in the form actions bar.

### 2. Confirmation Dialog
A confirmation dialog appears with:
- **Title**: "Clear Draft?"
- **Description**: "This will permanently delete your saved draft from local storage. This action cannot be undone."
- **Warning** (if form is dirty): "Warning: You have unsaved changes that will also be lost."
- **Actions**:
  - "Cancel" button (default)
  - "Clear Draft" button (destructive/red)

### 3. Confirmation
If user clicks "Clear Draft" in the dialog:
- Draft is removed from localStorage
- Success toast: "Draft cleared successfully"
- Page reloads after 500ms to reset form state

### 4. Cancellation
If user clicks "Cancel":
- Dialog closes
- No changes made
- Draft remains in localStorage

## Error Handling
If clearing fails:
- Error toast: "Failed to clear draft"
- Draft remains in localStorage
- No page reload

## Use Cases

### When to Use Clear Draft
1. **Corrupted Draft**: Draft data is causing issues or errors
2. **Wrong Data**: Accidentally saved wrong data and want to start fresh
3. **Testing**: Developers testing the form want to reset state
4. **Storage Cleanup**: User wants to free up localStorage space
5. **Unexpected Behavior**: Auto-save is behaving unexpectedly

### When NOT to Use Clear Draft
1. **Normal Workflow**: Use "Save Draft" for normal saving
2. **Switching Contexts**: The enhanced auto-save now properly scopes drafts, so switching between different programs/facilities/quarters won't cause issues

## Technical Details

### localStorage Key Format
```
execution-form-temp-saves
```

### Draft ID Format (within the store)
```
{programName}_{facilityType}_{facilityId}_{facilityName}_{reportingPeriod}_{quarter}_{mode}
```

Example:
```
hiv_hospital_338_nyarugenge_2_q1_create
```

### State Management
- Uses Zustand store (`useTempSaveStore`)
- `removeTemporary(draftId)` removes the specific draft
- `hasDraft` boolean tracks if a draft exists for current context

## Code Example

```typescript
// Clear draft function
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

## Accessibility
- Button has proper ARIA labels
- Dialog is keyboard accessible (Escape to close, Tab to navigate)
- Focus management handled by AlertDialog component
- Clear visual hierarchy with destructive styling

## Browser Compatibility
Works in all modern browsers that support:
- localStorage API
- React 18+
- Radix UI components
