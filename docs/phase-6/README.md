# Phase 6 - Student Portal

Project: School ERP Management System  
Phase status: Approved to proceed to Phase 7  
Prepared on: 2026-06-12

## Scope

Phase 6 implements the Student Portal with student-scoped access to attendance, timetable, assignments, submissions, materials, results, online exams, certificates, transcripts, fees, and payments.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with student profile and portal counts |
| Attendance | View, search, filter, paginate, export |
| Timetable | View, search, filter, paginate, export |
| Assignments | View teacher-published assignments |
| Assignment Submissions | Create, view, delete own submissions; export |
| Materials | Access teacher-published materials |
| Results | View teacher-recorded marks/results |
| Online Exams | View available online exams |
| Online Exam Attempts | Submit, view, delete own attempts; export |
| Certificates | View/download certificate links |
| Transcripts | View/download transcript links |
| Fees | View fee status |
| Payments | Create, view, delete own payment records; export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 6 migration adds student submissions, online exams, exam attempts, certificates, transcripts, and fee payments |
| Seed Data | Demo student receives profile, timetable, fee, online exam, submission, exam attempt, certificate, transcript, and payment records |
| API | `/api/v1/student` route with dashboard, read access, action creates/deletes, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/student/[...path]` forwards authenticated browser requests to the API |
| UI | `/student` now renders the Student Portal instead of the foundation dashboard |
| RBAC | Students receive `student.portal.access`; non-student roles are blocked from Student Portal API operations |

## Application URLs

| Service | URL |
| --- | --- |
| Web Student Portal | `http://localhost:3000/student` |
| API Student Base | `http://localhost:4000/api/v1/student` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 7 was approved by the user on 2026-06-12.
