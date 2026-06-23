# Phase 9 - LMS / Homework And Assignments Manual QA

## Teacher Flow
1. Login as School Admin.
2. Confirm a real student, parent link, teacher profile, subject, class, and teacher assignment exist.
3. Login as the assigned Teacher.
4. Open the Teacher dashboard.
5. Confirm Homework / LMS panel appears.
6. Confirm assigned class/subject selector shows real assigned pairs.
7. Create homework for the assigned class and subject.
8. Create learning material for the assigned class and subject.
9. Confirm both records appear in the Teacher panel.

## Student Flow
1. Login as a student in the assigned class.
2. Open the Student dashboard.
3. Confirm homework appears under Homework / Learning Materials.
4. Confirm learning material appears.
5. Confirm unrelated class records do not appear.

## Parent Flow
1. Login as a linked Parent.
2. Open /parent.
3. Select the linked child.
4. Confirm child homework appears.
5. Confirm child learning material appears.
6. Confirm unrelated child/class records do not appear.

## School Admin Monitoring
1. Login as School Admin.
2. Open /school-admin.
3. Open LMS.
4. Confirm summary cards show real homework/material counts.
5. Confirm homework monitoring table shows teacher-created homework.
6. Confirm learning material table shows teacher-created material.
7. Confirm readiness/setup coach updates after records exist.

## Failure Checks
- Teacher cannot create homework for unassigned class/subject.
- Teacher cannot create LMS material for unassigned class/subject.
- Student cannot see unrelated class homework/materials.
- Parent cannot see unrelated child homework/materials.
- No fake data appears.
- No raw route errors appear.
- Browser calls use /api paths, not direct /v1.