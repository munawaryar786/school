# Phase 28A Development Roadmap

No implementation may begin until Project Owner approval.

## Phase 28B - Approved Architecture and Design System

| Priority | Work | Dependencies | Complexity | Risk | Acceptance criteria | Validation plan | Rollback plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Approve target architecture, roles, tenant model, and route prefix guardrails | Phase 28A approval | Medium | Misalignment | Owner signs decision register | Architecture review | No code changes |
| P0 | Design-system tokens and component architecture | Architecture approval | Medium | UI churn | Tokens/components spec accepted | Story/test plan | Keep current UI |
| P0 | RBAC permission taxonomy | Role decision | High | Privilege regression | CRUD/export/approval matrix approved | Policy tests planned | Keep current permissions |

## Phase 28C - Core Platform Stabilization

| Priority | Work | Dependencies | Complexity | Risk | Acceptance criteria | Validation plan | Rollback plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Fix local workspace validation/build reliability | None | Medium | Build instability | Typecheck/test/build run locally and CI | npm scripts, CI logs | Revert tooling-only changes |
| P0 | Auth/session hardening | RBAC approval | High | Login regression | Super Admin and all seeded roles login/logout/refresh | Auth integration/E2E tests | Feature flag refresh changes |
| P0 | Route and proxy regression suite | Stable build | Medium | Deployment breakage | `/health`, `/v1`, `/api` proxy covered | Automated tests | Revert test-only config if needed |
| P0 | Tenant policy service | Tenant model approval | High | Data access regression | All school-owned queries use policy helper | Unit/integration IDOR tests | Incremental module rollout |
| P0 | Add `ADMISSIONS_OFFICER` if approved | RBAC approval | Medium | Permission errors | Role exists in shared, Prisma, seed, nav | Role E2E | Migration rollback plan |
| P1 | Campus model if approved | Tenant approval | High | Migration/data model risk | Campus CRUD and scoped membership | Migration tests | Backfill and rollback scripts |

## Phase 28D - Enterprise Module Implementation

Recommended order:

1. SIS and academic foundation.
2. Admissions.
3. Attendance.
4. Exams and gradebook.
5. Fees and finance.
6. Teacher/student/parent portals.
7. Communication.
8. HR/payroll.
9. Library.
10. Reports/analytics.
11. Documents/certificates.

Acceptance criteria for every module:

- Real API and database operations.
- Auth, authorization, tenant, campus, and object policy checks.
- Create/read/update/delete or explicit read-only rationale.
- Validations shared or aligned between frontend/backend.
- Loading/empty/error/success states.
- Audit logging.
- Unit, integration, and E2E coverage.

## Phase 28E - QA, Security, and Production Readiness

| Priority | Work | Dependencies | Complexity | Risk | Acceptance criteria | Validation plan | Rollback plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Full role E2E matrix | Modules complete | High | Release blocker | Each role login/navigation/CRUD/denial/logout passes | Playwright/Cypress | Hold release |
| P0 | Security test suite | Tenant/RBAC complete | High | Data leak | IDOR/cross-school/role escalation tests pass | Automated security tests | Hold release |
| P0 | Accessibility QA WCAG 2.2 AA | Design system | Medium | Compliance | Keyboard/focus/contrast/screen-reader checks pass | axe + manual | Hold release |
| P1 | Performance baseline | Stable staging | Medium | Scaling | API p95/login/table/report targets measured | Load tests/APM | Tune before release |
| P1 | Production rollout plan | QA pass | Medium | Downtime | Rollback, backups, migrations, monitoring approved | Dry-run deploy | Revert deployment |

## Measurable Targets to Approve

Suggested targets:

- Login p95 under 800 ms excluding cold start.
- Common dashboard p95 under 1.5 s after authentication.
- API p95 under 500 ms for simple list/detail operations.
- Search p95 under 800 ms for indexed fields.
- Table pagination under 700 ms for 50-row pages.
- Report generation under 10 s for standard reports.
- Bulk import dry-run 5,000 rows under 60 s.
- Availability target 99.9% after observability and rollback controls.

Do not treat these as achieved until measured.
