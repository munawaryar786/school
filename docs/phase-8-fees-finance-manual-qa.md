# Phase 8 - Fees And Finance Manual QA

## School Admin Flow
1. Login as School Admin.
2. Confirm at least one real student exists.
3. Open /school-admin.
4. Open Fees / Finance.
5. Confirm fee summary cards load without raw route errors.
6. Create a fee record for a real student with fee type, positive amount, and due date.
7. Confirm the fee appears in the records table.
8. Edit the fee record and confirm the table updates.
9. Record a partial payment.
10. Confirm paid amount, balance, and PARTIAL status update.
11. Record the remaining payment.
12. Confirm balance becomes 0 and status becomes PAID.
13. Refresh dashboard and confirm fee readiness/counts update.

## Parent Flow
1. Login as a parent linked to the student used above.
2. Open /parent.
3. Select the linked child.
4. Confirm Fee Status shows the child's fee record.
5. Confirm amount, paid amount, balance, due date, and status are visible.
6. Confirm unrelated student fee records do not appear.

## Student Flow
1. Login as the student if a student login exists.
2. Open the student dashboard.
3. Confirm My Fees shows only that student's fee records.
4. Confirm unrelated fee records do not appear.

## Finance Flow
1. Login as Finance if a finance role account exists.
2. Open the finance dashboard.
3. Confirm fee collection summary loads from real backend totals.
4. Confirm recent fee records appear when invoices exist.
5. Confirm empty state appears when no fee records exist.

## Failure Checks
- Cannot create fee without student, fee type, amount, and due date.
- Amount must be positive.
- Paid amount cannot exceed invoice amount.
- Parent cannot see unrelated student fee records.
- Student cannot see unrelated fee records.
- No fake data appears.
- No raw route errors appear.
- Browser calls use /api paths, not /v1 directly.