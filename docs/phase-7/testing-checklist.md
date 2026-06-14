# Phase 7 Testing Checklist

Project: School ERP Management System  
Phase: Parent Portal  
Prepared on: 2026-06-12

## Automated Checks

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck --workspace @school-erp/shared` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/api` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/web` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/ui` | Passed |
| `npm.cmd run test --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/web` | Passed |

## Database Checks

| Check | Result |
| --- | --- |
| Phase 7 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 7 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Parent Portal sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| Parent login with seeded credentials | Passed |
| `GET /api/v1/parent/dashboard` returns child and performance counts | Passed |
| `POST /api/v1/parent/communication` creates parent-owned message | Passed |
| `GET /api/v1/parent/communication?search=...` returns searched results | Passed |
| `GET /api/v1/parent/communication?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/parent/communication/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/parent/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Parent navigation | Parent route opens full Parent Portal | Passed by build/typecheck |
| Dashboard cards | Shows child count and Parent Portal module counts | Passed by API verification |
| Child read resources | Child profile, attendance, results, performance, homework, and fees list without write controls | Passed by build/typecheck |
| Parent write resources | Payments and communication support parent-owned creation and deletion | Passed by build/typecheck and API verification |
| Tables | Tables support loading, empty, error, data, delete where allowed, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for each non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, and Student routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
