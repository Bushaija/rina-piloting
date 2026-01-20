COMPLETE CALCULATION IMPACTS




SECTION A: RECEIPTS
-------------------


A-01: Other Incomes

User Enters: {amount: X}
Impact:
  → Cash at Bank: +X
  → Section C (Surplus/Deficit): +X



A-02: Transfers from SPIU/RBC

User Enters: {amount: X}
Impact:
  → Cash at Bank: +X
  → Section C (Surplus/Deficit): +X


A-03:

  → Cash at Bank: +X
  → Section C (Surplus/Deficit): +X


SECTION B: EXPENDITURES
-----------------------

PAYMENT STATUS IMPACTS:

1. FULLY PAID

User Enters: {amount/netAmount: X, paymentStatus: "fully_paid"}
For VAT expenses: {netAmount: N, vatAmount: V, totalAmount: N+V}

Impact:
  → Cash at Bank: -totalAmount
  → Section C (Surplus/Deficit): -netAmount
  → VAT Receivable: +vatAmount (if applicable)
  → Payable: NO CHANGE (0)



2. UNPAID

User Enters: {amount/netAmount: X, paymentStatus: "unpaid"}  
For VAT expenses: {netAmount: N, vatAmount: V, totalAmount: N+V}

Impact:
  → Cash at Bank: NO CHANGE
  → Section C (Surplus/Deficit): -netAmount
  → VAT Receivable: +vatAmount (if applicable)
  → Corresponding Payable: +totalAmount

3. PARTIALLY PAID

User Enters: {amount/netAmount: X, paymentStatus: "partially_paid", paidAmount: P}
For VAT expenses: {netAmount: N, vatAmount: V, totalAmount: N+V}

Impact:
  → Cash at Bank: -paidAmount
  → Section C (Surplus/Deficit): -netAmount
  → VAT Receivable: +vatAmount (if applicable)
  → Corresponding Payable: +(totalAmount - paidAmount)

SECTION B EXPENSE CATEGORIES:


B-01: Human Resources

Activities: Laboratory Technician, Nurse
Payment Status Impact:
  → Payable 1: Salaries: +unpaidAmount



B-02: Monitoring & Evaluation


Activities: Supervision CHWs, Support group meetings
Payment Status Impact:
  → Payable 2: Supervision: +unpaidAmount (Supervision CHWs)
  → Payable 3: Meetings: +unpaidAmount (Support group meetings)



B-03: Living Support

Activities: Sample transport, Home visit lost to follow up, Travel surveillance
Payment Status Impact:
  → Payable 4: Sample transport: +unpaidAmount
  → Payable 5: Home visits: +unpaidAmount  
  → Payable 6: Travel surveillance: +unpaidAmount



B-04: Overheads (VAT APPLICABLE)

VAT Activities: Communication - Airtime, Communication - Internet, 
               Infrastructure support, Office supplies
Payment Status Impact:
  → Corresponding Payable: +unpaidAmount
  → Corresponding VAT Receivable: +vatAmount (ALWAYS, regardless of payment)

Non-VAT Activities: Transport reporting, Bank charges
Payment Status Impact:
  → Corresponding Payable: +unpaidAmount



B-05: Transfers

Activities: Transfer to RBC
Payment Status Impact:
  → Payable 13: Other payables: +unpaidAmount



SECTION X: ADJUSTMENTS

X-01: Other receivables

User Enters: {amount: X}

Impact:
  → Cash at Bank: -X
  → Other Receivables (D): +X
  → Section C (Surplus/Deficit): NO CHANGE

X-02: Other Payables

User Enters: {amount: X}

Impact:
  → Cash at Bank: +X
  → Payable 16: Other payables (E): +X
  → Section C (Surplus/Deficit): -X (expense recognized)

Note: This implements double-entry accounting for miscellaneous payables:
- Debit: Cash at Bank (asset increases)
- Credit: Payable 16 (liability increases)
- Expense: Recognized in Surplus/Deficit

SECTION G: PRIOR YEAR ADJUSTMENTS

G-01: Cash Adjustments

User Enters: {amount: X}
Impact:
  → Cash at Bank: +X
  → Closing Balance (G): +X
  → Section C (Surplus/Deficit): NO CHANGE


G-02: Receivable Adjustments

User Enters: {amount: X}
Impact:
  → Receivables (D): +X
  → Closing Balance (G): +X
  → Section C (Surplus/Deficit): NO CHANGE

G-03: Payable Adjustments

User Enters: {amount: X}
Impact:
  → Payables (E): +X
  → Closing Balance (G): -X (liability increase reduces equity)
  → Section C (Surplus/Deficit): NO CHANGE

G-04: Accumulated Surplus/Deficit
----------------------------------

