# Phase 30 Full ERP Route Matrix

Status values: working, missing, failing, blocked. Status is based on source audit before Phase 30 implementation unless noted.

| UI action | Frontend route or proxy route | Backend `/v1` route | Method | Permission required | Backend handler file | Database model used | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login | `/api/auth/login` | `/v1/auth/login` | POST | Public | `apps/api/src/modules/auth/auth.routes.ts` | `User`, `SchoolMembership`, `Session` | working |
| Logout | `/api/auth/logout` | `/v1/auth/logout` | POST | Authenticated | `apps/api/src/modules/auth/auth.routes.ts` | `Session` | working |
| Super Admin dashboard | `/api/super-admin/dashboard` | `/v1/super-admin/dashboard` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `Campus`, `User`, `StudentProfile`, `SchoolMembership`, `Role`, `AuditLog` | working |
| Super Admin overview | `/api/super-admin/overview` | `/v1/super-admin/overview` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `User`, `Subscription` | working |
| List schools | `/api/super-admin/schools` | `/v1/super-admin/schools` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `Subscription`, `SubscriptionPlan` | working |
| Create school | `/api/super-admin/schools` | `/v1/super-admin/schools` | POST | `schools.create` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `AuditLog` | working |
| View school detail | `/api/super-admin/schools/:id` | `/v1/super-admin/schools/:id` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `Campus`, `SchoolMembership`, `User`, `Role`, `Subscription`, `TeacherProfile`, `StudentProfile`, `LibraryBook`, `AuditLog` | working |
| Edit school | `/api/super-admin/schools/:id` | `/v1/super-admin/schools/:id` | PATCH | `schools.update` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `AuditLog` | working |
| Archive school | `/api/super-admin/schools/:id` | `/v1/super-admin/schools/:id` | DELETE | `schools.delete` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `AuditLog` | working |
| Activate school | `/api/super-admin/schools/:id/activate` | `/v1/super-admin/schools/:id/activate` | POST | `schools.update` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `AuditLog` | working |
| Suspend school | `/api/super-admin/schools/:id/suspend` | `/v1/super-admin/schools/:id/suspend` | POST | `schools.update` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `School`, `AuditLog` | working |
| List campuses | `/api/super-admin/campuses` | `/v1/super-admin/campuses` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `Campus`, `School` | working |
| Create campus | `/api/super-admin/campuses` | `/v1/super-admin/campuses` | POST | `schools.create` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `Campus`, `School`, `AuditLog` | working |
| View campus | `/api/super-admin/campuses/:id` | `/v1/super-admin/campuses/:id` | GET | `schools.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `Campus`, `School` | working |
| Edit campus | `/api/super-admin/campuses/:id` | `/v1/super-admin/campuses/:id` | PATCH | `schools.update` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `Campus`, `School`, `AuditLog` | working |
| Archive campus | `/api/super-admin/campuses/:id` | `/v1/super-admin/campuses/:id` | DELETE | `schools.delete` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `Campus`, `AuditLog` | working |
| List administrators | `/api/super-admin/administrators` | `/v1/super-admin/administrators` | GET | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `User`, `School`, `Role` | working |
| Create school administrator | `/api/super-admin/administrators` | `/v1/super-admin/administrators` | POST | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `User`, `SchoolMembership`, `Role`, `AuditLog` | working |
| View administrator | `/api/super-admin/administrators/:id` | `/v1/super-admin/administrators/:id` | GET | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `User`, `School`, `Role` | working |
| Edit administrator | `/api/super-admin/administrators/:id` | `/v1/super-admin/administrators/:id` | PATCH | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `User`, `AuditLog` | working |
| Suspend administrator | `/api/super-admin/administrators/:id` | `/v1/super-admin/administrators/:id` | DELETE | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `AuditLog` | failing |
| Activate administrator | `/api/super-admin/administrators/:id/activate` | `/v1/super-admin/administrators/:id/activate` | POST | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `User`, `AuditLog` | working |
| Explicit administrator suspend | `/api/super-admin/administrators/:id/suspend` | `/v1/super-admin/administrators/:id/suspend` | POST | `administrators.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SchoolMembership`, `User`, `AuditLog` | working |
| List audit logs | `/api/super-admin/audit-logs` | `/v1/super-admin/audit-logs` | GET | `audit.read` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `AuditLog`, `User`, `School` | working |
| Manage system settings | `/api/super-admin/settings` | `/v1/super-admin/settings` | GET/POST | `system-settings.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `SystemSetting`, `AuditLog` | working |
| Manage backups | `/api/super-admin/backups` | `/v1/super-admin/backups` | GET/POST | `backups.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `BackupJob`, platform tables | working |
| Restore backup | `/api/super-admin/backups/:id/restore` | `/v1/super-admin/backups/:id/restore` | POST | `backups.manage` | `apps/api/src/modules/super-admin/super-admin.routes.ts` | `BackupJob`, platform tables | working |
| School Admin dashboard | `/api/school-admin/dashboard` | `/v1/school-admin/dashboard` | GET | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `AcademicYear`, `ClassLevel`, `Section`, `Subject`, `TeacherProfile`, `StudentProfile`, `FeeRecord`, `ExamRecord`, `AttendanceRecord`, `LibraryBook`, `TimetableSlot` | failing |
| Academic years CRUD | `/api/school-admin/academic-years` | `/v1/school-admin/academic-years` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `AcademicYear` | failing |
| Classes CRUD | `/api/school-admin/classes` | `/v1/school-admin/classes` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `ClassLevel` | failing |
| Sections CRUD | `/api/school-admin/sections` | `/v1/school-admin/sections` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `Section` | failing |
| Subjects/courses CRUD | `/api/school-admin/subjects` | `/v1/school-admin/subjects` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `Subject` | failing |
| Teacher profile CRUD | `/api/school-admin/teachers` | `/v1/school-admin/teachers` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `TeacherProfile` | failing |
| Student profile CRUD | `/api/school-admin/students` | `/v1/school-admin/students` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `StudentProfile` | failing |
| Fees CRUD | `/api/school-admin/fees` | `/v1/school-admin/fees` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `FeeRecord` | failing |
| Exams CRUD | `/api/school-admin/exams` | `/v1/school-admin/exams` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `ExamRecord` | failing |
| Attendance CRUD | `/api/school-admin/attendance` | `/v1/school-admin/attendance` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `AttendanceRecord` | failing |
| Library CRUD in School Admin | `/api/school-admin/library` | `/v1/school-admin/library` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `LibraryBook` | failing |
| Timetable CRUD | `/api/school-admin/timetable` | `/v1/school-admin/timetable` | GET/POST/PATCH/DELETE | `school.operations.manage` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | `TimetableSlot` | failing |
| Teacher portal | `/api/teacher/*` | `/v1/teacher/*` | GET/POST/PATCH/DELETE | `teacher.*` | `apps/api/src/modules/teacher/teacher.routes.ts` | Teacher-related models | working |
| Student portal | `/api/student/*` | `/v1/student/*` | GET/POST/PATCH/DELETE | `student.*` | `apps/api/src/modules/student/student.routes.ts` | Student-related models | working |
| Parent portal | `/api/parent/*` | `/v1/parent/*` | GET/POST/PATCH/DELETE | `parent.*` | `apps/api/src/modules/parent/parent.routes.ts` | Parent-related models | working |
| Academic module | `/api/academic/*` | `/v1/academic/*` | GET/POST/PATCH/DELETE | `academic.manage` | `apps/api/src/modules/academic/academic.routes.ts` | Academic models | working |
| Attendance module | `/api/attendance/*` | `/v1/attendance/*` | GET/POST/PATCH/DELETE | `attendance.manage` | `apps/api/src/modules/attendance/attendance.routes.ts` | Attendance models | working |
| Exams/results module | `/api/examination/*` | `/v1/examination/*` | GET/POST/PATCH/DELETE | `examination.manage` | `apps/api/src/modules/examination/examination.routes.ts` | Examination models | working |
| Fees/finance module | `/api/finance/*` | `/v1/finance/*` | GET/POST/PATCH/DELETE | `finance.manage` | `apps/api/src/modules/finance/finance.routes.ts` | Finance models | working |
| Library module | `/api/library/*` | `/v1/library/*` | GET/POST/PATCH/DELETE | `library.manage` | `apps/api/src/modules/library/library.routes.ts` | Library models | working |
| Notices/communication module | `/api/communication/*` | `/v1/communication/*` | GET/POST/PATCH/DELETE | `communication.manage` | `apps/api/src/modules/communication/communication.routes.ts` | Communication models | working |
| Reports module | `/api/reports/*` | `/v1/reports/*` | GET/POST/PATCH/DELETE | `reports.manage` | `apps/api/src/modules/reports/reports.routes.ts` | Report models | working |
| HR module | `/api/hr/*` | `/v1/hr/*` | GET/POST/PATCH/DELETE | `hr.manage` | `apps/api/src/modules/hr/hr.routes.ts` | HR models | working |
| Required plural teachers route group | Not present | `/v1/teachers/*` | Any | Teacher permissions | Not present | Teacher models | missing |
| Required plural students route group | Not present | `/v1/students/*` | Any | Student permissions | Not present | Student models | missing |
| Required plural parents route group | Not present | `/v1/parents/*` | Any | Parent permissions | Not present | Parent models | missing |
| Required timetable route group | Not present | `/v1/timetable/*` | Any | School/teacher permissions | Not present | `TimetableSlot` | missing |
| Required exams route group | Not present | `/v1/exams/*` | Any | Exam permissions | Not present | Exam models | missing |
| Required fees route group | Not present | `/v1/fees/*` | Any | Finance permissions | Not present | Fee models | missing |
| Required notices route group | Not present | `/v1/notices/*` | Any | Communication permissions | Not present | Notice models | missing |
