# Phase 28A Role and Permission Matrix

Source of truth inspected: `packages/shared/src/permissions.ts`, `apps/web/middleware.ts`, `apps/web/lib/auth.ts`, `apps/web/components/layout/app-shell.tsx`, backend route middleware.

## Role Availability

| Role | Exists in shared code | Exists in Prisma enum | Target portal | Current landing | Login account availability | Login success | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SUPER_ADMIN` | Yes | Yes | Super Admin | `/super-admin` | Seed/prod Super Admin reported | Reported working | Strongest current path |
| `SCHOOL_ADMIN` | Yes | Yes | School Admin | `/school-admin` | Seed likely, not runtime verified | Unverified | Broad school permissions |
| `TEACHER` | Yes | Yes | Teacher | `/teacher` | Unverified | Unverified | Backend teacher module uses broad teacher ops |
| `STUDENT` | Yes | Yes | Student | `/student` | Unverified | Unverified | Scope uses user/profile name matching |
| `PARENT` | Yes | Yes | Parent | `/parent` | Unverified | Unverified | Scope uses guardian name matching |
| `STAFF` | Yes | Yes | Configurable Staff | `/school-admin` | Unverified | Unverified | Very broad operational permissions |
| `FINANCE_OFFICER` | Yes | Yes | Finance Officer | Middleware `/finance`; login helper sometimes `/school-admin` | Unverified | Unverified | Landing inconsistency |
| `LIBRARIAN` | Yes | Yes | Librarian | Middleware `/library`; login helper sometimes `/school-admin` | Unverified | Unverified | Landing inconsistency |
| `HR_OFFICER` | Yes | Yes | HR Officer | Middleware `/hr`; login helper sometimes `/school-admin` | Unverified | Unverified | Landing inconsistency |
| `ADMISSIONS_OFFICER` | No | No | Admissions Officer | Missing | Missing | Missing | Must be added only after RBAC approval |

## Permissions by Role

| Role | Current permissions | Tenant/school/campus scope | CRUD/export/approval risk |
| --- | --- | --- | --- |
| `SUPER_ADMIN` | profile, schools read/create/update/delete, admins manage, subscriptions manage, revenue read, users manage, theme read, audit read, system settings, backups, security, production readiness, export | May have `schoolId = null`; cross-school access allowed by role | Can export and manage global records; backup/restore needs step-up approval |
| `SCHOOL_ADMIN` | school dashboard/operations, admissions, academic, attendance, examination, LMS, finance, advanced finance, HR, library, communication, reports, documents, certificates, meetings, CMS, mobile, security, production readiness, theme | `schoolId` from membership; no campus scope | Too broad; needs delegated school admin profiles |
| `TEACHER` | teacher dashboard, teacher operations, examination, LMS manage/access, communication, meetings, theme | `schoolId`; no durable teacher/class authorization in many routes | Can manage broad exam/LMS/communication beyond assigned classes |
| `STUDENT` | profile, student dashboard, student portal, LMS access, theme | `schoolId`; student scope inferred from name | Fee reads too broad; LMS progress write too broad |
| `PARENT` | profile, parent dashboard, parent portal, theme | `schoolId`; children inferred by guardian name | Child linkage is weak; fees too broad |
| `STAFF` | admissions, academic, attendance, examination, LMS, communication, reports, documents, certificates, meetings, CMS, mobile, theme | `schoolId`; no campus scope | Broad non-configurable staff access |
| `FINANCE_OFFICER` | finance, advanced finance, reports, theme | `schoolId`; no finance account scope | Needs account/department/export approval permissions |
| `LIBRARIAN` | library, theme | `schoolId`; no campus/library branch scope | Needs circulation vs catalog vs reports split |
| `HR_OFFICER` | attendance, HR, reports, documents, theme | `schoolId`; no department scope | HR data and reports need stronger PII controls |

## Current Page Access

| Page prefix | Allowed roles in middleware | Backend permission required |
| --- | --- | --- |
| `/super-admin` | Super Admin | route-specific super admin permissions |
| `/school-admin` | School Admin, Staff, Finance Officer, Librarian, HR Officer | `school.operations.manage` |
| `/admissions` | School Admin, Staff | `admissions.manage` |
| `/academic` | School Admin, Staff | `academic.manage` |
| `/attendance` | School Admin, Staff, HR Officer | `attendance.manage` |
| `/examination` | School Admin, Staff, Teacher | `examination.manage` |
| `/lms` | School Admin, Staff, Teacher, Student | `lms.access`, write `lms.manage` except progress |
| `/finance` | School Admin, Finance Officer | `finance.manage` |
| `/advanced-finance` | School Admin, Finance Officer | `advanced-finance.manage` |
| `/hr` | School Admin, HR Officer | `hr.manage` |
| `/library` | School Admin, Librarian | `library.manage` |
| `/communication` | School Admin, Staff, Teacher | `communication.manage` |
| `/reports` | School Admin, Staff, Finance Officer, HR Officer | `reports.manage` |
| `/documents` | School Admin, Staff, HR Officer | `documents.manage` |
| `/certificates` | School Admin, Staff | `certificates.manage` |
| `/meetings` | School Admin, Staff, Teacher | `meetings.manage` |
| `/cms` | School Admin, Staff | `cms.manage` |
| `/mobile` | School Admin, Staff | `mobile.api.manage`; mobile student/teacher/parent routes have role checks |
| `/security` | Super Admin, School Admin | `security.manage` |
| `/production-readiness` | Super Admin, School Admin | `production.readiness.manage` |
| `/teacher` | Teacher | `teacher.operations.manage` |
| `/student` | Student | `student.portal.access` |
| `/parent` | Parent | `parent.portal.access` |

## CRUD Permission Gaps

| Area | Current state | Target state |
| --- | --- | --- |
| Read vs create vs update vs delete | Mostly one module-level manage permission | Separate `resource.read/create/update/delete/export/approve` permissions |
| Export | CSV on many list endpoints; not consistently permission-separated | `*.export` permission plus audit, masking, approval for sensitive data |
| Approval | Mostly missing | Workflow permissions by transition |
| Campus scope | Missing | Campus memberships and policy evaluation |
| Object-level auth | Partial `schoolId`; weak name-based portal scoping | Durable foreign keys and policy checks per object |
| Auditability | Many writes call audit; not universal | Central audit middleware/service contract |

## Privilege-Escalation Risks

- UI middleware trusts readable `erp_role` cookie for page routing.
- Broad `STAFF` role grants many modules.
- Teacher has `EXAMINATION_MANAGE`, `LMS_MANAGE`, and `COMMUNICATION_MANAGE` without assigned-class checks.
- Parent and student access use names for identity linkage.
- Super Admin settings/backup operations need step-up authentication and dual-control options.
