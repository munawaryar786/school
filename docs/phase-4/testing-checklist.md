# Phase 4 Testing Checklist

Project: School ERP Management System  
Phase: 4 - School Admin Portal

| Check | Result | Evidence |
| --- | --- | --- |
| Prisma client generation | Passed | `npm.cmd run prisma:generate` passed after stopping stale local app processes |
| Phase 4 migration | Passed | `20260612043000_phase_4_school_admin` SQL applied and marked as applied |
| Migration status | Passed | Database schema reported up to date |
| Seed data | Passed | `npm.cmd run prisma:seed` completed |
| API typecheck | Passed | `npm.cmd run typecheck --workspace @school-erp/api` passed |
| Web typecheck | Passed | `npm.cmd run typecheck --workspace @school-erp/web` passed |
| Shared typecheck | Passed | `npm.cmd run typecheck --workspace @school-erp/shared` passed |
| UI typecheck | Passed | `npm.cmd run typecheck --workspace @school-erp/ui` passed |
| API tests | Passed | `npm.cmd run test --workspace @school-erp/api` passed |
| API build | Passed | `npm.cmd run build --workspace @school-erp/api` passed |
| Web production build | Passed | `npm.cmd run build --workspace @school-erp/web` passed after freeing memory |
| API health | Passed | `GET /health` returned 200 |
| Web route protection | Passed | Unauthenticated `/school-admin` redirected to login |
| Authenticated School Admin page | Passed | Cookie-authenticated `/school-admin` returned 200 and portal content |
| School Admin API proxy | Passed | `/api/school-admin/dashboard` returned metrics |
| Teacher authorization boundary | Passed | Teacher token received 403 on School Admin API |
| Super Admin school-scope boundary | Passed | Platform Super Admin token without school context received 403 |
| All CRUD workflows | Passed | Create/delete verified for academic years, classes, sections, subjects, teachers, students, fees, exams, attendance, library, timetable |
| Update workflow | Passed | Class status updated from `ACTIVE` to `INACTIVE` |
| Search/pagination | Passed | Class search returned expected record |
| CSV export | Passed | Classes CSV returned 200 with expected header |

## Commands Run

```powershell
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npm.cmd run prisma:generate
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npx.cmd prisma db execute --file prisma\migrations\20260612043000_phase_4_school_admin\migration.sql --schema prisma\schema.prisma
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npx.cmd prisma migrate resolve --applied 20260612043000_phase_4_school_admin
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npx.cmd prisma migrate status
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npm.cmd run prisma:seed
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run typecheck --workspace @school-erp/api
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run typecheck --workspace @school-erp/web
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run typecheck --workspace @school-erp/shared
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run typecheck --workspace @school-erp/ui
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run test --workspace @school-erp/api
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run build --workspace @school-erp/api
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm.cmd run build --workspace @school-erp/web
```

