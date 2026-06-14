# RBAC Matrix

Project: School ERP Management System  
Phase: 1 - System Architecture

## Role Model

| Role | Scope | Description |
| --- | --- | --- |
| Super Admin | Platform | Manages schools, subscriptions, platform users, settings, audit, backups |
| School Admin | School | Manages school operations, people, academics, fees, reports, settings |
| Teacher | School | Manages assigned classes, attendance, assignments, marks, materials, communication |
| Student | School | Accesses personal academic, exam, LMS, certificate, transcript, and fee information |
| Parent | School | Accesses linked child profiles, attendance, results, homework, fees, and communication |
| Staff | School | Non-teaching operational staff; permissions depend on department |
| Finance Officer | School | Finance, invoices, payments, reports, ledger within school |
| Librarian | School | Library books, issues, returns, fines |
| HR Officer | School | Employees, leaves, payroll, salary slips |

## Permission Key Convention

Permission keys use `domain.action`.

Examples:

- `schools.create`
- `students.read`
- `attendance.mark`
- `finance.export`
- `reports.generate`
- `settings.update`

## High-Level RBAC Matrix

| Domain | Super Admin | School Admin | Teacher | Student | Parent | Staff | Finance Officer | Librarian | HR Officer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Platform schools | Full | None | None | None | None | None | None | None | None |
| Subscriptions | Full | Read own school | None | None | None | None | Read own school | None | None |
| School settings | Platform/full | Full own school | None | None | None | Limited by assignment | None | None | None |
| Users and memberships | Full | Full own school | Read assigned students/parents | Own profile | Own profile/children | Limited | None | None | Limited employees |
| Academic years/terms/classes/sections | Read platform-wide | Full own school | Read assigned | Read enrolled | Read children | Limited | None | None | None |
| Subjects/curriculum | Read platform-wide | Full own school | Read assigned | Read enrolled | Read children | Limited | None | None | None |
| Timetable | Read platform-wide | Full own school | Read assigned | Read own | Read children | Limited | None | None | None |
| Student records | Read platform-wide | Full own school | Read assigned | Read own | Read children | Limited | None | None | None |
| Teacher records | Read platform-wide | Full own school | Own profile | None | None | Limited | None | None | HR scoped |
| Attendance | Read platform-wide | Full own school | Mark assigned | Read own | Read children | Limited | None | None | Staff attendance scoped |
| Assignments/materials | Read platform-wide | Full own school | Full assigned | Read/submit own | Read children | None | None | None | None |
| Exams/marks/results | Read platform-wide | Full own school | Manage assigned | Read/take own | Read children | Limited | None | None | None |
| Fees/invoices/payments | Read platform-wide | Full own school | None | Read own | Read/pay children | None | Full own school | None | None |
| LMS | Read platform-wide | Full own school | Full assigned | Read/participate own | Read children | None | None | None | None |
| Library | Read platform-wide | Full own school | Borrow/read own | Borrow/read own | Read children | Limited | Fine read | Full own school | None |
| Communication | Platform notices | Full own school | Assigned recipients | Own messages | Own/children messages | Limited | Finance-related | Library-related | HR-related |
| Documents | Read platform-wide | Full own school | Own/assigned | Own | Children | Limited | Finance docs | Library docs | HR docs |
| Certificates/transcripts | Read platform-wide | Full own school | Read assigned | Read own | Read children | None | None | None | None |
| Reports/analytics | Platform/full | Full own school | Assigned reports | Own reports | Children reports | Limited | Finance reports | Library reports | HR reports |
| Audit logs | Full | Own school | None | None | None | None | Finance scoped | Library scoped | HR scoped |
| Backup/restore | Full | Request/export own school where allowed | None | None | None | None | None | None | None |

## Critical Authorization Rules

| Rule | Requirement |
| --- | --- |
| Backend authority | API authorization is the source of truth; UI hiding is only convenience. |
| Tenant scope | School roles can only access records for their active `schoolId`. |
| Assigned scope | Teachers can access only assigned classes, subjects, students, exams, and communication threads unless granted extra permissions. |
| Child scope | Parents can access only linked children. |
| Own scope | Students can access only their own records. |
| Platform scope | Super Admin actions must be audited and should require elevated confirmation for destructive operations. |
| Separation of duties | Finance, HR, and library specialist roles get domain permissions without full school administration. |

## Phase 2 Baseline Permissions

Phase 2 must implement the permission framework and minimum permissions for authentication and layout testing:

| Permission | Purpose |
| --- | --- |
| `auth.login` | Allow login flow |
| `auth.logout` | Allow logout flow |
| `profile.read` | Read current user profile |
| `schools.read` | Super Admin school listing shell |
| `school.dashboard.read` | School Admin dashboard shell |
| `teacher.dashboard.read` | Teacher dashboard shell |
| `student.dashboard.read` | Student dashboard shell |
| `parent.dashboard.read` | Parent dashboard shell |
| `settings.theme.read` | Load theme/color system |

