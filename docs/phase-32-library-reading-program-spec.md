# Phase 32 Library + Reading Program Spec

Date: 2026-06-20
Scope: Documentation/specification only. No implementation changes.

## Product Goal

The library module should be more than book inventory. It should become a reading culture system connecting Librarian, School Admin, Teacher, Student, and Parent. Core circulation is P1; reading challenges, badges, and parent requests are P2 premium differentiators.

## Core Library Foundation

### 1. Book Catalog

Fields:
- title, subtitle, author, publisher, ISBN, category, language, class/age suitability, description, cover image optional, status.

Pages:
- Library dashboard, catalog list, add/edit book, book detail.

Priority: P1.

### 2. Book Copies

Fields:
- bookId, copy number/barcode, shelf/location, condition, availability status, acquisition date, price optional.

Rules:
- Availability must come from copy/circulation state, not a static count.

Priority: P1.

### 3. Categories

- Genre/category tree: fiction, non-fiction, science, history, Islamic studies/religion where school config allows, reference, exam prep, language, age band.
- Categories support recommendations and reports.

Priority: P1/P2.

### 4. ISBN / Author / Publisher

- ISBN should be unique when present but not all schools will have ISBN data.
- Search should support title, author, ISBN, category, shelf.

Priority: P1.

### 5. Shelf / Location

- Shelf/location field helps physical circulation.
- Future: campus/branch location.

Priority: P1.

## Circulation Workflows

### 6. Issue Book

Workflow:
1. Librarian searches student/borrower.
2. Librarian searches/selects available copy.
3. System sets issue date and due date.
4. Copy becomes issued/unavailable.
5. Borrower history updates.
6. Optional notification to parent/student.

Models later:
- `LibraryIssue`, `BookCopy`, `BorrowerProfile`, `Notification`.

Routes later:
- `POST /v1/library/issues`
- `GET /v1/library/borrowers/:id/issues`

Priority: P1.

### 7. Return Book

Workflow:
1. Librarian opens issue record.
2. Marks returned date.
3. Selects condition: good, damaged, lost.
4. Fine can be calculated/entered if policy enabled.
5. Copy becomes available, damaged, or lost.

Models later:
- `LibraryReturn`, `LibraryFine`, `BookCopy`.

Routes later:
- `POST /v1/library/issues/:id/return`

Priority: P1.

### 8. Overdue Tracking

- Overdue status computed from due date and returnedAt.
- Dashboard shows overdue count, oldest overdue, class-wise overdue.

Priority: P1.

### 9. Fine / Damaged / Lost Status

- Damaged/lost status should affect copy availability.
- Fine amount should be auditable and not auto-created unless policy configured.

Priority: P1/P2.

### 10. Borrower Profiles

- Student borrower profile shows issued books, overdue, history, reading log link.
- Teacher/staff borrower support can be future-ready.

Priority: P1.

### 11. Student Reading History

- Reading history includes issued/returned books and reading log entries.
- Parent/student can view their own/linked history.

Priority: P2.

## Parent / Student Request Workflows

### 12. Parent/Student Book Requests

- Student or parent requests a book reservation or new book addition.
- Request includes child/student, title, author if known, category/interest, note, urgency optional.

Priority: P2.

### 13. Request Librarian To Add Book

Workflow:
1. Parent/student submits request.
2. Librarian reviews request queue.
3. Librarian approves, rejects, asks clarification, or marks already available.
4. If approved, request moves to purchase/addition queue or reservation.
5. Parent/student receives status update.

Models later:
- `BookRequest`, `BookRequestTimeline`, `BookPurchaseQueue`, `MessageThread` optional.

Priority: P2 strong demo differentiator.

## Recommended Reading Program

### 14. Recommended Reading Lists

- Librarian/teacher creates lists by class, section, age, term, reading level, subject, or theme.
- Lists contain books already in catalog or external recommendations marked not in library.

Priority: P2.

### 15. Age-wise Reading Lists

