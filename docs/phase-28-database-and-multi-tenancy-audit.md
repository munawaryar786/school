# Phase 28A Database and Multi-Tenancy Audit

## Prisma Model Review

The schema contains a broad set of models for platform administration, school operations, academics, admissions, attendance, LMS, finance, HR, library, communication, reporting, documents, certificates, CMS, mobile, security, and production readiness.

Confirmed model families:

- Identity: `User`, `Role`, `SchoolMembership`, `Session`.
- Tenant/platform: `School`, `SubscriptionPlan`, `Subscription`, `SystemSetting`, `BackupJob`.
- Audit/security/ops: `AuditLog`, `UserTwoFactorSetting`, `SecuritySecret`, `ApiSecurityRule`, `SecurityBackupPolicy`, `PerformanceCheck`, `AccessibilityAudit`, `SeoCheck`, `ErrorMonitoringEvent`, `DeploymentCheck`, `LoadTestResult`, `RegressionCheck`.
- Academic/SIS: `AcademicYear`, `ClassLevel`, `Section`, `Subject`, `TeacherProfile`, `StudentProfile`.
- Attendance/exam/basic school: `FeeRecord`, `ExamRecord`, `AttendanceRecord`, `AttendanceNotification`.
- Library: `LibraryBook`, `LibraryIssue`, `LibraryReturn`, `LibraryFine`.
- Communication: SMS, email, push, message, announcement.
- Analytics/documents/certificates/meetings/CMS/mobile.
- Portal-specific teacher/student/parent records.
- Admissions, LMS, finance, advanced finance, HR.

## Tenant-Scoping Review

Strengths:

- Most school-owned tables contain `schoolId`.
- Many tables index `[schoolId, status]` or other school-prefixed lookup fields.
- Super Admin `School` supports `deletedAt` soft delete.
- `SchoolMembership` allows platform membership with nullable `schoolId`.

Weaknesses:

- No `Campus` model or `campusId` fields were observed in schema search evidence.
- No explicit tenant abstraction separate from `School`.
- Several portal queries rely on `studentName`, `guardianName`, `className`, or `teacherId` text/user IDs rather than durable foreign keys to profile records.
- Direct deletes are common in route handlers.
- Soft delete is not standardized across school-owned models.
- There is no central tenant context query builder; each route builds `where` manually.

## Missing Indexes and Constraints

Likely needed:

- Campus indexes once `Campus` is introduced: `[schoolId, campusId, status]`.
- Durable person foreign-key indexes for student/parent/teacher portal objects.
- Unique constraints for attendance by person/date/period where applicable.
- Unique constraints for timetable slots by class/section/day/time.
- Composite constraints for admissions application identity per school/year.
- Ledger/invoice/payment idempotency keys.
- Communication delivery idempotency keys.
- Audit indexes by resource/resourceId and event time.
- Session indexes by status/expiration for cleanup.

## Data-Leak Risks

| Risk | Evidence | Impact |
| --- | --- | --- |
| Parent-child association by guardian name | Parent portal `requireParentScope` | Parent with same name may see unrelated child |
| Student profile association by user name | Student portal `requireStudentScope` | Student may get wrong profile/class |
| Student/parent fee listing by school only | Student and parent `fees` filters | Cross-student fee exposure |
| Teacher broad operations | Teacher module permission is module-level | Teacher may access classes beyond assignment |
| Reports/export broad access | CSV export on many modules | PII leakage without masking/approval |

## Transaction Risks

- Super Admin administrator creation uses a transaction, which is good.
- Most generic CRUD operations are single creates/updates/deletes without transaction wrappers.
- Complex workflows like admission enrollment, fee payment, result publication, payroll, inventory, and library circulation need explicit transaction boundaries.
- Audit logging occurs after writes in many routes; if audit fails, user action may fail after data write unless transactionally bound.
- Backup restore runs a transaction for partial tables only; full restore consistency is not guaranteed.

## Migration Recommendations

1. Add `Campus` and campus membership strategy after owner approval.
2. Add durable profile relationships:
   - `User.studentProfileId` or join table.
   - Parent-child join table.
   - Teacher-class-subject assignment tables.
3. Introduce a shared tenant policy service for Prisma queries.
4. Standardize soft delete/lifecycle state where hard delete is unsafe.
5. Add audit-history requirements per sensitive model.
6. Add idempotency keys for payments, imports, notifications, and webhooks.
7. Evaluate PostgreSQL row-level security for high-risk school-owned tables after application-level scoping is centralized.

## RLS Assessment

Do not implement RLS in Phase 28A. It may be appropriate later for defense in depth on:

- Student, parent, teacher, attendance, finance, HR, report, document, communication, and audit tables.

Prerequisite: all database access must carry a trusted tenant context and avoid superuser bypass in application queries.
