# Phase 5 Attendance Management Manual QA

## Teacher Attendance Flow

1. Login as School Admin.
2. Confirm academic setup, student, teacher, and teacher assignment exist.
3. Login as the assigned Teacher.
4. Open the Teacher dashboard.
5. Find Attendance Marking.
6. Select assigned class.
7. Select section or All sections.
8. Select date.
9. Confirm real students load.
10. Mark one student `PRESENT`.
11. Mark one student `ABSENT`, `LATE`, `HALF_DAY`, or `EXCUSED` if available.
12. Save attendance.
13. Refresh and confirm saved statuses remain.

## School Admin Monitoring

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Attendance.
4. Select the same date.
5. Confirm status summary counts appear.
6. Confirm marked student attendance records appear.
7. Filter by status and confirm records update.

## Parent Visibility

1. Login as linked Parent.
2. Open Parent portal.
3. Select linked child.
4. Confirm attendance summary updates.
5. Confirm Recent Attendance shows the marked record.

## Student Visibility

1. Login as Student if a student account exists.
2. Open Student portal.
3. Confirm My Attendance appears.
4. Confirm only the student's own attendance records appear.

## Failure Checks

1. Teacher cannot mark an unassigned class.
2. Parent cannot see unrelated child attendance.
3. Student cannot see other student attendance.
4. Marking the same student/date updates the existing record instead of creating duplicate visible rows.
5. No fake data appears.
6. No raw route errors appear.
7. Locked modules remain locked.
