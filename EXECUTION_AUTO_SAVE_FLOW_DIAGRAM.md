# Execution Form Auto-Save Flow Diagram

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER OPENS EXECUTION FORM                        │
│  URL: /execution/new?projectId=1&facilityId=338&facilityType=       │
│       hospital&facilityName=nyarugenge&program=HIV&                  │
│       reportingPeriodId=1&quarter=Q4                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTRACT URL PARAMETERS                            │
│  • projectId: 1                                                      │
│  • facilityId: 338                                                   │
│  • facilityType: hospital                                            │
│  • facilityName: nyarugenge                                          │
│  • program: HIV                                                      │
│  • reportingPeriodId: 1                                              │
│  • quarter: Q4                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GENERATE DRAFT ID                                 │
│  Format: exec_{projectId}_{facilityId}_{facilityType}_              │
│          {program}_{reportingPeriodId}_{quarter}                     │
│                                                                       │
│  Result: exec_1_338_hospital_hiv_1_q4                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                CHECK localStorage FOR EXISTING DRAFT                 │
│  Key: execution-form-temp-saves                                      │
│  Look for: saves["exec_1_338_hospital_hiv_1_q4"]                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  DRAFT FOUND      │       │  NO DRAFT FOUND   │
        │  Restore data     │       │  Start clean form │
        └───────────────────┘       └───────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USER ENTERS DATA                                │
│  • Fill in receipts (Section A)                                     │
│  • Fill in expenditures (Section B)                                 │
│  • Review calculated fields (Sections C-G)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AUTO-SAVE TRIGGERED                             │
│  • Every 60 seconds                                                  │
│  • Or manual "Save Draft" button click                              │
│                                                                       │
│  Save to: localStorage["execution-form-temp-saves"]                 │
│           .saves["exec_1_338_hospital_hiv_1_q4"]                    │
│                                                                       │
│  Display: "Auto-saved 10:30:45 AM"                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER SUBMITS FORM                                 │
│  Click: "Submit Execution" button                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VALIDATE FORM DATA                                │
│  • Check accounting equation (F = G)                                │
│  • Check required fields                                            │
│  • Check client-side validations                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  VALIDATION       │       │  VALIDATION       │
        │  FAILED           │       │  PASSED           │
        │  Show errors      │       │  Continue         │
        └───────────────────┘       └───────────────────┘
                    │                           │
                    │                           ▼
                    │           ┌─────────────────────────────┐
                    │           │  SUBMIT TO SERVER           │
                    │           │  POST /api/executions       │
                    │           └─────────────────────────────┘
                    │                           │
                    │           ┌───────────────┴───────────────┐
                    │           │                               │
                    │           ▼                               ▼
                    │   ┌───────────────┐           ┌───────────────────┐
                    │   │  SUCCESS      │           │  ERROR            │
                    │   │               │           │  Show error msg   │
                    │   └───────────────┘           └───────────────────┘
                    │           │                               │
                    │           ▼                               │
                    │   ┌─────────────────────────────┐        │
                    │   │  CLEAR DRAFT                │        │
                    │   │  removeTemporary(draftId)   │        │
                    │   │                             │        │
                    │   │  Console:                   │        │
                    │   │  [Draft] Clearing draft     │        │
                    │   │  after successful           │        │
                    │   │  submission:                │        │
                    │   │  exec_1_338_hospital_hiv_   │        │
                    │   │  1_q4                       │        │
                    │   └─────────────────────────────┘        │
                    │           │                               │
                    │           ▼                               │
                    │   ┌─────────────────────────────┐        │
                    │   │  NAVIGATE TO LIST           │        │
                    │   │  /dashboard/execution       │        │
                    │   └─────────────────────────────┘        │
                    │                                           │
                    └───────────────────────────────────────────┘
```

## Manual Clear Draft Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                USER CLICKS "CLEAR DRAFT" BUTTON                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  SHOW CONFIRMATION DIALOG                            │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Clear Draft?                                                  │  │
│  │                                                                │  │
│  │  This will permanently delete your saved draft from local     │  │
│  │  storage. This action cannot be undone.                       │  │
│  │                                                                │  │
│  │  ⚠️ Warning: You have unsaved changes that will also be lost. │  │
│  │                                                                │  │
│  │                              [Cancel]  [Clear Draft]          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  USER CANCELS     │       │  USER CONFIRMS    │
        │  Dialog closes    │       │  Clear draft      │
        └───────────────────┘       └───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────┐
                                    │  REMOVE DRAFT     │
                                    │  removeTemporary  │
                                    │  (draftId)        │
                                    └───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────┐
                                    │  SHOW SUCCESS     │
                                    │  TOAST            │
                                    │  "Draft cleared   │
                                    │  successfully"    │
                                    └───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────┐
                                    │  RELOAD PAGE      │
                                    │  window.location  │
                                    │  .reload()        │
                                    └───────────────────┘
```

## Multiple Facilities Scenario