- Use age bands/grade ranges.
- Parent/student dashboard can show `Recommended for your class/age`.

Priority: P2.

### 16. Class-wise Reading Lists

- Class teacher/librarian can assign reading list to class/section.
- Completion can feed reading challenge progress.

Priority: P2.

### 17. Reading Challenges

Examples:
- Read 3 books this month.
- Class reading week.
- Genre challenge.
- Summer reading challenge.

Rules:
- Challenge progress must use real reading logs/returns/confirmations.

Priority: P2.

### 18. Reading Badges

- Badges earned from real criteria: books completed, challenge completed, consistent reading logs, genre milestones.
- Badge criteria must be visible and auditable.

Priority: P2.

### 19. Parent Reading Confirmation

- Parent can confirm home reading with note/photo optional if enabled.
- Teacher/librarian can review confirmations if school policy requires.

Priority: P2.

### 20. Reading Analytics

School Admin/Librarian dashboards:
- Total active readers, books issued, overdue, class-wise reading activity, top categories, most-read books, low circulation books, parent confirmations, reading challenge progress.

Priority: P2.

### 21. Library Reports

Reports:
- Inventory report, issued books, overdue books, damaged/lost books, borrower history, class reading report, most-read books, pending requests, purchase queue.

Priority: P1/P2.

## Role Permissions

- School Admin: view school-wide library analytics, configure policies, view reports.
- Librarian: manage catalog, copies, issue/return, requests, reading lists, challenges, reports.
- Teacher: view assigned students' reading context, recommend books/lists where permitted.
- Student: search/view catalog, own issued books, own reading log, own requests.
- Parent: linked child issued books, overdue status, reading list, reservation/add-book request, reading confirmation.
- Finance: no library access unless fines are integrated into finance and permission is granted.

## Dashboard Widgets

Librarian:
- total books, available copies, issued books, overdue books, pending book requests, most read books, reading challenge progress.

School Admin:
- library book count, overdue books, reading culture score, class-wise reading engagement, pending requests.

Student:
- issued books, due date, overdue alert, recommended reading, badges.

Parent:
- linked child issued books, overdue alert, reading progress, request status.

## Required Data Models Later

- `LibraryBook`
- `BookCopy`
- `LibraryIssue`
- `LibraryReturn`
- `LibraryFine`
- `LibraryBorrowerProfile`
- `BookRequest`
- `BookRequestTimeline`
- `BookPurchaseQueue`
- `ReadingList`
- `ReadingListItem`
- `ReadingRecommendation`
- `ReadingLog`
- `ReadingLogConfirmation`
- `ReadingChallenge`
- `ReadingBadge`
- `StudentReadingBadge`

## Required Pages Later

- `/library` dashboard
- `/library/catalog`
- `/library/books/:id`
- `/library/issues`
- `/library/returns`
- `/library/overdue`
- `/library/borrowers/:id`
- `/library/requests`
- `/library/reading-lists`
- `/library/challenges`
- `/student/library`
- `/parent/children/:studentId/library`

## Empty States

- No books: `Add the first book to start the library catalog.`
- No copies: `Add physical copies before issuing this book.`
- No issued books: `No books are currently issued.`
- No overdue books: `No overdue books right now.`
- No reading lists: `Create a reading list for this class or age group.`
- No requests: `No book requests are pending.`
- Not enough reading data: `Reading analytics will appear after students log or return books.`

## What Not To Fake

- Available copies.
- Issue/return state.
- Due dates and overdue status.
- Fines.
- Most-read books.
- Reading badges.
- Top readers.
- Reading culture score.
- Parent participation score.

## Priority Summary

P0:
- Only dashboard counts if real library data already exists.

P1:
- Book catalog, copies, issue/return, overdue tracking, borrower history, inventory reports.

P2:
- Parent/student book requests, request librarian to add book, recommended lists, age/class lists, reading challenges, badges, parent confirmation, reading analytics.
