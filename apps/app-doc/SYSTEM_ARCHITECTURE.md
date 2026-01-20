# RINA - Healthcare Financial Management System
## Complete System Architecture & Analysis

---

## 🎯 EXECUTIVE SUMMARY

**RINA** is a comprehensive financial management system designed for healthcare facilities in Rwanda, enabling budget planning, execution tracking, and automated financial reporting for health programs (HIV, TB, Malaria).

### Value Proposition
- **Centralized Financial Management**: Single platform for planning, execution, and reporting across multiple facilities
- **Automated Compliance**: Generates donor-required financial statements automatically
- **Multi-level Hierarchy**: Supports province → district → facility organizational structure
- **Program-Specific Tracking**: Separate workflows for different health programs
- **Approval Workflows**: Built-in approval chains for financial reports (DAF → DG)
- **Real-time Validation**: Automatic accounting equation validation and budget checks

### Target Users
- **Accountants**: Hospital and health center accountants (data entry)
- **Administrators**: District/Province/National level administrators (oversight)
- **DAF (Director of Administration & Finance)**: First-level approvers
- **DG (Director General)**: Final approvers

---

## 🏗️ SYSTEM ARCHITECTURE

### Technology Stack

#### Frontend (Client)
```
Framework: Next.js 15.3.3 (React 19)
Language: TypeScript 5.x
UI Library: Radix UI + shadcn/ui
Styling: Tailwind CSS 4.x
State Management: Zustand + TanStack Query
Forms: React Hook Form + Zod validation
Charts: Recharts
Authentication: Better Auth
Port: 2222
```

#### Backend (Server)
```
Framework: Hono (lightweight web framework)
Language: TypeScript 5.x
Runtime: Node.js
Database: PostgreSQL (via Drizzle ORM)
Authentication: Better Auth
API Documentation: OpenAPI (Scalar)
Background Jobs: Bull (Redis-based)
Email: Resend / Nodemailer
Port: 9999
```

#### Infrastructure
```
Monorepo: pnpm workspaces
Process Manager: PM2 (ecosystem.config.js)
Reverse Proxy: Nginx
Deployment: Linux server (197.243.104.5)
```

### Monorepo Structure
```
rina/
├── apps/
│   ├── client/          # Next.js frontend application
│   ├── server/          # Hono backend API
│   └── app-doc/         # System documentation
├── packages/
│   └── api-client/      # Shared API client library
└── [config files]       # Root-level configuration
```

---

## 📦 CORE MODULES & INTERCONNECTIONS

### 1. **Planning Module** 
**Purpose**: Annual budget planning with quarterly breakdown

**Key Features**:
- Activity-based budgeting by category (HR, TRC, HPE, PAC)
- Automatic calculations: `Amount = Frequency × Unit Cost × Count`
- Quarterly allocation (Q1-Q4)
- Program-specific (HIV, TB, Malaria)
- Facility-type specific (Hospital vs Health Center)

**Database Tables**:
- `planning_categories` - Budget categories
- `planning_activities` - Specific activities within categories
- `planning_data` - Actual planning entries with calculations

**API Routes**: `/api/planning/*`

**Frontend**: `/dashboard/planning/*`

---

### 2. **Execution Module**
**Purpose**: Quarterly actual expenditure and balance tracking

**Key Features**:
- Quarterly data entry (Q1-Q4)
- Automatic cumulative balance calculation
- Accounting equation validation (Assets - Liabilities = Net Assets)
- Receipt and expenditure tracking
- Financial position monitoring

**Categories**:
- **A. Receipts**: Income sources
- **B. Expenditures**: All spending categories
- **C. Surplus/Deficit**: Auto-calculated (A - B)
- **D. Financial Assets**: Cash, receivables
- **E. Financial Liabilities**: Payables, VAT
- **F. Net Financial Assets**: Auto-calculated (D - E)
- **G. Closing Balance**: Validated against F

**Database Tables**:
- `categories` - Execution categories
- `activities` - Execution activities
- `execution_data` - Actual execution entries

**API Routes**: `/api/execution/*`

**Frontend**: `/dashboard/execution/*`

---

