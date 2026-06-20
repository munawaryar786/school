# Phase 31 Professional School ERP Route Matrix

Status values: working, missing, failing, blocked.

| Module | UI action | Frontend route/proxy path | Backend `/v1` route | Method | Required role/permission | Backend handler file | Database model/table | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | Login as School Admin | `/api/auth/login` | `/v1/auth/login` | POST | Public | `apps/api/src/modules/auth/auth.routes.ts` | `User`, `SchoolMembership`, `Role`, `Session` | working |
| School Admin | Redirect to dashboard | `/school-admin` | N/A | GET | `SCHOOL_ADMIN` | N/A | Cookie/session role | working |
| School Admin | Block Super Admin routes | `/super-admin` | N/A | GET | `SUPER_ADMIN` only | `apps/web/middleware.ts` | Cookie role | working |
| School Admin | Dashboard metrics and analytics | `/api/school-admin/dashboard` | `/v1/school-admin/dashboard` | GET | `school.operations.manage` plus token `schoolId` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `School`, `Campus`, `SchoolMembership`, `TeacherProfile`, `StudentProfile`, `ClassLevel`, `Section`, `Subject`, `AdmissionApplication`, `FeeRecord`, `ExamRecord`, `AttendanceRecord`, `LibraryBook`, `TimetableSlot`, `LmsProgress`, `AuditLog` | working |
| School Admin | In-page Coming Soon modules | `/school-admin` | N/A | Client state | `SCHOOL_ADMIN` route access | N/A | N/A | working |
| Super Admin | Dashboard metrics and analytics | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `Campus`, `SchoolMembership`, `Role`, `StudentProfile`, `AuditLog` | working |
| Super Admin | Schools by status chart | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School` | working |
| Super Admin | Users by role chart | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `Role` | working |
| Super Admin | New schools over time chart | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School.createdAt` | working |
| Super Admin | Campuses per school widget | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `Campus` | working |
| Super Admin | Administrator status summary | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership` | working |
| Super Admin | Recent activity timeline | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `AuditLog` | working |
| Admissions | Admission workflow | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `AdmissionApplication`, `AdmissionEnrollment`, `AdmissionDocument` | missing |
| Academic | Academic setup | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `AcademicYear`, `AcademicTerm`, `ClassLevel`, `Section`, `Subject` | missing |
| Teachers | Teacher management | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `User`, `SchoolMembership`, `TeacherProfile` | missing |
| Students/Parents | Student and parent management | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `User`, `SchoolMembership`, `StudentProfile` | missing |
| Library | Library implementation | Planned | Planned | TBD | `SCHOOL_ADMIN`/`LIBRARIAN` | TBD | `LibraryBook`, `LibraryIssue`, `LibraryReturn` | missing |
| Exams | Examination implementation | Planned | Planned | TBD | `SCHOOL_ADMIN`/`TEACHER` | TBD | `ExamRecord`, `ExaminationSchedule`, `ExaminationResult` | missing |
| Attendance | Attendance implementation | Planned | Planned | TBD | `SCHOOL_ADMIN`/`TEACHER` | TBD | `AttendanceRecord` | missing |
| Timetable | Timetable implementation | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `TimetableSlot` | missing |
| Fees | Fee implementation | Planned | Planned | TBD | `SCHOOL_ADMIN`/`FINANCE_OFFICER` | TBD | `FeeRecord`, `FinanceInvoice`, `FinancePayment` | missing |
| LMS | LMS implementation | Planned | Planned | TBD | `SCHOOL_ADMIN`/`TEACHER` | TBD | `LmsCourse`, `LmsProgress` | missing |
| Notices | Notices implementation | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | `CommunicationAnnouncement` | missing |
| Reports | Reports implementation | Planned | Planned | TBD | `SCHOOL_ADMIN` | TBD | report models | missing |
