# Phase 28A Project Owner Decision Register

Implementation must not begin until these decisions are approved or deferred.

| ID | Decision required | Options | Recommendation | Required before |
| --- | --- | --- | --- | --- |
| D01 | Confirm Phase 28A acceptance | Approve / request revisions | Approve after review comments resolved | Phase 28B |
| D02 | Preserve production routing | Keep `/health`, backend `/v1`, frontend `/api` proxy / change | Keep current routing | Any implementation |
| D03 | Target role set | Current roles only / add `ADMISSIONS_OFFICER` and configurable staff role model | Add admissions officer and configurable staff roles | RBAC design |
| D04 | Campus model | School-only / add multi-campus | Add campus model | Tenant architecture |
| D05 | Permission granularity | Broad module permissions / CRUD-export-approval object policies | Fine-grained policies | Core stabilization |
| D06 | Design system approach | Patch current UI / build shared component system | Build shared design system | UI implementation |
| D07 | Theme support | Light only / light+dark+system+high contrast | Full theme model | Design system |
| D08 | Workflow engine | Per-module status fields / reusable workflow engine | Reusable engine | Admissions/finance/HR/exams |
| D09 | Parent/student identity linkage | Name matching / durable relationships | Durable relationships | Portal hardening |
| D10 | Reporting scope | Static reports / report builder and saved reports | Phased report architecture | Analytics |
| D11 | Notification providers | Internal records only / provider adapter model | Adapter model | Communication |
| D12 | Payment gateway | Manual payments / gateway integration readiness | Adapter-ready design first | Finance |
| D13 | Import/export governance | Simple CSV / audited import/export with dry-run and approvals | Audited governance | Migration/import |
| D14 | Security roadmap | Basic JWT / session management, 2FA, SSO readiness, step-up auth | Enterprise security roadmap | Phase 28C |
| D15 | Super Admin impersonation | Not allowed / allowed with mandatory audit | Allow only with strict audit and owner approval | Security design |
| D16 | PostgreSQL RLS | Do not use / assess after tenant service / implement immediately | Assess after tenant service | Database hardening |
| D17 | Backup/restore strategy | Keep local JSON route / redesign for production | Redesign | Production readiness |
| D18 | Optional modules | Build all / phase by value | Phase optional modules | Roadmap approval |
| D19 | Benchmark influence | Copy competitor screens / use patterns only | Use patterns only | Design approval |
| D20 | Release gate | Manual QA only / automated regression required | Automated regression required | Phase 28E |

## Decisions Recommended for Immediate Approval

- Preserve `/v1` backend prefix and `/api` frontend proxy.
- Preserve Vercel roots and Express default export.
- Do not implement optional modules in Phase 28C.
- Treat all Phase 28A findings as unimplemented until explicitly approved.