### 3. **Financial Reporting Engine**
**Purpose**: Automated generation of donor-required financial statements

**Statement Types**:
1. **Revenue & Expenditure Statement**: Income vs expenses
2. **Balance Sheet**: Assets, liabilities, equity snapshot
3. **Cash Flow Statement**: Operating, investing, financing activities
4. **Changes in Net Assets**: Opening → Changes → Closing
5. **Budget vs Actual**: Variance analysis ($ and %)

**Architecture**:
```
Statement Engine (Factory Pattern)
├── Core Engine (base functionality)
├── Revenue-Expenditure Engine
├── Balance Sheet Engine
├── Cash Flow Engine
├── Net Assets Engine
└── Budget vs Actual Engine
```

**Key Components**:
- **Statement Templates**: Configurable line items with formulas
- **Event Mappings**: Links activities to statement lines
- **Data Collection Service**: Aggregates data from planning/execution
- **Processors**: Calculate totals, subtotals, variances
- **Generators**: Export to Excel, PDF, Word

**Database Tables**:
- `statement_templates` - Statement structure definitions
- `events` - Financial event definitions
- `event_mappings` - Activity-to-event mappings
- `financial_events` - Actual financial transactions

**API Routes**: `/api/financial-reports/*`, `/api/statements/*`

**Frontend**: `/dashboard/reports/*`

---

### 4. **Approval Workflow System**
**Purpose**: Multi-level approval for financial reports

**Workflow**:
```
Accountant (Submit) 
    ↓
DAF Review (Approve/Reject/Request Changes)
    ↓
DG Review (Approve/Reject/Request Changes)
    ↓
Final Approval
```

**Features**:
- Status tracking (DRAFT, PENDING_DAF, PENDING_DG, APPROVED, REJECTED)
- Audit logging (approval_audit_log)
- Email notifications
- Comment/feedback system
- Version control

**Database Tables**:
- `financial_reports` - Report metadata and status
- `financial_report_workflow_logs` - Approval history
- `approval_audit_log` - Detailed audit trail

**API Routes**: `/api/admin/approval/*`

**Frontend**: `/dashboard/daf-queue/*`, `/dashboard/dg-queue/*`

---

### 5. **Period Locking & Snapshot System**
**Purpose**: Prevent modifications to closed periods and maintain historical data

**Features**:
- Lock reporting periods after approval
- Create snapshots of financial data
- Prevent backdated entries
- Audit trail for lock/unlock actions

**Database Tables**:
- `period_locks` - Lock status by period
- `report_versions` - Historical snapshots
- `period_lock_audit_log` - Lock/unlock history

**Middleware**: `validate-period-lock.ts`

---

### 6. **Facility Hierarchy & Access Control**
**Purpose**: Multi-level organizational structure with role-based access

**Hierarchy**:
```
National Level (Admin)
    ↓
Province Level
    ↓
District Level
    ↓
Facility Level (Hospital / Health Center)
```

**Access Control**:
- **Admin**: Full system access
- **Accountant**: Facility-specific access only
- **DAF**: District/Province level approval
- **DG**: National level approval

**Database Tables**:
- `provinces` - Province definitions
- `districts` - District definitions
- `facilities` - Healthcare facilities
- `users` - User accounts with roles
- `members` - User-facility assignments

**Services**: `facility-hierarchy.service.ts`, `scope-access-control.ts`

---

### 7. **Document Management**
**Purpose**: Attach supporting documents to financial reports

**Features**:
- File upload (PDF, Excel, Word, Images)
- Document categorization
- Version tracking
- Secure storage

**Database Tables**:
- `documents` - Document metadata

**API Routes**: `/api/documents/*`

**Storage**: `apps/server/uploads/`

---

### 8. **Analytics & Dashboard**
**Purpose**: Real-time financial insights and KPIs

**Features**:
- Budget utilization rates
- Expenditure trends
- Facility comparisons
- Program performance metrics
- Variance analysis

**Database Views**:
- `v_planning_category_totals` - Materialized view for performance

**API Routes**: `/api/dashboard/*`, `/api/analytics/*`

**Frontend**: `/dashboard/page.tsx`

---

### 9. **User Management & Authentication**
**Purpose**: Secure access control and user lifecycle management

