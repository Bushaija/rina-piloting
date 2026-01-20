# RINA - Business Domain & User Workflow Analysis

---

## 🎯 BUSINESS CONTEXT

### Problem Statement

Healthcare facilities in Rwanda managing donor-funded programs (HIV, TB, Malaria) face significant challenges:

1. **Manual Financial Tracking**: Spreadsheet-based budget planning and execution tracking
2. **Complex Reporting Requirements**: Multiple financial statements required by donors
3. **Multi-level Approval**: Hierarchical approval processes across facilities, districts, and provinces
4. **Compliance Burden**: Strict accounting standards and audit requirements
5. **Data Consolidation**: Difficulty aggregating data across multiple facilities
6. **Transparency Gaps**: Limited visibility into budget utilization and variances

### Solution Overview

RINA provides a centralized, web-based platform that:
- **Standardizes** budget planning and execution processes
- **Automates** financial statement generation
- **Enforces** approval workflows and period locking
- **Validates** accounting equations in real-time
- **Aggregates** data across organizational hierarchy
- **Ensures** audit trail and compliance

---

## 👥 USER PERSONAS & ROLES

### 1. Health Center Accountant (Primary User)
**Profile**:
- Works at a health center (lowest facility level)
- Manages budgets for 1-3 health programs
- Limited accounting software experience
- Needs simple, guided workflows

**Responsibilities**:
- Enter annual budget plans
- Record quarterly actual expenditures
- Submit financial reports for approval
- Attach supporting documents
- Respond to approval feedback

**Pain Points**:
- Complex Excel formulas prone to errors
- Difficulty understanding accounting rules
- Time-consuming manual calculations
- Unclear approval status

**RINA Benefits**:
- Automatic calculations
- Built-in validation
- Clear approval tracking
- Guided data entry forms

---

### 2. Hospital Accountant (Primary User)
**Profile**:
- Works at a district or referral hospital
- Manages larger budgets across multiple programs
- More accounting experience
- Handles more complex transactions

**Responsibilities**:
- Same as health center accountant
- Additional complexity due to larger scale
- May supervise health center accountants

**Pain Points**:
- Managing multiple programs simultaneously
- Reconciling large transaction volumes
- Meeting tight reporting deadlines

**RINA Benefits**:
- Multi-program support
- Bulk operations
- Quick data validation
- Automated report generation

---

### 3. DAF - Director of Administration & Finance (Approver)
**Profile**:
- District or provincial level administrator
- Oversees multiple facilities
- Financial management expertise
- Accountability for budget compliance

**Responsibilities**:
- Review submitted financial reports
- Approve or reject with feedback
- Monitor budget utilization across facilities
- Ensure compliance with policies

**Pain Points**:
- Reviewing multiple reports manually
- Identifying errors or inconsistencies
- Tracking approval status
- Providing structured feedback

**RINA Benefits**:
- Centralized approval queue
- Side-by-side budget vs actual comparison
- Structured feedback mechanism
- Automated notifications

---

### 4. DG - Director General (Final Approver)
**Profile**:
- National level executive
- Final approval authority
- Strategic oversight
- Limited time for detailed review

**Responsibilities**:
- Final approval of financial reports
- High-level budget oversight
- Policy compliance verification
- Strategic decision support

**Pain Points**:
- Limited time for detailed review
- Need for executive summaries
- Tracking overall program performance

**RINA Benefits**:
- Executive dashboard
- Summary analytics
- Quick approval workflow
- Variance highlights

---

### 5. System Administrator (Support Role)
**Profile**:
- IT staff or designated admin
- Technical expertise
- System configuration knowledge

**Responsibilities**:
- User account management
- System configuration
- Reporting period setup
- Troubleshooting support

**Pain Points**:
- Manual user provisioning
- Configuration changes require code
- Limited admin tools

**RINA Benefits**:
- Web-based admin panel
- Email-based user invitations
- Configuration UI
- Audit logs

---

## 🔄 CORE BUSINESS WORKFLOWS

### Workflow 1: Annual Budget Planning

**Trigger**: Start of fiscal year

**Actors**: Accountant

**Steps**:
1. **Select Program & Period**
   - Choose program (HIV, TB, Malaria)
   - Select fiscal year
   - System loads appropriate form template

2. **Enter Budget Activities**
   - For each category (HR, TRC, HPE, PAC):
     - Enter activity details
     - Specify frequency (daily, weekly, monthly, quarterly, annual)
     - Enter unit cost
     - Enter count for each quarter (Q1-Q4)
     - Add justification comments
   - System auto-calculates: Amount = Frequency × Unit Cost × Count

