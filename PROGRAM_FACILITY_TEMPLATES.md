# Program-Facility Type Templates

This document defines standardized planning and execution templates for each program-facility type combination. All facilities of the same type within a program use identical templates, ensuring consistency across the country.

---

## Template Structure Overview

### Programs
- HIV
- TB
- Malaria

### Facility Types
- Hospital
- Health Center

### Combinations (5 total)
1. HIV - Hospital
2. HIV - Health Center
3. TB - Hospital (TB only applies to hospitals)
4. Malaria - Hospital
5. Malaria - Health Center

---

## Planning Template Structure

Each planning template defines budgeted expenditure lines (Section B only) that will be used across all facilities of that type within the program.

### Template Fields
- **Code**: Unique identifier (e.g., "HIV-H-B.01.001")
- **Name**: Line item name
- **Section**: Always "B" (Expenditures) for planning
- **Category**: Grouping within Section B (e.g., "B.01 Human Resources")
- **Display Order**: Sort order within category
- **Has VAT**: Boolean flag for VAT applicability
- **VAT Rate**: Reference rate (e.g., 16%)
- **Is Planning-Driven**: Always true for planning templates
- **Program**: HIV/TB/Malaria
- **Facility Type**: Hospital/Health Center
- **Description**: Purpose of the line item

---

## Execution Template Structure

Each execution template defines all available lines (Sections A, B, D, E, X) that accountants can use when recording actual transactions.

### Template Fields
- **Code**: Unique identifier
- **Name**: Line item name
- **Section**: A/B/D/E/X
- **Category**: Grouping within section
- **Display Order**: Sort order
- **Has VAT**: Boolean flag
- **VAT Rate**: Reference rate
- **Is Planning-Driven**: Boolean (true if linked to planning, false if execution-only)
- **Program**: HIV/TB/Malaria
- **Facility Type**: Hospital/Health Center
- **Description**: Purpose of the line item

---

## Example: HIV - Hospital Templates

### Planning Template (HIV-Hospital)

| Code | Name | Section | Category | Display Order | Has VAT | VAT Rate | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|----------|-------------------|-------------|
| HIV-H-B.01.001 | Salaries - Medical Staff | B | B.01 Human Resources | 1 | No | - | Yes | Monthly salaries for doctors, nurses, clinical officers |
| HIV-H-B.01.002 | Salaries - Administrative Staff | B | B.01 Human Resources | 2 | No | - | Yes | Monthly salaries for admin, finance, HR staff |
| HIV-H-B.01.003 | Allowances - On-Call | B | B.01 Human Resources | 3 | No | - | Yes | On-call allowances for medical staff |
| HIV-H-B.02.001 | Antiretroviral Drugs | B | B.02 Medical Supplies | 1 | Yes | 16% | Yes | ARV medications for HIV patients |
| HIV-H-B.02.002 | Laboratory Reagents | B | B.02 Medical Supplies | 2 | Yes | 16% | Yes | CD4, viral load, and other lab reagents |
| HIV-H-B.02.003 | Medical Equipment Maintenance | B | B.02 Medical Supplies | 3 | Yes | 16% | Yes | Maintenance contracts for lab and clinical equipment |
| HIV-H-B.03.001 | Vehicle Fuel | B | B.03 Transport | 1 | Yes | 16% | Yes | Fuel for facility vehicles and outreach |
| HIV-H-B.03.002 | Vehicle Maintenance | B | B.03 Transport | 2 | Yes | 16% | Yes | Maintenance and repairs for vehicles |
| HIV-H-B.04.001 | Office Supplies | B | B.04 Administration | 1 | Yes | 16% | Yes | Stationery, printing, office materials |
| HIV-H-B.04.002 | Utilities - Electricity | B | B.04 Administration | 2 | No | - | Yes | Monthly electricity bills |
| HIV-H-B.04.003 | Utilities - Water | B | B.04 Administration | 3 | No | - | Yes | Monthly water bills |
| HIV-H-B.05.001 | Staff Training | B | B.05 Capacity Building | 1 | Yes | 16% | Yes | Training courses and workshops for staff |
| HIV-H-B.05.002 | Supervision Visits | B | B.05 Capacity Building | 2 | Yes | 16% | Yes | District/regional supervision visits |

### Execution Template (HIV-Hospital)

