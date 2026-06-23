# Phase 8 - Fees And Finance Foundation Report

## Summary
Phase 8 implements a real school-scoped fee foundation using existing database models. Fee records are stored as FinanceInvoice rows and payments are stored as FinancePayment rows. No fake rows, static counts, or schema changes were added.

## Fee Model Behavior
- Existing FinanceInvoice is used for student fee invoices: invoice number, student name, fee title, amount, due date, and status.
- Existing FinancePayment is used for payment records: receipt number, student name, invoice number, amount, paid date, method, and status.
- Paid amount and balance are computed from real FinancePayment rows grouped by invoice number.
- Existing FeeRecord remains untouched for older generic finance setup records.

## School Admin / Finance Behavior
- School Admin can list fee records, create fee records for real students, edit fee records, view summary totals, and record partial/full payments.
- Payment validation prevents paid amount from exceeding invoice amount.
- Fee status becomes PARTIAL or PAID based on real payment totals.
- Finance dashboard can view fee summary and recent invoice records.
- Finance route can record payments against invoices.

## Parent Fee Visibility
- Parent /api/parent/fees returns only FinanceInvoice rows whose studentName is in the parent linked-child scope.
- Parent fee cards show fee title, amount, paid amount, balance, due date, and status.
- Parent cannot see unrelated student fee records through the explicit fees route or generic fee resource fallback.

## Student Fee Visibility
- Student /api/student/fees returns only FinanceInvoice rows matching the logged-in student's resolved profile name.
- Student dashboard shows own fee status and recent fee rows.
- Generic student fee fallback is also scoped to the resolved student profile name.

## Readiness Updates
- Readiness now counts real finance invoices and finance payments.
- Flags added/preserved: hasFee and hasFeePayment.
- Fees module readiness is based on existing students and fee records.
- Next actions guide School Admin to create fee records and then record payments.

## Backend Routes Changed
- GET /v1/school-admin/fees
- POST /v1/school-admin/fees
- PATCH /v1/school-admin/fees/:id
- PATCH /v1/school-admin/fees/:id/payment
- GET /v1/school-admin/fees/summary
- GET /v1/finance/fees
- GET /v1/finance/fees/summary
- PATCH /v1/finance/fees/:id/payment
- GET /v1/parent/fees
- GET /v1/student/fees

## Frontend Files Changed
- School Admin portal: added Fees / Finance workspace, fee summary cards, create/edit form, payment action, and records table.
- Parent portal: added linked-child Fee Status cards.
- Role dashboard foundation: added Student fee panel and Finance fee collection panel.

## Schema / Migration Changes
No Prisma schema change was required. No migration was added or applied.

## Validation Results
- PASS: npx.cmd prisma validate --schema=prisma/schema.prisma
- PASS: npx.cmd prisma generate --schema=prisma/schema.prisma
- PASS: cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"
- PASS: cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"
- PASS: npm.cmd run test --workspace @school-erp/web
- PASS: npm.cmd run build --workspace @school-erp/shared

## Browser QA Status
Not run in browser. Manual QA steps are documented in docs/phase-8-fees-finance-manual-qa.md.

## Notes
- Runtime Preview requires latest API and web deployments after commit/push approval.
- If deployed Preview still shows route errors, verify API/web deployment sync and environment origins before changing code.