3. **Review Calculations**
   - System displays quarterly totals
   - System displays annual total
   - System highlights any validation errors

4. **Save Draft**
   - Save work in progress
   - Return later to continue

5. **Submit for Approval**
   - Final validation check
   - Submit to DAF for review
   - System sends notification

**Business Rules**:
- All required fields must be filled
- Unit costs must be positive numbers
- Quarterly counts must be non-negative
- Total budget must not exceed program allocation
- Comments required for high-value items

**System Validations**:
- Numeric field validation
- Required field checks
- Budget ceiling checks
- Duplicate activity prevention

---

### Workflow 2: Quarterly Execution Tracking

**Trigger**: End of each quarter

**Actors**: Accountant

**Steps**:
1. **Select Period**
   - Choose program and quarter
   - System checks if period is locked

2. **Enter Receipts (Section A)**
   - Other incomes
   - Transfers from SPIU/RBC
   - System calculates total receipts

3. **Enter Expenditures (Section B)**
   - Compensation of employees
   - Monitoring & Evaluation
   - Client support
   - Other program activities
   - Overheads
   - Transfers
   - System calculates total expenditures

4. **Review Auto-Calculations**
   - **Section C**: Surplus/Deficit = A - B
   - System validates against budget

5. **Enter Financial Position (Section D)**
   - Cash balances
   - Petty cash
   - Accounts receivable
   - System calculates total assets

6. **Enter Liabilities (Section E)**
   - Accounts payable
   - VAT refunds
   - System calculates total liabilities

7. **Validate Accounting Equation**
   - **Section F**: Net Assets = D - E
   - **Section G**: Closing Balance
   - System validates: F = G
   - If not equal, system shows error

8. **Attach Documents**
   - Upload bank statements
   - Upload receipts
   - Upload supporting documents

9. **Submit for Approval**
   - Final validation
   - Submit to DAF
   - System sends notification

**Business Rules**:
- Period must not be locked
- All sections must balance
- Accounting equation must hold: Assets - Liabilities = Net Assets
- Cumulative balance must match previous quarter's closing
- Expenditures should not exceed budget (warning, not error)

**System Validations**:
- Period lock check
- Accounting equation validation
- Cumulative balance validation
- Budget variance check (warning)
- Required document attachments

---

### Workflow 3: Financial Report Approval (DAF Level)

**Trigger**: Accountant submits report

**Actors**: DAF

**Steps**:
1. **View Approval Queue**
   - System shows pending reports
   - Sorted by submission date
   - Filtered by district/province

2. **Open Report for Review**
   - View submitted data
   - View budget vs actual comparison
   - View attached documents
   - View historical trends

3. **Review Data Quality**
   - Check for completeness
   - Verify calculations
   - Review variances
   - Check supporting documents

4. **Make Decision**
   - **Option A: Approve**
     - Add approval comments
     - Submit approval
     - Report moves to DG queue
     - System sends notification to accountant and DG
   
   - **Option B: Request Changes**
     - Add specific feedback
     - Specify required corrections
     - Return to accountant
     - System sends notification with feedback
   
   - **Option C: Reject**
     - Add rejection reason
     - Reject report
     - System sends notification to accountant

5. **Track Status**
   - Monitor approval progress
   - View approval history
   - Generate approval reports

**Business Rules**:
- DAF can only review reports from their jurisdiction
- Comments required for rejection or change requests
- Approval is final (cannot be undone without admin)
- Audit log records all actions

---

### Workflow 4: Financial Report Approval (DG Level)

**Trigger**: DAF approves report

**Actors**: DG

**Steps**:
1. **View Approval Queue**
   - System shows DAF-approved reports
   - National-level view
   - Priority sorting

2. **Review Report**
   - View all data and DAF comments
   - Review executive summary
   - Check compliance indicators

3. **Make Final Decision**
   - **Option A: Final Approval**
     - Add final comments
     - Approve report
     - System locks reporting period
     - System creates snapshot
     - System sends notifications
   
   - **Option B: Request Changes**
     - Add feedback
     - Return to accountant (via DAF)
     - System sends notifications
   
   - **Option C: Reject**
     - Add rejection reason
     - Reject report
     - System sends notifications

4. **Period Locking**
   - Upon final approval, system automatically:
     - Locks the reporting period
     - Prevents further edits
     - Creates historical snapshot
     - Archives report