```
┌─────────────────────────────────────────────────────────────────────┐
│                         localStorage                                 │
│  Key: "execution-form-temp-saves"                                   │
│                                                                       │
│  {                                                                    │
│    saves: {                                                          │
│      "exec_1_338_hospital_hiv_1_q4": {                              │
│        id: "exec_1_338_hospital_hiv_1_q4",                          │
│        formData: [...],                                              │
│        formValues: {...},                                            │
│        metadata: {                                                   │
│          projectId: 1,                                               │
│          facilityId: 338,                                            │
│          facilityName: "nyarugenge",                                 │
│          facilityType: "hospital",                                   │
│          programName: "HIV",                                         │
│          reportingPeriod: "1",                                       │
│          quarter: "Q4"                                               │
│        },                                                            │
│        timestamps: {                                                 │
│          created: "2026-01-15T10:00:00.000Z",                       │
│          lastSaved: "2026-01-15T10:30:45.000Z",                     │
│          lastAccessed: "2026-01-15T10:30:45.000Z"                   │
│        }                                                             │
│      },                                                              │
│      "exec_1_339_health_center_hiv_1_q4": {                         │
│        id: "exec_1_339_health_center_hiv_1_q4",                     │
│        formData: [...],                                              │
│        formValues: {...},                                            │
│        metadata: {                                                   │
│          projectId: 1,                                               │
│          facilityId: 339,                                            │
│          facilityName: "kicukiro",                                   │
│          facilityType: "health_center",                              │
│          programName: "HIV",                                         │
│          reportingPeriod: "1",                                       │
│          quarter: "Q4"                                               │
│        },                                                            │
│        timestamps: { ... }                                           │
│      },                                                              │
│      "exec_2_338_hospital_tb_1_q1": {                               │
│        id: "exec_2_338_hospital_tb_1_q1",                           │
│        formData: [...],                                              │
│        formValues: {...},                                            │
│        metadata: {                                                   │
│          projectId: 2,                                               │
│          facilityId: 338,                                            │
│          facilityName: "nyarugenge",                                 │
│          facilityType: "hospital",                                   │
│          programName: "TB",                                          │
│          reportingPeriod: "1",                                       │
│          quarter: "Q1"                                               │
│        },                                                            │
│        timestamps: { ... }                                           │
│      }                                                               │
│    },                                                                │
│    autoSaveEnabled: true,                                            │
│    autoSaveInterval: 60000                                           │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Draft ID Differentiation Matrix

```
┌──────────────┬──────────┬──────────┬─────────┬─────────────────────────────────┐
│ Facility     │ Program  │ Quarter  │ Project │ Draft ID                        │
├──────────────┼──────────┼──────────┼─────────┼─────────────────────────────────┤
│ Nyarugenge   │ HIV      │ Q4       │ 1       │ exec_1_338_hospital_hiv_1_q4    │
│ Hospital     │          │          │         │                                 │
├──────────────┼──────────┼──────────┼─────────┼─────────────────────────────────┤
│ Nyarugenge   │ TB       │ Q4       │ 2       │ exec_2_338_hospital_tb_1_q4     │
│ Hospital     │          │          │         │                                 │
├──────────────┼──────────┼──────────┼─────────┼─────────────────────────────────┤
│ Nyarugenge   │ HIV      │ Q1       │ 1       │ exec_1_338_hospital_hiv_1_q1    │
│ Hospital     │          │          │         │                                 │
├──────────────┼──────────┼──────────┼─────────┼─────────────────────────────────┤
│ Kicukiro     │ HIV      │ Q4       │ 1       │ exec_1_339_health_center_hiv_   │
│ Health Ctr   │          │          │         │ 1_q4                            │
├──────────────┼──────────┼──────────┼─────────┼─────────────────────────────────┤
│ Gasabo       │ MAL      │ Q2       │ 3       │ exec_3_340_hospital_mal_1_q2    │
│ Hospital     │          │          │         │                                 │
└──────────────┴──────────┴──────────┴─────────┴─────────────────────────────────┘

✅ Each combination gets its own unique draft ID
✅ No conflicts between different facilities
✅ No conflicts between different programs
✅ No conflicts between different quarters
```

## State Transitions

```
┌─────────────┐
│   INITIAL   │  No draft exists
│   STATE     │
└──────┬──────┘
       │
       │ User enters data
       ▼
┌─────────────┐
│   DRAFT     │  Draft saved in localStorage
│   SAVED     │  Auto-save every 60s
└──────┬──────┘
       │
       │ User submits form
       ▼
┌─────────────┐
│ SUBMITTING  │  Validation + API call
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│   SUCCESS   │  │   ERROR     │
│             │  │             │
│ Draft       │  │ Draft       │
│ CLEARED     │  │ RETAINED    │
└──────┬──────┘  └──────┬──────┘
       │                │
       │                │ User can retry
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  NAVIGATE   │  │   DRAFT     │
│  TO LIST    │  │   SAVED     │
└─────────────┘  └─────────────┘
```

## Key Benefits Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BEFORE ENHANCEMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Draft ID: exec_338_1_hospital_q4                                    │
│                                                                       │
│  ❌ Problem: Different programs overwrite each other                 │
│                                                                       │
│  User works on HIV → Draft saved                                     │
│  User switches to TB → Draft OVERWRITTEN                             │
│  User goes back to HIV → Data LOST                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         AFTER ENHANCEMENT                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Draft ID: exec_1_338_hospital_hiv_1_q4                             │
│                                                                       │
│  ✅ Solution: Each program has its own draft                         │
│                                                                       │
│  User works on HIV → Draft saved (exec_1_338_hospital_hiv_1_q4)     │
│  User switches to TB → New draft (exec_2_338_hospital_tb_1_q4)      │
│  User goes back to HIV → Data RESTORED                               │
│                                                                       │
│  ✅ Auto-clear on submit → No stale drafts                           │
│  ✅ Manual clear button → User control                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```
