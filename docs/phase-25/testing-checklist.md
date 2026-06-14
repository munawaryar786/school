# Phase 25 Testing Checklist

Project: School ERP Management System  
Phase: Production Readiness  
Prepared on: 2026-06-13

## Automated Checks

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck --workspace @school-erp/shared` | Passed with larger Node heap |
| `npm.cmd run typecheck --workspace @school-erp/api` | Passed with larger Node heap |
| `npm.cmd run typecheck --workspace @school-erp/ui` | Passed with larger Node heap |
| `npm.cmd run typecheck --workspace @school-erp/web` | Passed with larger Node heap |
| `npm.cmd run test --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/web` | Passed with larger Node heap |

## Database Checks

| Check | Result |
| --- | --- |
| Phase 25 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 25 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Production Readiness sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| API health endpoint returned `ok` | Passed |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/production-readiness/dashboard` returned `READY` | Passed |
| `POST /api/v1/production-readiness/performance` created a verification record | Passed |
| `GET /api/v1/production-readiness/performance?search=...` returned the verification records | Passed |
| `GET /api/v1/production-readiness/performance?format=csv` returned CSV with expected headers | Passed |
| Verification records were deleted after the live test | Passed |
| Super Admin access to Production Readiness dashboard returns 200 | Passed |
| Student access to Production Readiness dashboard returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Production navigation | Super Admin and School Admin can navigate to `/production-readiness` | Passed by build/typecheck |
| Route protection | `/production-readiness` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows release status and readiness counts across all release domains | Passed by API verification |
| Forms | Forms exist for performance, accessibility, SEO, errors, deployment, load, and regression records | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck and API verification |
| SEO routes | `/robots.txt` and `/sitemap.xml` are included in the production web build | Passed |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing login flow remains compatible for seeded users | Passed |
| Existing protected route structure remains valid after adding `/production-readiness` | Passed by web build |
| Existing API route mounting remains valid after adding Production Readiness | Passed by API build |
| Existing shared permission typings remain valid after adding `production-readiness.manage` | Passed |