**Features**:
- Email/password authentication
- Email verification workflow
- Password reset
- Session management
- Role-based permissions
- Admin user creation with email invitation

**Database Tables**:
- `users` - User accounts
- `account` - Authentication credentials
- `session` - Active sessions
- `verification` - Email verification tokens

**API Routes**: `/api/admin/users/*`

**Frontend**: `/dashboard/admin/users/*`

---

### 10. **Configuration Management**
**Purpose**: System-wide settings and customization

**Features**:
- Reporting period definitions
- Project type configurations
- Statement template customization
- Event mapping configuration

**Database Tables**:
- `reporting_periods` - Fiscal periods
- `projects` - Program definitions
- `system_configurations` - Global settings
- `configuration_audit_log` - Config change history

**API Routes**: `/api/admin/system-config/*`

---

## 🔄 DATA FLOW & INTERCONNECTIONS

### Planning → Execution → Reporting Flow

```
1. PLANNING PHASE (Annual)
   ↓
   Accountant enters planned activities
   ↓
   System calculates quarterly amounts
   ↓
   Data stored in planning_data
   
2. EXECUTION PHASE (Quarterly)
   ↓
   Accountant enters actual expenditures
   ↓
   System validates against budget
   ↓
   Data stored in execution_data
   
3. FINANCIAL EVENTS GENERATION
   ↓
   System maps activities to events
   ↓
   Creates financial_events (DEBIT/CREDIT)
   ↓
   Double-entry accounting maintained
   
4. STATEMENT GENERATION
   ↓
   Statement Engine collects data
   ↓
   Applies templates and formulas
   ↓
   Generates 5 financial statements
   
5. APPROVAL WORKFLOW
   ↓
   Accountant submits report
   ↓
   DAF reviews and approves
   ↓
   DG final approval
   ↓
   Period locked, snapshot created
```

### Key Integration Points

**Planning ↔ Execution**:
- Budget validation during execution entry
- Variance calculation (actual vs planned)
- Budget vs Actual statement generation

**Execution ↔ Financial Events**:
- Activity-to-event mappings
- Automatic debit/credit generation
- Double-entry bookkeeping

**Events ↔ Statements**:
- Event codes linked to statement lines
- Aggregation by event type
- Formula-based calculations

**Facilities ↔ All Modules**:
- All data scoped by facility
- Hierarchical aggregation (facility → district → province)
- Access control enforcement

---

## 🗄️ DATABASE ARCHITECTURE

### Schema Organization

**Core Entities**:
- Geographic: provinces, districts, facilities
- Projects: projects (HIV, TB, Malaria)
- Users: users, account, session, members

**Planning Domain**:
- planning_categories
- planning_activities
- planning_data

**Execution Domain**:
- categories
- activities
- execution_data

**Financial Domain**:
- events
- financial_events
- event_mappings
- category_event_mappings

**Reporting Domain**:
- statement_templates
- financial_reports
- report_versions

**Workflow Domain**:
- financial_report_workflow_logs
- approval_audit_log
- period_locks
- period_lock_audit_log

**Configuration Domain**:
- reporting_periods
- system_configurations
- configuration_audit_log

### Key Design Patterns

**Hierarchical Data**:
- Self-referencing foreign keys (parent_id)
- Used in: categories, statement_templates

**Audit Trails**:
- created_at, updated_at timestamps
- created_by, updated_by user references
- Dedicated audit log tables

**Generated Columns**:
- Automatic calculations (totals, balances)
- Database-level computation for consistency

**Materialized Views**:
- Pre-aggregated data for performance
- Example: v_planning_category_totals

**Soft Deletes**:
- Status fields instead of hard deletes
- Maintains referential integrity

---

## 🔐 SECURITY & PERMISSIONS

### Authentication
- Better Auth library
- Email/password with verification
- Session-based with tokens
- Password hashing (scrypt)

### Authorization Levels

**Admin**:
- Full system access
- User management
- System configuration
- All facilities visible

**Accountant**:
- Single facility access
- Data entry (planning, execution)
- Report submission
- Read-only for own facility

**DAF (Director Admin & Finance)**:
- District/Province level access
- Approval authority (first level)
- Multi-facility visibility