**Business Rules**:
- DG has national-level access
- Final approval locks period permanently
- Locked periods require admin unlock
- Snapshot preserves data integrity

---

### Workflow 5: Financial Statement Generation

**Trigger**: User requests statement

**Actors**: Accountant, DAF, DG, Admin

**Steps**:
1. **Select Statement Type**
   - Revenue & Expenditure
   - Balance Sheet
   - Cash Flow
   - Changes in Net Assets
   - Budget vs Actual

2. **Configure Parameters**
   - Select program
   - Select facility (or aggregate level)
   - Select period (quarter or annual)
   - Select format (Excel, PDF, Word)

3. **System Processing**
   - Collect data from planning and execution tables
   - Apply event mappings
   - Execute statement template formulas
   - Calculate totals and subtotals
   - Validate accounting equations
   - Format output

4. **Review Statement**
   - View generated statement
   - Verify calculations
   - Check for errors

5. **Export Statement**
   - Download in selected format
   - Print if needed
   - Share with stakeholders

**Business Rules**:
- Users can only generate statements for accessible facilities
- Statements reflect approved data only
- Historical statements use snapshots
- Aggregated statements sum child facilities

---

### Workflow 6: User Management (Admin)

**Trigger**: New staff member or role change

**Actors**: System Administrator

**Steps**:
1. **Create User Account**
   - Enter name and email
   - Select role (accountant, admin, DAF, DG)
   - Assign facility (for accountants)
   - System generates verification email

2. **User Receives Email**
   - Email contains setup link with token
   - User clicks link

3. **User Account Setup**
   - User lands on setup page
   - Email pre-filled (read-only)
   - User creates password
   - User confirms password
   - System validates password strength

4. **Account Activation**
   - System verifies token
   - System activates account
   - User redirected to login
   - System sends welcome email

**Business Rules**:
- Email must be unique
- Verification token expires in 24 hours
- Password must meet complexity requirements
- Accountants must be assigned to a facility
- Admin can resend verification email

---

## 📊 KEY BUSINESS ENTITIES

### Program
**Definition**: A health initiative funded by donors

**Attributes**:
- Code (HIV, TB, MALARIA)
- Name
- Status (ACTIVE, INACTIVE, ARCHIVED)
- Budget allocation

**Business Rules**:
- Each program has separate budget tracking
- Programs have different activity categories
- Programs may have different approval workflows

---

### Facility
**Definition**: A healthcare service delivery point

**Types**:
- Hospital (district or referral)
- Health Center

**Attributes**:
- Name
- Type
- District
- Province
- Status

**Business Rules**:
- Each facility has unique accountant
- Facilities roll up to districts
- Districts roll up to provinces
- Different activity sets by facility type

---

### Reporting Period
**Definition**: A fiscal time period for financial reporting

**Types**:
- Annual
- Quarterly (Q1, Q2, Q3, Q4)

**Attributes**:
- Year
- Period type
- Start date
- End date
- Status (ACTIVE, LOCKED)

**Business Rules**:
- Only one active period per type
- Locked periods cannot be edited
- Periods must not overlap
- Quarters must align with fiscal year

---

### Budget Activity
**Definition**: A planned financial activity with cost estimation

**Attributes**:
- Category
- Description
- Frequency (daily, weekly, monthly, quarterly, annual)
- Unit cost
- Quarterly counts (Q1-Q4)
- Calculated amounts (auto)
- Total (auto)

**Business Rules**:
- Amount = Frequency × Unit Cost × Count
- Total = Sum of quarterly amounts
- Activities must belong to valid category
- High-value activities require justification

---

### Execution Entry
**Definition**: Actual financial transaction or balance

**Attributes**:
- Category
- Activity
- Quarterly values (Q1-Q4)
- Cumulative balance (auto)
- Comments

**Business Rules**:
- Must align with budget activities
- Cumulative balance = Previous + Current
- Accounting equation must balance
- Cannot exceed budget by >20% without approval

---

### Financial Event
**Definition**: A double-entry accounting transaction

**Attributes**:
- Event code
- Description
- Type (REVENUE, EXPENSE, ASSET, LIABILITY, EQUITY)
- Direction (DEBIT, CREDIT)
- Amount
- Quarter
- Date

**Business Rules**:
- Every transaction has equal debits and credits
- Events map to statement line items
- Events link to source activities
- Events are immutable once approved

---

### Financial Report
**Definition**: A submitted financial report for approval

