# RINA Quick Reference Guide

Fast lookup for common tasks and information.

---

## 🚀 Quick Start

### Local Development Setup
```bash
# Install dependencies
pnpm install

# Start both client and server
pnpm dev

# Or start individually
cd apps/client && pnpm dev  # Client on port 2222
cd apps/server && pnpm dev  # Server on port 9999
```

### Database Operations
```bash
cd apps/server

# Generate migration from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with initial data
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Production Deployment
```bash
# Build applications
pnpm build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 logs
pm2 monit
pm2 status
```

---

## 📁 Project Structure

```
rina/
├── apps/
│   ├── client/              # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # Shared UI components
│   │   ├── features/       # Feature modules
│   │   └── lib/            # Utilities
│   ├── server/             # Hono backend
│   │   └── src/
│   │       ├── api/        # API routes
│   │       ├── db/         # Database schema & migrations
│   │       ├── lib/        # Services & utilities
│   │       └── middlewares/# Request middlewares
│   └── app-doc/            # System documentation
└── packages/
    └── api-client/         # Shared API client
```

---

## 🔑 Environment Variables

### Client (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/rina

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:2222

# API
NEXT_PUBLIC_API_URL=http://localhost:9999
```

### Server (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/rina

# Server
PORT=9999
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:2222

# Email
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@example.com

# Admin User (for seeding)
CREATE_ADMIN=true
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=kinyarwanda
```

---

## 🗄️ Database Quick Reference

### Key Tables

**Users & Auth**:
- `users` - User accounts
- `account` - Authentication credentials
- `session` - Active sessions
- `members` - User-facility assignments

**Geographic**:
- `provinces` - Province definitions
- `districts` - District definitions
- `facilities` - Healthcare facilities

**Planning**:
- `planning_categories` - Budget categories
- `planning_activities` - Planning activities
- `planning_data` - Budget entries

**Execution**:
- `categories` - Execution categories
- `activities` - Execution activities
- `execution_data` - Actual expenditure entries

**Financial**:
- `events` - Financial event definitions
- `financial_events` - Transaction entries
- `event_mappings` - Activity-to-event mappings

**Reporting**:
- `statement_templates` - Statement definitions
- `financial_reports` - Report metadata
- `report_versions` - Historical snapshots

**Workflow**:
- `financial_report_workflow_logs` - Approval history
- `period_locks` - Period lock status
- `approval_audit_log` - Audit trail

### Common Queries

```sql
-- Find user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get facility hierarchy
SELECT f.name, d.name as district, p.name as province
FROM facilities f
JOIN districts d ON f.district_id = d.id
JOIN provinces p ON d.province_id = p.id;

-- Check report status
SELECT id, facility_id, status, created_at
FROM financial_reports
WHERE status = 'PENDING_DAF'
ORDER BY created_at DESC;

-- View planning data for a facility
SELECT pc.name as category, pa.name as activity, pd.*
FROM planning_data pd
JOIN planning_activities pa ON pd.activity_id = pa.id
JOIN planning_categories pc ON pa.category_id = pc.id
WHERE pd.facility_id = 1;
```

---

## 🛣️ API Routes Reference

### Authentication
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/sign-up` - User registration
- `GET /api/auth/session` - Get current session

### Planning
- `GET /api/planning` - List planning entries
- `POST /api/planning` - Create planning entry
- `GET /api/planning/:id` - Get planning entry
- `PUT /api/planning/:id` - Update planning entry
- `DELETE /api/planning/:id` - Delete planning entry

### Execution
- `GET /api/execution` - List execution entries
- `POST /api/execution` - Create execution entry
- `GET /api/execution/:id` - Get execution entry
- `PUT /api/execution/:id` - Update execution entry
- `DELETE /api/execution/:id` - Delete execution entry

### Financial Reports
- `GET /api/financial-reports` - List reports
- `POST /api/financial-reports` - Create report
- `GET /api/financial-reports/:id` - Get report
- `PUT /api/financial-reports/:id` - Update report
- `POST /api/financial-reports/:id/submit` - Submit for approval
- `POST /api/financial-reports/:id/approve` - Approve report
- `POST /api/financial-reports/:id/reject` - Reject report