**DG (Director General)**:
- National level access
- Final approval authority
- All facilities visible

### Middleware Stack
```
Request
  ↓
CORS (cors.ts)
  ↓
Authentication (auth.ts)
  ↓
Facility Hierarchy (facility-hierarchy.ts)
  ↓
Period Lock Validation (validate-period-lock.ts)
  ↓
Approval Authorization (approval-auth.ts)
  ↓
Route Handler
```

---

## 📊 REPORTING CAPABILITIES

### Statement Generation Process

1. **Data Collection**:
   - Query planning_data for budget
   - Query execution_data for actuals
   - Query financial_events for transactions

2. **Event Aggregation**:
   - Group by event code
   - Sum by quarter and total
   - Apply debit/credit rules

3. **Template Application**:
   - Load statement template
   - Match events to line items
   - Apply formulas and calculations

4. **Hierarchy Processing**:
   - Calculate subtotals
   - Calculate section totals
   - Validate accounting equations

5. **Export Generation**:
   - Excel (ExcelJS)
   - PDF (jsPDF)
   - Word (docx)

### Statement-Specific Logic

**Revenue & Expenditure**:
- Revenue events (REVENUE type)
- Expense events (EXPENSE type)
- Net = Revenue - Expenses

**Balance Sheet**:
- Assets (ASSET type)
- Liabilities (LIABILITY type)
- Equity (EQUITY type)
- Equation: Assets = Liabilities + Equity

**Cash Flow**:
- Operating activities
- Investing activities
- Financing activities
- Net change in cash

**Changes in Net Assets**:
- Opening balance
- Add: Surplus/Deficit
- Add/Subtract: Other changes
- Closing balance

**Budget vs Actual**:
- Budget (from planning_data)
- Actual (from execution_data)
- Variance ($)
- Variance (%)

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Setup

**Server**: Linux (197.243.104.5)

**Process Management**:
```
PM2 Ecosystem
├── rina-client (Next.js on port 2222)
└── rina-server (Hono on port 9999)
```

**Reverse Proxy** (Nginx):
```
/rina/     → localhost:2222 (Client)
/_next/    → localhost:2222 (Static assets)
/api/      → localhost:9999 (Server)
```

**Database**: PostgreSQL (connection via environment variables)

**File Storage**: Local filesystem (`apps/server/uploads/`)

**Logs**: `logs/pm2-*.log`

---

## 🔧 BACKGROUND JOBS

### Scheduled Tasks

**Outdated Reports Detection**:
- Runs every hour
- Checks for reports past due date
- Sends notifications
- Updates report status

**Implementation**: Bull queue with Redis

**Job File**: `apps/server/src/jobs/detect-outdated-reports.ts`

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Database Level
- Composite indexes on foreign keys
- Materialized views for aggregations
- Generated columns for calculations
- Query optimization with proper joins

### Application Level
- TanStack Query for client-side caching
- Zustand for efficient state management
- React Server Components (Next.js 15)
- API response pagination

### Frontend Level
- Code splitting (Next.js automatic)
- Image optimization
- Lazy loading
- Debounced search inputs

---

## 🧪 TESTING STRATEGY

### Test Files Location
`apps/server/src/tests/`

### Test Coverage
- Scope access control
- Facility hierarchy validation
- Context resolution
- Approval workflows
- Financial report generation

### Testing Framework
- Vitest
- Configuration: `vitest.config.ts`

---

## 📝 API DOCUMENTATION

### OpenAPI Specification
- Auto-generated from Zod schemas
- Available at: `/reference` endpoint
- Interactive API explorer (Scalar)

### API Structure
```
/api/
├── /planning/*              # Planning CRUD
├── /execution/*             # Execution CRUD
├── /financial-reports/*     # Report generation
├── /statements/*            # Statement templates
├── /admin/*                 # Admin operations
├── /dashboard/*             # Analytics
├── /facilities/*            # Facility management
├── /projects/*              # Project management
├── /documents/*             # Document upload
└── /analytics/*             # Reporting analytics
```

---

## 🎨 FRONTEND ARCHITECTURE

