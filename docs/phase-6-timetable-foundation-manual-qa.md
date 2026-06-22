# Phase 6 Timetable Foundation Manual QA

## Prerequisites

- Login works for School Admin, assigned Teacher, linked Parent, and Student if available.
- Academic setup exists: active academic year, classes, sections, and subjects.
- At least one teacher exists.
- At least one teacher assignment exists.
- At least one student exists in the target class.
- Parent is linked to the student.

## School Admin Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Confirm Timetable is openable.
4. Open Timetable.
5. Confirm class, subject, and teacher dropdowns are populated from real records.
6. Create a timetable slot for Grade 1 or another real class.
7. Select a real subject.
8. Select a real teacher.
9. Select day of week.
10. Enter start time such as `08:00`.
11. Enter end time such as `08:40`.
12. Save timetable slot.
13. Confirm slot appears in the timetable table.
14. Edit the slot time or status.
15. Confirm the updated slot remains visible.
16. Refresh dashboard and confirm timetable readiness/count updates.

## Teacher Flow

1. Login as the assigned Teacher.
2. Open the teacher dashboard.
3. Confirm `My Timetable` appears.
4. Confirm the slot assigned to this teacher appears with class, subject, day, and time.
5. Confirm unrelated teacher slots do not appear.

## Parent Flow

1. Login as linked Parent.
2. Open parent portal.
3. Select linked child.
4. Confirm `Class Timetable` appears.
5. Confirm timetable slots for the child's class appear.
6. Confirm unrelated class timetable is not visible.

## Student Flow

1. Login as Student if student portal account is available.
2. Open student dashboard.
3. Confirm `My Timetable` appears.
4. Confirm only own class timetable slots appear.

## Failure Checks

- Cannot create slot without class.
- Cannot create slot without teacher.
- Cannot create slot without subject.
- Cannot create slot without day.
- Cannot create slot without start and end time.
- End time must be after start time.
- Teacher cannot see unrelated timetable.
- Parent cannot see unrelated child timetable.
- Student cannot see unrelated class timetable.
- No fake timetable rows appear.
- No raw route errors appear.