### Statements
- `GET /api/statements/revenue-expenditure` - Generate R&E statement
- `GET /api/statements/balance-sheet` - Generate balance sheet
- `GET /api/statements/cash-flow` - Generate cash flow
- `GET /api/statements/net-assets` - Generate net assets statement
- `GET /api/statements/budget-vs-actual` - Generate budget comparison

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/facilities` - List facilities
- `GET /api/admin/system-config` - Get system configuration

---

## 👤 User Roles & Permissions

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **Admin** | System-wide | All operations, user management, configuration |
| **DG** | National | All facilities, final approval, read-only data |
| **DAF** | District/Province | Assigned facilities, first-level approval |
| **Accountant** | Single facility | Data entry, report submission for own facility |

---

## 🔄 Common Workflows

### Create New User (Admin)
1. Navigate to `/dashboard/admin/users`
2. Click "Create User"
3. Fill in: Name, Email, Role, Facility (if accountant)
4. Submit - verification email sent automatically
5. User receives email with setup link
6. User creates password and activates account

### Submit Budget Plan (Accountant)
1. Navigate to `/dashboard/planning/new`
2. Select program and fiscal year
3. Enter activities by category
4. System auto-calculates amounts
5. Review totals
6. Save draft or submit for approval

### Enter Quarterly Execution (Accountant)
1. Navigate to `/dashboard/execution/new`
2. Select program and quarter
3. Enter receipts (Section A)
4. Enter expenditures (Section B)
5. Enter financial position (Sections D, E)
6. System validates accounting equation
7. Attach supporting documents
8. Submit for approval

### Approve Report (DAF/DG)
1. Navigate to approval queue (`/dashboard/daf-queue` or `/dashboard/dg-queue`)
2. Click on pending report
3. Review data and documents
4. Choose action:
   - Approve: Add comments, submit
   - Request Changes: Specify corrections needed
   - Reject: Add rejection reason
5. System sends notifications

### Generate Financial Statement
1. Navigate to `/dashboard/reports`
2. Select statement type
3. Configure parameters:
   - Program
   - Facility (or aggregate level)
   - Period
   - Format (Excel/PDF/Word)
4. Click "Generate"
5. Review statement
6. Download or print

---

## 🐛 Troubleshooting

### Common Issues

**Cannot login**:
- Check email is verified
- Check password is correct
- Check account is not locked
- Check database connection

**Database connection error**:
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Check database exists
- Check user has permissions

**Port already in use**:
```bash
# Find process using port
netstat -ano | findstr :2222
netstat -ano | findstr :9999

# Kill process (Windows)
taskkill /PID <process_id> /F
```

**Migration fails**:
```bash
# Check current migration status
cd apps/server
pnpm db:studio

# Rollback if needed (manual)
# Then re-run migration
pnpm db:migrate
```

**Seed fails**:
- Check database is empty or has compatible schema
- Check environment variables are set
- Check database connection
- Review error message for specific issue

---

## 📊 Monitoring & Logs

### PM2 Logs
```bash
# View all logs
pm2 logs

# View specific app logs
pm2 logs rina-client
pm2 logs rina-server

# Clear logs
pm2 flush

# Log files location
logs/pm2-client-error.log
logs/pm2-client-out.log
logs/pm2-server-error.log
logs/pm2-server-out.log
```

### Database Logs
```bash
# PostgreSQL logs location (varies by OS)
# Linux: /var/log/postgresql/
# Windows: C:\Program Files\PostgreSQL\<version>\data\log\
```

---

## 🔧 Useful Commands

### pnpm Commands
```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm --filter @rina/client add <package>
pnpm --filter @rina/server add <package>

# Run script in all workspaces
pnpm -r <script>

# Run script in specific workspace
pnpm --filter @rina/client <script>
```

### Database Commands
```bash
# Connect to database
psql -U postgres -d rina

# Backup database
pg_dump -U postgres rina > backup.sql

# Restore database
psql -U postgres rina < backup.sql

# Drop and recreate database
dropdb -U postgres rina
createdb -U postgres rina
```

### Git Commands
```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature

# Update from main
git checkout main
git pull
git checkout feature/your-feature
git merge main
```

---

## 📞 Quick Links

### Local Development
- **Client**: http://localhost:2222
- **Server**: http://localhost:9999
- **API Docs**: http://localhost:9999/reference
- **Drizzle Studio**: http://localhost:4983 (after `pnpm db:studio`)

### Production
- **Application**: http://197.243.104.5/rina/
- **API**: http://197.243.104.5/api/

### Documentation
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Business Domain](./BUSINESS_DOMAIN_ANALYSIS.md)
- [Technical Deep Dive](./TECHNICAL_DEEP_DIVE.md)
- [System Diagrams](./SYSTEM_DIAGRAMS.md)

---

## 🎯 Performance Tips

### Frontend Optimization
- Use React Server Components where possible
- Implement proper loading states
- Use TanStack Query for caching
- Lazy load heavy components
- Optimize images with Next.js Image

### Backend Optimization
- Use database indexes
- Implement pagination
- Cache frequent queries
- Use connection pooling
- Optimize N+1 queries

### Database Optimization
- Create indexes on foreign keys
- Use materialized views for aggregations
- Analyze query plans with EXPLAIN
- Regular VACUUM and ANALYZE
- Monitor slow queries

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong BETTER_AUTH_SECRET
- [ ] Enable HTTPS in production
- [ ] Set secure CORS policy
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (via ORM)

---

## 📝 Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use const for immutable values
- Avoid `any` type
- Document complex functions

### React
- Use functional components
- Prefer hooks over class components
- Extract reusable logic to custom hooks
- Use proper TypeScript types for props
- Implement error boundaries

### Database
- Use Drizzle ORM for queries
- Parameterize all queries
- Use transactions for multi-step operations
- Handle errors gracefully
- Log slow queries

---

*Last Updated: January 2026*  
*Quick Reference Version: 1.0*
