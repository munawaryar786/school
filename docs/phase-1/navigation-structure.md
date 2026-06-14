# Navigation Structure

Project: School ERP Management System  
Phase: 1 - System Architecture

## Navigation Principles

- Navigation is role-aware and permission-aware.
- Each role portal uses its assigned color family consistently.
- Module pages use the module color where stronger than role context, such as Academic teal and Security dark teal.
- Navigation must support keyboard access, visible focus states, and screen-reader labels.
- No placeholder navigation items should be routed to unfinished pages in implementation phases.
- Items appear only when the underlying feature is implemented and authorized.

## Color System

| Area | Color |
| --- | --- |
| Super Admin | Purple |
| School Admin | Blue |
| Teacher | Green |
| Student | Orange |
| Parent | Pink |
| Academic Modules | Teal |
| Security | Dark Teal |

## Global Layout

| Region | Purpose |
| --- | --- |
| Sidebar | Primary navigation by role/module |
| Top bar | School switcher, active academic year, global search, notifications, profile menu |
| Breadcrumbs | Current location and module context |
| Content header | Page title, primary action, filters where applicable |
| Main content | Tables, forms, dashboards, workflows |
| Toast/live region | Success/error feedback |

## Super Admin Navigation

| Section | Items |
| --- | --- |
| Overview | Platform dashboard |
| Schools | Schools, administrators |
| Commercial | Subscriptions, revenue reports |
| Identity | User management |
| Security | Audit logs |
| Platform | System settings, backup and restore |

## School Admin Navigation

| Section | Items |
| --- | --- |
| Overview | Dashboard |
| Academic | Academic years, terms, classes, sections, subjects, curriculum, timetable |
| People | Students, teachers, staff, parents |
| Operations | Attendance, exams, fees, library |
| Learning | LMS, assignments, materials |
| Communication | Messages, announcements, notifications |
| Reports | Student reports, teacher reports, attendance reports, financial reports |
| Settings | School profile, roles, academic settings |

## Teacher Navigation

| Section | Items |
| --- | --- |
| Overview | Dashboard |
| Classes | My classes, class management |
| Attendance | Mark attendance, attendance history |
| Teaching | Assignments, materials, online classes |
| Exams | Exams, marks |
| Communication | Parent communication, announcements |
| Reports | Assigned class reports |

## Student Navigation

| Section | Items |
| --- | --- |
| Overview | Dashboard |
| Academics | Timetable, attendance, assignments, materials |
| Exams | Online exams, results |
| Records | Certificates, transcripts |
| Finance | Fees |
| Communication | Messages, announcements |

## Parent Navigation

| Section | Items |
| --- | --- |
| Overview | Dashboard |
| Children | Child profile, attendance, results, performance, homework |
| Finance | Fee payments, invoices, receipts |
| Communication | Messages, announcements |

## Specialist Navigation

| Role | Items |
| --- | --- |
| Finance Officer | Finance dashboard, fees, invoices, payments, discounts, scholarships, reports, ledger, expenses, budgets |
| Librarian | Library dashboard, books, issue, return, fines, library reports |
| HR Officer | HR dashboard, employees, leaves, payroll, salary slips, HR reports |

## Route Plan

| Portal | Route Prefix |
| --- | --- |
| Public auth | `/login`, `/forgot-password`, `/reset-password` |
| Super Admin | `/super-admin/*` |
| School Admin | `/school-admin/*` |
| Teacher | `/teacher/*` |
| Student | `/student/*` |
| Parent | `/parent/*` |
| Finance Officer | `/finance/*` |
| Librarian | `/library/*` |
| HR Officer | `/hr/*` |
| Public CMS | `/:schoolSlug` or custom domain |

## Navigation Data Model

Navigation should be driven by typed configuration:

| Field | Purpose |
| --- | --- |
| `label` | Visible text |
| `href` | Route |
| `icon` | Lucide icon key |
| `requiredPermissions` | Permission keys required to display |
| `roleContext` | Role color context |
| `moduleContext` | Optional module color override |
| `featureFlag` | Optional feature gate by phase/module |

