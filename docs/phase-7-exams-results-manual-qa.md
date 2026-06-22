# Phase 7 Exams And Results Manual QA

## Prerequisites

- Login works for School Admin, assigned Teacher, linked Parent, and Student if available.
- Academic setup exists: active academic year, classes, sections, and subjects.
- At least one teacher exists.
- At least one active teacher assignment exists for the target class and subject.
- At least one active student exists in the target class.
- Parent is linked to the student.

## School Admin Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Exams/Results.
4. Confirm class and subject dropdowns are populated from real records.
5. Create exam schedule for Grade 1 or another real class.
6. Select a real subject.
7. Enter exam date.
8. Enter total marks.
9. Enter passing marks less than or equal to total marks.
10. Save exam schedule.
11. Confirm the exam appears in the schedule table.
12. Edit the exam status or date.
13. Confirm the update persists.

## Teacher Flow

1. Login as assigned Teacher.
2. Open the teacher dashboard.
3. Confirm Exam Marks Entry appears.
4. Select the exam created by School Admin.
5. Confirm real students load for the assigned class.
6. Enter marks for one or more students.
7. Save marks.
8. Refresh or revisit the exam.
9. Confirm saved marks remain visible.

## School Admin Results Check

1. Login as School Admin again.
2. Open Exams/Results.
3. Confirm result records appear.
4. Confirm result count and average score update.

## Parent Flow

1. Login as linked Parent.
2. Open parent portal.
3. Select linked child.
4. Confirm Exam Results shows the child's marks.
5. Confirm unrelated child results are not visible.

## Student Flow

1. Login as Student if student portal account is available.
2. Open student dashboard.
3. Confirm My Results appears.
4. Confirm only own result records appear.

## Failure Checks

- Cannot create exam without class.
- Cannot create exam without subject.
- Cannot create exam without exam name.
- Cannot create exam without date.
- Cannot create exam without total marks.
- Passing marks cannot exceed total marks.
- Teacher cannot enter marks for unassigned class/subject.
- Marks obtained cannot exceed total marks.
- Parent cannot see unrelated child results.
- Student cannot see unrelated results.
- Duplicate marks update safely instead of creating confusing duplicate rows.
- No fake data appears.
- No raw route errors appear.