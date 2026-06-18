# Phase 28B to Phase 28C Readiness Gate

Status: Proposed gate.

Phase 28C must not begin until the Project Owner approves this gate.

## Required Approvals

| Gate item | Required status |
| --- | --- |
| Phase 28B architecture decision record | Approved |
| Design-system specification | Approved |
| Component and UX architecture | Approved |
| Production guardrails | Approved |
| Role set | Approved |
| Campus strategy | Approved or explicitly deferred |
| Permission granularity | Approved |
| Workflow engine direction | Approved |
| Tenant isolation direction | Approved |
| Security roadmap | Approved |
| Test and release gates | Approved |

## Phase 28C Work Packages

Phase 28C should be limited to core platform stabilization:

1. Local validation and build reliability.
2. Auth/session hardening.
3. Route/proxy regression coverage.
4. RBAC taxonomy and policy registry.
5. Tenant policy helper.
6. Durable identity relationships design and migrations where approved.
7. Campus model where approved.
8. Design-system foundation implementation.
9. Critical role landing-path fixes.
10. E2E smoke tests for all seeded roles.

## Phase 28C Acceptance Criteria

Phase 28C is complete only when:

- `npm run typecheck --workspaces --if-present` passes.
- `npm run test --workspaces --if-present` passes.
- Root production build passes.
- API health and DB health are covered by regression tests.
- Frontend proxy `/api/*` to backend `/v1/*` is covered by regression tests.
- Super Admin login remains working.
- Every existing seeded role can log in or has documented missing seed status.
- Route landing paths are consistent across middleware, login, and auth helpers.
- Server-side permission checks are covered by tests.
- Cross-school and object-level denial tests exist for critical entities.
- Design tokens and shared component primitives have tests.
- No production routing guardrail is broken.

## Phase 28C Rollback Requirements

Before any Phase 28C migration or behavior change:

- Document affected files.
- Document database migration risk.
- Provide rollback SQL or Prisma migration rollback approach where possible.
- Provide feature flags for high-risk behavior changes where practical.
- Verify no secrets are committed.
- Verify no generated JavaScript is placed in `packages/shared/src`.

## Explicit Stop Conditions

Stop and request Project Owner decision if:

- A routing change would affect `/health`, `/v1`, or `/api/*`.
- A migration changes tenant ownership assumptions.
- A permission change could lock out Super Admin.
- A deployment configuration change is required.
- A security fix requires secret rotation.
- Runtime validation remains blocked by local environment issues.

