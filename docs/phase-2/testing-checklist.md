# Phase 2 Testing Checklist

Project: School ERP Management System  
Phase: 2 - Foundation Setup

| Check | Result | Evidence |
| --- | --- | --- |
| Dependencies installed | Passed | `npm.cmd ci --ignore-scripts --no-audit --no-fund` completed after extended Windows install time |
| Prisma client generation | Passed | `npm.cmd run prisma:generate` completed |
| Prisma schema validation | Passed | `npx.cmd prisma validate` passed with `DATABASE_URL` set |
| Database runtime | Passed | Embedded PostgreSQL 16 started on `localhost:5433` |
| Database migration | Passed | `npm.cmd run prisma:migrate` created and applied `20260612023018_phase_2_foundation` |
| Database seed | Passed | `npm.cmd run prisma:seed` completed |
| TypeScript typecheck | Passed | `npm.cmd run typecheck` completed across API, web, shared, UI |
| API auth unit tests | Passed | `npm.cmd test` completed, 2 tests passed |
| Production build | Passed | `npm.cmd run build` completed; Next.js generated all routes |
| API health endpoint | Passed | `GET http://localhost:4000/health` returned 200 |
| Web login page | Passed | `GET http://localhost:3000/login` returned 200 |
| Route protection | Passed | `GET http://localhost:3000/school-admin` returned 307 redirect to `/login?next=%2Fschool-admin` |
| API auth protection | Passed | `GET http://localhost:4000/api/v1/auth/me` without token returned `AUTHENTICATION_REQUIRED` |
| Live DB-backed login | Passed | Seeded School Admin login returned `SCHOOL_ADMIN` with expected permissions |
| API `/auth/me` | Passed | Authenticated token returned current user context |
| API logout | Passed | Authenticated logout returned `loggedOut: true` |
| Web login route | Passed | `POST /api/auth/login` returned auth cookies |
| Web protected dashboard | Passed | Cookie-authenticated School Admin route returned 200 |
| RBAC role mismatch | Passed | Teacher cookie session requesting `/school-admin` redirected to `/unauthorized` |

## Commands Run

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run prisma:generate
$env:PGPORT='5433'; $env:PGDATA_DIR='.data/postgres16'; npm.cmd run db:start
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npx.cmd prisma validate
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npm.cmd run prisma:migrate
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'; npm.cmd run prisma:seed
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
Invoke-WebRequest -Uri 'http://localhost:4000/health' -UseBasicParsing
Invoke-WebRequest -Uri 'http://localhost:3000/login' -UseBasicParsing
Test-NetConnection -ComputerName localhost -Port 5433
```
