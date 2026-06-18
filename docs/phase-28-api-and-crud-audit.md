# Phase 28A API and CRUD Audit

## API Route Inventory

Backend route prefix: `/v1`.
Frontend proxy prefix: `/api`.

| Module | Frontend route | Backend route | Methods observed | Permission pattern | CRUD result |
| --- | --- | --- | --- | --- | --- |
| Auth | `/api/auth/login`, `/api/auth/logout` | `/v1/auth/login`, `/v1/auth/logout`, `/v1/auth/me` | POST, GET | login public, logout/me authenticated | Partial |
| Super Admin | `/api/super-admin/*` | `/v1/super-admin/*` | GET/POST/PATCH/DELETE | route-specific permissions | Partial, richest module |
| School Admin | `/api/school-admin/*` | `/v1/school-admin/*` | GET/POST/PATCH/DELETE | `school.operations.manage` | Partial |
| Teacher | `/api/teacher/*` | `/v1/teacher/*` | GET/POST/PATCH/DELETE | `teacher.operations.manage` | Partial |
| Student | `/api/student/*` | `/v1/student/*` | GET/POST/DELETE | `student.portal.access` | Partial, some read-only |
| Parent | `/api/parent/*` | `/v1/parent/*` | GET/POST/DELETE | `parent.portal.access` | Partial, some read-only |
| Admissions | `/api/admissions/*` | `/v1/admissions/*` | GET/POST/PATCH/DELETE | `admissions.manage` | Partial |
| Academic | `/api/academic/*` | `/v1/academic/*` | GET/POST/PATCH/DELETE | `academic.manage` | Partial |
| Attendance | `/api/attendance/*` | `/v1/attendance/*` | GET/POST/PATCH/DELETE | `attendance.manage` | Partial |
| Examination | `/api/examination/*` | `/v1/examination/*` | GET/POST/PATCH/DELETE | `examination.manage` | Partial |
| LMS | `/api/lms/*` | `/v1/lms/*` | GET/POST/PATCH/DELETE | `lms.access`, write `lms.manage` | Partial |
| Finance | `/api/finance/*` | `/v1/finance/*` | GET/POST/PATCH/DELETE | `finance.manage` | Partial |
| Advanced Finance | `/api/advanced-finance/*` | `/v1/advanced-finance/*` | GET/POST/PATCH/DELETE | `advanced-finance.manage` | Partial |
| HR | `/api/hr/*` | `/v1/hr/*` | GET/POST/PATCH/DELETE | `hr.manage` | Partial |
| Library | `/api/library/*` | `/v1/library/*` | GET/POST/PATCH/DELETE | `library.manage` | Partial |
| Communication | `/api/communication/*` | `/v1/communication/*` | GET/POST/PATCH/DELETE | `communication.manage` | Partial |
| Reports | `/api/reports/*` | `/v1/reports/*` | GET/POST/PATCH/DELETE | `reports.manage` | Partial |
| Documents | `/api/documents/*` | `/v1/documents/*` | GET/POST/PATCH/DELETE | `documents.manage` | Partial |
| Certificates | `/api/certificates/*` | `/v1/certificates/*` | GET/POST/PATCH/DELETE | `certificates.manage` | Partial |
| Meetings | `/api/meetings/*` | `/v1/meetings/*` | GET/POST/PATCH/DELETE | `meetings.manage` | Partial |
| CMS | `/api/cms/*` | `/v1/cms/*` | GET/POST/PATCH/DELETE | `cms.manage` | Partial |
| Mobile | `/api/mobile/*` | `/v1/mobile/*` | GET/POST/PATCH/DELETE | mixed mobile permissions | Partial |
| Security | `/api/security/*` | `/v1/security/*` | GET/POST/DELETE | `security.manage` | Partial |
| Production Readiness | `/api/production-readiness/*` | `/v1/production-readiness/*` | GET/POST/PATCH/DELETE | `production.readiness.manage` | Partial |

## UI Action Pattern

Most portal components implement:

- Dashboard load: `GET /api/<module>/dashboard`.
- List: `GET /api/<module>/<resource>?page&pageSize&search&status`.
- Create: `POST /api/<module>/<resource>`.
- Export: browser navigation to `GET /api/<module>/<resource>?format=csv`.
- Delete: `DELETE /api/<module>/<resource>/<id>`.
- Edit: backend PATCH exists in many modules, but sampled UI tables did not expose edit controls.

## Request Schema and Validation

Backend Zod schemas exist per module/resource. Validation is route-local and not shared with frontend forms. Frontend forms are generic string inputs with ad hoc coercion for a few numeric/object fields.

Problems:

- Frontend form validation is shallow or absent for module forms.
- Date/time fields are strings in UI and coerced by backend.
- Enum/status values are plain strings in most schemas.
- `classId` references require users to know raw IDs in some forms.

## Permission and Repository Mapping

Most modules use route handlers directly with Prisma delegates. Dedicated repository/service layers exist for auth and audit only.

| Layer | Current state | Enterprise need |
| --- | --- | --- |
| Services | Mostly missing outside auth/audit | Domain services per module |
| Repositories | Mostly direct Prisma in routes | Repositories or query services with tenant policy |
| Permissions | Middleware-level broad checks | Per-action/per-object policies |
| Error handling | Central error handler plus local conflict handling | Typed error taxonomy, user-safe detail |
| Audit logging | Manual route calls | Centralized audit contract |

## CRUD Operation Findings

| Requirement | Current result |
| --- | --- |
| User can perform action | Unverified at runtime |
| Frontend sends correct request | Static evidence confirms many requests |
| Authentication validated | Backend middleware verifies JWT |
| Authorization validated | Broad permission checks exist |
| Tenant scope validated | Many school-owned routes require `schoolId`; object-level gaps remain |
| Backend validation runs | Zod parse/safeParse used |
| Database transaction succeeds | Unverified; some writes single-operation only |
| UI reflects result | Static evidence refreshes list on success |
| Errors displayed clearly | Basic error strings displayed |
| Audit logged where required | Many writes/exports logged, not universal |

## Error Handling Findings

- Backend Zod errors return `VALIDATION_ERROR`.
- Auth errors return generic invalid messages.
- Central error handler records `ErrorMonitoringEvent`.
- Some 404s throw `statusCode` but central handler does not inspect `statusCode`, so route-level `ensureOwnRecord` errors may become 500 in inspected generic modules.
- UI catch blocks display `payload.error.message` or generic `Request failed`.

## Current Result

The API has substantial scaffolding and some real database operations, but it is not yet a production-grade ERP API. It needs domain services, durable object relationships, transaction boundaries, fine-grained policy checks, shared validation contracts, and full E2E evidence.
