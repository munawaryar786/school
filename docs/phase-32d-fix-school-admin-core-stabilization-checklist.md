# Phase 32D-Fix School Admin Core Stabilization Checklist

Date: 2026-06-21
Branch: `phase-32-single-school-premium`
Scope: Stabilize currently opened Phase 32D school-admin workflows only.

## Mandatory Gate

| Requirement | Status | Notes |
| --- | --- | --- |
| Read Phase 32D checklist/report | Completed | Route and migration status reviewed. |
| Read Phase 32C checklist/report | Completed | Parent leave and parent portal compatibility reviewed. |
| Read Phase 32B checklist/report | Completed | Shell/proxy conventions reviewed. |
| Inspect Prisma schema | Completed | Existing Phase 32D schema changes present. |
| Inspect school-admin backend routes | Completed | Explicit parent routes exist locally, but parent PATCH is missing and error messages need hardening. |
| Inspect parent backend routes | Completed | Link-model compatibility present. |
| Inspect school-admin frontend | Completed | Generic API error surfacing and teacher assignment edit gap found. |
| Inspect frontend `/api` proxy | Completed | `/api/school-admin/*` maps to `/v1/school-admin/*`; no `/api/v1`. |
| Create/update this checklist before application edits | Completed | This file is the implementation gate. |
| Create stabilization report after work | Completed | Created `docs/phase-32d-fix-school-admin-core-stabilization-report.md`. |
| Create manual QA script | Completed | Created `docs/phase-32d-fix-manual-qa.md`. |

## Current Route Matrix Audit

| Area | Frontend path | Proxy target | Backend route | Method | Response shape | Finding | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Academic years list | `/api/school-admin/academic-years?pageSize=100` | `/v1/school-admin/academic-years` | generic `/:resource` | GET | `{ success, data, pagination, meta }` | Resource key exists. | Pending validation |
| Academic years create/edit | `/api/school-admin/academic-years` | `/v1/school-admin/academic-years` | generic `/:resource`, `/:resource/:id` | POST/PATCH | `{ success, data, meta }` | Resource key exists. | Pending validation |
| Classes CRUD | `/api/school-admin/classes` | `/v1/school-admin/classes` | generic routes | GET/POST/PATCH | list/item envelope | Resource key exists. | Pending validation |
| Sections CRUD | `/api/school-admin/sections` | `/v1/school-admin/sections` | generic routes | GET/POST/PATCH | list/item envelope | Class ownership guard exists. | Pending validation |
| Subjects CRUD | `/api/school-admin/subjects` | `/v1/school-admin/subjects` | generic routes | GET/POST/PATCH | list/item envelope | Resource key exists. | Pending validation |
| Students CRUD | `/api/school-admin/students` | `/v1/school-admin/students` | generic routes | GET/POST/PATCH | list/item envelope | Resource key exists. | Pending validation |
| Teachers CRUD | `/api/school-admin/teachers` | `/v1/school-admin/teachers` | generic routes | GET/POST/PATCH | list/item envelope | Resource key exists. | Pending validation |
| Parents list/create | `/api/school-admin/parents` | `/v1/school-admin/parents` | explicit `/parents` | GET/POST | list/item envelope | Route exists before catch-all and frontend errors are hardened. | Completed |
| Parents edit | `/api/school-admin/parents/:parentId` | `/v1/school-admin/parents/:parentId` | explicit `/parents/:parentId` | PATCH | item envelope | Added route and frontend edit can call it. | Completed |
| Parent-child link | `/api/school-admin/parents/:parentId/link-child` | `/v1/school-admin/parents/:parentId/link-child` | explicit route | POST | item envelope | Route exists before catch-all and frontend shows actionable failure message. | Completed |
| Parent login status | `/api/school-admin/parents/:parentId/login-status` | `/v1/school-admin/parents/:parentId/login-status` | explicit route | PATCH | item envelope | Route exists before catch-all and UI action remains available. | Completed |
| Teacher assignments | `/api/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | explicit and generic routes | GET/POST/PATCH | list/item envelope | Explicit routes added; UI edit now patches existing assignment. | Completed |

## Fix Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Add explicit backend routes for opened core resources before catch-all | Completed | Stable explicit routes added for opened CRUD resources and teacher assignments. |
| Add missing `PATCH /v1/school-admin/parents/:parentId` | Completed | Parent name/email/login status edit route added. |
| Keep `/v1` backend and `/api` frontend proxy | Completed | No route prefix changes. |
| Normalize validation errors to safe 400 where practical | Completed | Existing Zod error handler preserved; frontend now maps route/resource failures. |
| Improve frontend error messages | Completed | Raw route/resource errors are mapped to actionable messages. |
| Make teacher assignment edit usable | Completed | Teacher assignment table edit now opens form and PATCHes existing assignment. |
| Preserve locked modules and remove old Phase 32B placeholder text | Completed | App code scan found no old placeholder text. |
| No schema migration unless required | Completed | No schema/migration changes in this fix pass. Existing Phase 32D migration remains pending/not applied. |
| Run required validation | Completed | Required commands passed except migrate status blocked by DB permission. |