**Section A: Receipts (Execution-Only)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| HIV-H-A.01.001 | Transfers from RBC | A | A.01 Receipts | 1 | No | No | Monthly budget transfers from Regional Budget Committee |
| HIV-H-A.01.002 | Grants from WHO | A | A.01 Receipts | 2 | No | No | Direct grants received from WHO |
| HIV-H-A.01.003 | Grants from PEPFAR | A | A.01 Receipts | 3 | No | No | Direct grants received from PEPFAR |
| HIV-H-A.01.004 | Other Income | A | A.01 Receipts | 4 | No | No | User fees, donations, other miscellaneous income |

**Section B: Expenditures (Planning-Driven)**

*Same as Planning Template above*

**Section D: Assets (Auto-Calculated + Miscellaneous)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| HIV-H-D.01.001 | Cash at Bank | D | D.01 Cash | 1 | No | No | Opening cash balance (auto-calculated) |
| HIV-H-D.02.001 | VAT Receivable - ARVs | D | D.02 VAT Receivables | 1 | No | Yes | VAT from ARV purchases (auto-calculated from B.02.001) |
| HIV-H-D.02.002 | VAT Receivable - Lab Reagents | D | D.02 VAT Receivables | 2 | No | Yes | VAT from lab reagent purchases (auto-calculated from B.02.002) |
| HIV-H-D.03.001 | Other Receivables | D | D.03 Other Receivables | 1 | No | No | Miscellaneous receivables (manual entry) |

**Section E: Liabilities (Auto-Calculated + Miscellaneous)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| HIV-H-E.01.001 | Payable - Salaries | E | E.01 Payables | 1 | No | Yes | Unpaid salaries (auto-calculated from B.01.001, B.01.002) |
| HIV-H-E.01.002 | Payable - ARVs | E | E.01 Payables | 2 | Yes | Yes | Unpaid ARV invoices (auto-calculated from B.02.001) |
| HIV-H-E.02.001 | Other Payables | E | E.02 Other Payables | 1 | No | No | Miscellaneous payables (manual entry) |

**Section X: Miscellaneous (Manual Entry)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| HIV-H-X.01.001 | Miscellaneous Receivable | X | X.01 Receivables | 1 | No | No | Manual entry for non-planned receivables |
| HIV-H-X.02.001 | Miscellaneous Payable | X | X.02 Payables | 1 | No | No | Manual entry for non-planned payables |
| HIV-H-X.03.001 | Cash Adjustment | X | X.03 Prior Year Adjustments | 1 | No | No | Prior year cash adjustments (G-01) |
| HIV-H-X.03.002 | Receivable Adjustment | X | X.03 Prior Year Adjustments | 2 | No | No | Prior year receivable adjustments (G-02) |
| HIV-H-X.03.003 | Payable Adjustment | X | X.03 Prior Year Adjustments | 3 | No | No | Prior year payable adjustments (G-03) |
| HIV-H-X.03.004 | Opening Balance | X | X.03 Prior Year Adjustments | 4 | No | No | Accumulated surplus/deficit opening balance (G-04, Q1 only) |

---

## Example: Malaria - Hospital Templates

### Planning Template (Malaria-Hospital)

| Code | Name | Section | Category | Display Order | Has VAT | VAT Rate | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|----------|-------------------|-------------|
| MAL-H-B.01.001 | Salaries - Medical Staff | B | B.01 Human Resources | 1 | No | - | Yes | Monthly salaries for doctors, nurses, clinical officers |
| MAL-H-B.01.002 | Salaries - Administrative Staff | B | B.01 Human Resources | 2 | No | - | Yes | Monthly salaries for admin and support staff |
| MAL-H-B.02.001 | Antimalarial Drugs | B | B.02 Medical Supplies | 1 | Yes | 16% | Yes | ACT and other antimalarial medications |
| MAL-H-B.02.002 | Diagnostic Reagents | B | B.02 Medical Supplies | 2 | Yes | 16% | Yes | RDT kits and microscopy supplies |
| MAL-H-B.02.003 | ITN Distribution | B | B.02 Medical Supplies | 3 | Yes | 16% | Yes | Insecticide-treated nets for distribution |
| MAL-H-B.03.001 | Vehicle Fuel | B | B.03 Transport | 1 | Yes | 16% | Yes | Fuel for outreach and supervision |
| MAL-H-B.04.001 | Office Supplies | B | B.04 Administration | 1 | Yes | 16% | Yes | Stationery and office materials |
| MAL-H-B.04.002 | Utilities - Electricity | B | B.04 Administration | 2 | No | - | Yes | Monthly electricity bills |
| MAL-H-B.05.001 | Community Mobilization | B | B.05 Capacity Building | 1 | Yes | 16% | Yes | Community awareness and mobilization activities |