**Attributes**:
- Facility
- Program
- Period
- Status (DRAFT, PENDING_DAF, PENDING_DG, APPROVED, REJECTED)
- Submission date
- Approval dates
- Comments

**Business Rules**:
- Reports follow approval workflow
- Approved reports lock period
- Rejected reports return to accountant
- Reports create audit trail

---

## 💼 BUSINESS RULES SUMMARY

### Budget Planning Rules
1. Annual budgets must be submitted before fiscal year start
2. Budget must not exceed program allocation
3. All activities must have justification comments
4. High-value items (>$10,000) require detailed justification
5. Budget revisions require approval

### Execution Tracking Rules
1. Execution data entered quarterly
2. Accounting equation must balance: Assets - Liabilities = Net Assets
3. Cumulative balances must match previous quarter
4. Expenditures exceeding budget by >20% trigger warnings
5. Supporting documents required for large transactions

### Approval Workflow Rules
1. Reports must pass validation before submission
2. DAF approval required before DG review
3. Rejection returns report to accountant
4. Change requests must specify required corrections
5. Final approval locks period

### Period Locking Rules
1. Periods lock automatically upon final approval
2. Locked periods cannot be edited
3. Admin can unlock periods with justification
4. Unlocking creates audit log entry
5. Snapshots preserve historical data

### Access Control Rules
1. Accountants access only their facility
2. DAF accesses facilities in their jurisdiction
3. DG accesses all facilities
4. Admin has full system access
5. Users cannot modify locked periods

### Data Validation Rules
1. All monetary values must be non-negative
2. Percentages must be 0-100
3. Dates must be within reporting period
4. Required fields must be filled
5. Calculations must be accurate

---

## 📈 KEY PERFORMANCE INDICATORS (KPIs)

### Financial KPIs
- **Budget Utilization Rate**: (Actual / Budget) × 100
- **Variance**: Actual - Budget
- **Variance Percentage**: ((Actual - Budget) / Budget) × 100
- **Burn Rate**: Expenditure per month
- **Cash Balance**: Current cash position

### Operational KPIs
- **Report Submission Rate**: % of facilities submitting on time
- **Approval Cycle Time**: Days from submission to final approval
- **Rejection Rate**: % of reports rejected
- **Revision Rate**: % of reports requiring changes
- **Data Quality Score**: % of reports passing validation first time

### Compliance KPIs
- **Audit Findings**: Number of audit issues
- **Policy Violations**: Number of policy breaches
- **Document Completeness**: % of reports with all documents
- **Period Lock Compliance**: % of periods locked on time

---

## 🎯 SUCCESS METRICS

### User Adoption
- Number of active users
- Login frequency
- Feature usage rates
- User satisfaction scores

### Efficiency Gains
- Time to complete budget planning (vs. manual)
- Time to generate financial statements (vs. manual)
- Approval cycle time reduction
- Error rate reduction

### Data Quality
- Validation error rate
- Rejection rate
- Revision rate
- Audit findings

### Compliance
- On-time submission rate
- Period lock compliance
- Document completeness
- Audit pass rate

---

## 🚧 BUSINESS CONSTRAINTS

### Regulatory Constraints
- Must comply with government accounting standards
- Must meet donor reporting requirements
- Must maintain audit trail
- Must ensure data security

### Operational Constraints
- Limited internet connectivity in some facilities
- Varying levels of user computer literacy
- Limited IT support in remote areas
- Multiple languages (English, Kinyarwanda)

### Technical Constraints
- Must work on low-bandwidth connections
- Must support older browsers
- Must handle concurrent users
- Must scale to 100+ facilities

### Financial Constraints
- Limited budget for infrastructure
- Limited budget for training
- Limited budget for support staff

---

## 🔮 FUTURE BUSINESS NEEDS

### Short-term (6-12 months)
1. Mobile app for field data entry
2. Offline mode for remote areas
3. SMS notifications for approvals
4. Bulk data import from Excel
5. Advanced search and filtering

### Medium-term (1-2 years)
1. Integration with national accounting system
2. Real-time budget monitoring dashboard
3. Predictive analytics for budget planning
4. Automated anomaly detection
5. Multi-language support (Kinyarwanda)

### Long-term (2-5 years)
1. AI-powered budget recommendations
2. Blockchain for audit trail
3. Integration with donor systems
4. Advanced forecasting models
5. Mobile-first redesign

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*System: RINA Healthcare Financial Management*