### Page Structure
```
/dashboard
├── /                        # Dashboard home
├── /planning/*              # Planning module
├── /execution/*             # Execution module
├── /reports/*               # Financial statements
├── /compiled/*              # Compiled reports
├── /daf-queue/*             # DAF approval queue
├── /dg-queue/*              # DG approval queue
└── /admin/*                 # Admin panel
    ├── /users/*             # User management
    └── /system-config/*     # System settings
```

### Component Organization
```
apps/client/
├── app/                     # Next.js app router
├── components/              # Shared UI components
├── features/                # Feature-specific components
│   ├── planning/
│   ├── execution/
│   ├── reports/
│   ├── compilation/
│   └── users/
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities
├── providers/               # Context providers
├── stores/                  # Zustand stores
└── types/                   # TypeScript types
```

### State Management Strategy

**Server State**: TanStack Query
- API data fetching
- Caching and invalidation
- Optimistic updates

**Client State**: Zustand
- Form state
- UI state (modals, filters)
- User preferences

**Form State**: React Hook Form
- Form validation
- Field management
- Error handling

---

## 🔄 MIGRATION & SEEDING

### Database Migrations
Location: `apps/server/src/db/migrations/`

Key Migrations:
- 0000: Initial schema
- 0001-0006: Approval workflow
- 0007: Snapshot and period locking
- 0008: Hierarchy performance indexes
- 0009-0012: Financial statement enhancements

### Seed Data
Location: `apps/server/src/db/seeds/`

Seed Scripts:
- `index.ts` - Main seed orchestrator
- `planning-activities-standalone.ts`
- `execution-activities-standalone.ts`
- `events-standalone.ts`
- `event-mappings-standalone.ts`
- `statement-templates-standalone.ts`

---

## 🐛 KNOWN ISSUES & LIMITATIONS

### Current Limitations
1. **Manual Configuration**: Event mappings require code changes
2. **Single Currency**: No multi-currency support
3. **Limited Bulk Operations**: No bulk import/export for planning data
4. **File Storage**: Local filesystem (not cloud storage)
5. **Email Service**: Requires external SMTP configuration

### Technical Debt
- Some hardcoded business rules
- Limited test coverage
- No automated E2E tests
- Documentation gaps in some modules

---

## 🎯 IMPROVEMENT OPPORTUNITIES

### Short-term (Quick Wins)
1. Add bulk import/export for planning data
2. Implement data validation rules UI
3. Add more comprehensive error messages
4. Improve loading states and skeleton screens
5. Add keyboard shortcuts for power users

### Medium-term (Feature Enhancements)
1. Multi-currency support
2. Advanced analytics dashboard
3. Custom report builder
4. Mobile-responsive improvements
5. Offline mode support
6. Real-time collaboration features

### Long-term (Strategic)
1. AI-powered budget recommendations
2. Predictive analytics
3. Integration with external accounting systems
4. Mobile native apps
5. Multi-tenant architecture
6. Cloud storage integration
7. Advanced workflow customization

---

## 📚 DOCUMENTATION REFERENCES

### Internal Documentation
- `/apps/server/src/docs/` - Technical documentation
- `/apps/server/src/db/seeds/README.md` - Seeding guide
- `/apps/server/src/lib/statement-engine/README.md` - Statement engine docs
- Various `*.md` files throughout codebase

### External Resources
- Next.js: https://nextjs.org/docs
- Hono: https://hono.dev
- Drizzle ORM: https://orm.drizzle.team
- Better Auth: https://better-auth.com
- Radix UI: https://radix-ui.com

---

## 🤝 DEVELOPMENT WORKFLOW

### Local Development
```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev  # Runs both client and server

# Database operations
cd apps/server
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Drizzle Studio

# Testing
pnpm test         # Run tests
```

### Production Deployment
```bash
# Build applications
pnpm build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 logs
pm2 monit
```

---

## 📞 SYSTEM CONTACTS & ROLES

### Key Stakeholders
- **End Users**: Hospital and health center accountants
- **Approvers**: DAF and DG officials
- **Administrators**: System administrators
- **Donors**: International health program funders
- **Government**: Ministry of Health officials

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*System: RINA Healthcare Financial Management*