User Enters (Q1 only): {amount: X}
Impact:
  → Closing Balance (G): +X
  → Opening equity for fiscal year

CLEARANCE ACTIONS
------------------

RECEIVABLE CLEARANCE (RRA Refund Application)

User Action: Clear [Amount Y] from [Receivable Activity]
Trigger: RRA refund received with reference

Impact:
  → Cash at Bank: +Y
  → Receivable Balance: -Y
  → F = G: NO CHANGE (asset swap)

Clearance Priority Order:
  1. Office supplies (VAT Receivables 4)
  2. Communication - Airtime (VAT Receivables 1)
  3. Communication - Internet (VAT Receivables 2)
  4. Infrastructure support (VAT Receivables 3)

PAYABLE PAYMENT (Invoice Settlement)
------------------------------------

User Action: Pay [Amount Y] to [Payable Activity]
Trigger: Invoice payment made

Impact:
  → Cash at Bank: -Y
  → Payable Balance: -Y
  → F = G: NO CHANGE (liability & asset decrease)

CALCULATED FIELDS
------------------

Section C: Surplus/Deficit

Formula: C = sum(A.amount) - sum(B.netAmount)

Where:
  - A.amount: All receipts
  - B.netAmount: For VAT expenses = netAmount, for others = amount

Section D: Assets
-----------------

Cash at Bank = 
  previous_quarter_closing
  + sum(A.amount)
  - sum(B.paidAmount)
  - X.amount
  + G.cashAdjustment
  + sum(D.clearances)
  - sum(E.payments)

VAT Receivables = 
  previous_quarter_balance
  + sum(corresponding_B_expense.vatAmount)
  - sum(clearances)

Other Receivables =
  previous_quarter_balance
  + X.amount
  + G.receivableAdjustment
  - sum(clearances)


Section E: Liabilities
----------------------

Each Payable =
  previous_quarter_balance
  + sum(corresponding_B_expense.unpaidAmount)
  + G.payableAdjustment (for Payable 1 only)
  - sum(payments)

Where unpaidAmount:
  - fully_paid: 0
  - unpaid: totalAmount
  - partially_paid: totalAmount - paidAmount


Section F: Net Financial Assets
-------------------------------

F = Total Assets (D) - Total Liabilities (E)

Section G: Closing Balance
---------------------------

G = Accumulated Surplus/Deficit
    + Cash Adjustments
    (-/+) Receivable Adjustments
    (-/+) Payable Adjustments
    + Surplus/Deficit of Period (C)

note:
- adjustments can either be increasing or decreasing the current payable or receivable.


VALIDATION RULES
-----------------

F = G (MUST ALWAYS HOLD)

Total Assets - Total Liabilities = Closing Balance

If fails, check:
  1. Cash calculation errors
  2. Missing VAT receivables
  3. Payable calculations wrong
  4. Prior year adjustments incorrect
  5. Clearance/payment impacts not applied


Cash Cannot Go Negative

Cash at Bank ≥ 0 (unless approved overdraft)


Clearance Validation

Clearance Amount ≤ Receivable Remaining Balance
Payment Amount ≤ Payable Remaining Balance

QUARTERLY ROLLOVER
------------------

Roll Forward (n → n+1)

D (Assets): Closing balance → Next quarter opening
E (Liabilities): Closing balance → Next quarter opening
F (Net Assets): Calculated from D-E
G Accumulated: Carries forward all year


Reset Each Quarter

A (Receipts): Start fresh
B (Expenditures): Start fresh
C (Surplus/Deficit): Fresh calculation
G current period: Fresh calculation
X (Adjustments): Start fresh



REAL-WORLD SCENARIO EXAMPLE
---------------------------


Q1: Create VAT expense

Expense: Office supplies
User Enters: {netAmount: 10,000, vatAmount: 1,800, paymentStatus: "unpaid"}
Impact:
  → Section C: -10,000
  → VAT Receivables 4: +1,800
  → Payable 10: +11,800
  → Cash: NO CHANGE


Q2: RRA Refund received

User Enters (Section A): {amount: 1,800, reference: "RRA-001"}
User Action: Clear VAT Receivables 4 (1,800)
Impact:
  → Cash: +1,800 (from receipt) -1,800 (clearance applies cash) = NET 0
  → VAT Receivables 4: 1,800 → 0
  → F = G: Still balanced


Q3: Pay invoice

User Action: Pay Payable 10 (11,800)
Impact:
  → Cash: -11,800
  → Payable 10: 11,800 → 0
  → F = G: Still balanced



SUMMARY: WHAT AFFECTS CASH



INCREASE CASH:
  + Section A receipts
  + RRA refunds (Section A)
  + Receivable clearances
  + Prior year cash adjustments (G)
  + Section X: Other Payables (X-02) - receiving money that you owe