### Execution Template (Malaria-Hospital)

**Section A: Receipts (Execution-Only)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| MAL-H-A.01.001 | Transfers from RBC | A | A.01 Receipts | 1 | No | No | Monthly budget transfers from Regional Budget Committee |
| MAL-H-A.01.002 | Grants from WHO | A | A.01 Receipts | 2 | No | No | Direct grants received from WHO |
| MAL-H-A.01.003 | Other Income | A | A.01 Receipts | 3 | No | No | User fees and other miscellaneous income |

**Section B: Expenditures (Planning-Driven)**

*Same as Planning Template above*

**Section D: Assets (Auto-Calculated + Miscellaneous)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| MAL-H-D.01.001 | Cash at Bank | D | D.01 Cash | 1 | No | No | Opening cash balance (auto-calculated) |
| MAL-H-D.02.001 | VAT Receivable - Antimalarials | D | D.02 VAT Receivables | 1 | No | Yes | VAT from antimalarial purchases (auto-calculated from B.02.001) |
| MAL-H-D.03.001 | Other Receivables | D | D.03 Other Receivables | 1 | No | No | Miscellaneous receivables (manual entry) |

**Section E: Liabilities (Auto-Calculated + Miscellaneous)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| MAL-H-E.01.001 | Payable - Salaries | E | E.01 Payables | 1 | No | Yes | Unpaid salaries (auto-calculated from B.01.001, B.01.002) |
| MAL-H-E.01.002 | Payable - Antimalarials | E | E.01 Payables | 2 | Yes | Yes | Unpaid antimalarial invoices (auto-calculated from B.02.001) |
| MAL-H-E.02.001 | Other Payables | E | E.02 Other Payables | 1 | No | No | Miscellaneous payables (manual entry) |

**Section X: Miscellaneous (Manual Entry)**

| Code | Name | Section | Category | Display Order | Has VAT | Is Planning-Driven | Description |
|------|------|---------|----------|---------------|---------|-------------------|-------------|
| MAL-H-X.01.001 | Miscellaneous Receivable | X | X.01 Receivables | 1 | No | No | Manual entry for non-planned receivables |
| MAL-H-X.02.001 | Miscellaneous Payable | X | X.02 Payables | 1 | No | No | Manual entry for non-planned payables |
| MAL-H-X.03.001 | Cash Adjustment | X | X.03 Prior Year Adjustments | 1 | No | No | Prior year cash adjustments (G-01) |
| MAL-H-X.03.002 | Receivable Adjustment | X | X.03 Prior Year Adjustments | 2 | No | No | Prior year receivable adjustments (G-02) |
| MAL-H-X.03.003 | Payable Adjustment | X | X.03 Prior Year Adjustments | 3 | No | No | Prior year payable adjustments (G-03) |
| MAL-H-X.03.004 | Opening Balance | X | X.03 Prior Year Adjustments | 4 | No | No | Accumulated surplus/deficit opening balance (G-04, Q1 only) |

---

## Template Usage Rules

1. **Planning Templates** are used to create planning activities during the budget planning phase
2. **Execution Templates** are used when initializing execution forms for data entry
3. **Planning-driven lines** in execution are auto-populated from approved planning activities
4. **Execution-only lines** (Section A, X) are always available for manual entry
5. **All facilities** of the same type within a program use the identical template
6. **Template versioning** allows updates while preserving historical data

---

## Notes

- Codes follow pattern: `[PROGRAM]-[FACILITY_TYPE]-[SECTION].[CATEGORY].[SEQUENCE]`
- Programs: HIV, TB, MAL (Malaria)
- Facility Types: H (Hospital), HC (Health Center)
- Sections: A (Receipts), B (Expenditures), D (Assets), E (Liabilities), X (Miscellaneous)
- Categories within sections are numbered (e.g., B.01, B.02, B.03)
- Display order determines sort within each category
- VAT rate is reference only; actual VAT is manually entered during execution
