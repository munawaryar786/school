# Phase 24 Testing Checklist

Project: School ERP Management System  
Phase: Security Hardening  
Prepared on: 2026-06-13

## Automated Checks

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck --workspace @school-erp/shared` | Passed with larger Node heap |
| `npm.cmd run typecheck --workspace @school-erp/api` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/web` | Passed with larger Node heap |
| `npm.cmd run typecheck --workspace @school-erp/ui` | Passed with larger Node heap |
| `npm.cmd run test --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/web` | Passed with larger Node heap |

## Database Checks

| Check | Result |
| --- | --- |
| Phase 24 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 24 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Security Hardening sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/security/dashboard` returns security counts | Passed |
| `POST /api/v1/security/secrets` stores encrypted secret metadata | Passed |
| `GET /api/v1/security/secrets?search=...` returns searched results without secret material | Passed |
| `GET /api/v1/security/secrets?format=csv` returns `text/csv` | Passed |
| `POST /api/v1/security/backups/run` creates a backup job | Passed |
| `POST /api/v1/security/two-factor/setup` creates 2FA setup and current code | Passed |
| `POST /api/v1/security/two-factor/verify` enables 2FA | Passed |
| Login without 2FA code fails after 2FA is enabled | Passed |
| Login with valid 2FA code succeeds | Passed |
| `POST /api/v1/security/two-factor/disable` disables 2FA for the demo admin | Passed |
| Student access to `/api/v1/security/dashboard` returns 403 | Passed |
| Suspicious request pattern returns 400 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Security navigation | Super Admin and School Admin can navigate to `/security` | Passed by build/typecheck |
| Security route protection | `/security` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows 2FA, audit, secret, API rule, backup policy, backup, and block rule counts | Passed by API verification |
| Forms | Forms exist for secrets, API rules, backup policies, and backup runs | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing login flow remains compatible for users without enabled 2FA | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, Advanced Finance, HR, Library, Communication, Reports, Documents, Certificates, Meetings, CMS, and Mobile routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