DECREASE CASH:
  - Section B paid amounts
  - Section X: Other Receivables (X-01) - giving credit/advances
  - Payable payments
  - Prior year cash adjustments (if negative)

NO CASH IMPACT:
  - Unpaid expenses
  - VAT receivable creation
  - Payable creation
  - Surplus/Deficit calculation





CUMULATIVE BALANCE CALCULATIONS
=====================



CUMULATIVE VS QUARTERLY BALANCE RULES
RULE 1: Different Sections Have Different Cumulative Logic

Income Statement Sections (A, B, C, G): SUM across quarters
Balance Sheet Sections (D, E, F): LATEST quarter only
INCOME STATEMENT SECTIONS (SUM ACROSS QUARTERS)
Section A: Receipts

Quarterly: Q1 = 5,000,000 | Q2 = 1,000,000 | Q3 = 0
Cumulative (Q3): 5,000,000 + 1,000,000 + 0 = 6,000,000
Section B: Expenditures

Quarterly: Q1 = 260,000 | Q2 = 280,000 | Q3 = 0  
Cumulative (Q3): 260,000 + 280,000 + 0 = 540,000
Section C: Surplus/Deficit

Quarterly: Q1 = 4,740,000 | Q2 = 720,000 | Q3 = 0
Cumulative (Q3): 4,740,000 + 720,000 + 0 = 5,460,000
Section G: Closing Balance

Quarterly G = Accumulated + Prior Adj + C

Cumulative G = sum(All quarterly C) + Accumulated + Prior Adj
Example (Q3): 4,740,000 + 720,000 + 0 + 0 + 0 = 5,460,000
BALANCE SHEET SECTIONS (LATEST QUARTER ONLY)
Section D: Assets

Quarterly Balances:
  Q1 Cash: 4,980,000
  Q2 Cash: 5,960,000
  Q3 Cash: 5,960,000

Cumulative (Q3): Show Q3 balance ONLY = 5,960,000
NOT: 4,980,000 + 5,960,000 + 5,960,000
Section E: Liabilities

Quarterly Balances:
  Q1 Payable 1: 40,000
  Q2 Payable 1: 120,000  
  Q3 Payable 1: 120,000

Cumulative (Q3): Show Q3 balance ONLY = 120,000
Section F: Net Financial Assets

F = D - E (calculated each quarter)

Quarterly:
  Q1 F: 4,740,000
  Q2 F: 5,280,000
  Q3 F: 5,280,000

Cumulative (Q3): Show Q3 F ONLY = 5,280,000
CALCULATION FORMULAS
Cumulative for Income Statement Items

cumulative_balance = 
  COALESCE(q1_amount, 0) + 
  COALESCE(q2_amount, 0) + 
  COALESCE(q3_amount, 0) + 
  COALESCE(q4_amount, 0)
Cumulative for Balance Sheet Items

cumulative_balance = 
  CASE 
    WHEN q4_amount IS NOT NULL THEN q4_amount
    WHEN q3_amount IS NOT NULL THEN q3_amount
    WHEN q2_amount IS NOT NULL THEN q2_amount
    ELSE COALESCE(q1_amount, 0)
  END
Special: Clearance Cumulative

For receivables/payables with clearances:
cumulative_remaining = 
  cumulative_amount - cumulative_cleared

Where:
  cumulative_amount = latest quarter balance
  cumulative_cleared = sum(clearances across all quarters)
REAL EXAMPLE FROM YOUR DATA
Receipts (Section A)

Q1: 5,000,000
Q2: 1,000,000  
Q3: 0
Cumulative (Q3): 6,000,000 ✓ SUM
Cash at Bank (Section D)

Q1: 4,980,000
Q2: 5,960,000
Q3: 5,960,000
Cumulative (Q3): 5,960,000 ✓ LATEST ONLY
Payable 1 (Section E)

Q1: 40,000
Q2: 120,000
Q3: 120,000
Cumulative (Q3): 120,000 ✓ LATEST ONLY
F vs G Validation (Q3)

F cumulative: 5,280,000 (Q3 balance)
G cumulative: 5,460,000 (sum of Q1+Q2+Q3)

❌ PROBLEM: F ≠ G (180,000 difference)
✓ This reveals calculation error in assets/liabilities
UI DISPLAY RULES
Grid Columns:

| Activity | Q1 | Q2 | Q3 | Cumulative Balance |
|----------|----|----|----|-------------------|
| Receipts | 5M | 1M | 0  | 6M (SUM)          |
| Cash     | 4.98M | 5.96M | 5.96M | 5.96M (LATEST) |
Tooltip Explanations:

Income Items: "Cumulative = Sum of all quarters"
Balance Items: "Cumulative = Current quarter balance"


