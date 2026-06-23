"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Library,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  UserRoundCheck
} from "lucide-react";

type IconType = React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
type Row = Record<string, unknown>;
type ApiOne<T> = { success: true; data: T };
type ModuleStatus = "Ready" | "Setup Required" | "Preview" | "Locked" | "Coming Later";
type TeacherAttendanceContext = {
  profile?: Row | null;
  assignments?: Array<{ id: string; classId: string; sectionId?: string | null; class?: Row | null; section?: Row | null; subject?: Row | null }>;
  classes?: Row[];
  message?: string;
};
type TeacherAttendanceStudent = Row & { name: string; suggestedStatus?: string; attendance?: Row | null; approvedLeave?: Row | null };

type MetricConfig = {
  key: string;
  label: string;
  detail: string;
  icon: IconType;
  currency?: boolean;
};

type PreviewConfig = {
  label: string;
  purpose: string;
  status: ModuleStatus;
  nextAction: string;
  icon: IconType;
  countKey?: string;
};

type RoleDashboardConfig = {
  themeClass: string;
  endpoint: string;
  roleLabel: string;
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDetail: string;
  attentionTitle: string;
  attentionEmpty: string;
  metrics: MetricConfig[];
  previews: PreviewConfig[];
  profileTitle: string;
  profileEmpty: string;
};

const configs: Record<"teacher" | "student" | "parent" | "librarian" | "finance", RoleDashboardConfig> = {
  teacher: {
    themeClass: "theme-teacher",
    endpoint: "teacher",
    roleLabel: "Teacher",
    title: "Teacher Daily Workspace",
    subtitle: "Assigned teaching work appears here when class, subject, timetable, and LMS records exist for this teacher.",
    heroTitle: "Class readiness board",
    heroDetail: "Use this workspace to review classes, attendance readiness, assignments, marks, parent messages, and notices without exposing unrelated school data.",
    attentionTitle: "Today's teaching queue",
    attentionEmpty: "No assigned teaching work is available yet. Assign classes, sections, and subjects before this board can show daily tasks.",
    profileTitle: "Teacher profile summary",
    profileEmpty: "Teacher profile data is not available from the dashboard endpoint yet.",
    metrics: [
      { key: "classes", label: "Assigned classes", detail: "Class records returned for this teacher.", icon: Users },
      { key: "attendance", label: "Attendance records", detail: "Attendance data available to this teacher.", icon: CalendarCheck },
      { key: "assignments", label: "Assignments", detail: "Homework or assignment records in scope.", icon: FileText },
      { key: "exams", label: "Exams", detail: "Exam schedule records in scope.", icon: BookOpen },
      { key: "marks", label: "Marks records", detail: "Marks entries visible to this teacher.", icon: GraduationCap },
      { key: "materials", label: "Learning materials", detail: "Published or draft LMS material records.", icon: ClipboardList },
      { key: "messages", label: "Parent messages", detail: "Teacher-parent communication records.", icon: MessageSquareText },
      { key: "onlineClasses", label: "Online classes", detail: "Live class records in scope.", icon: CalendarDays }
    ],
    previews: [
      { label: "Today's timetable", purpose: "Shows assigned class periods once timetable data exists.", status: "Setup Required", nextAction: "Create timetable slots and teacher assignments.", icon: CalendarDays },
      { label: "Attendance marking queue", purpose: "Highlights classes that still need attendance.", status: "Preview", nextAction: "Enable attendance after class and student setup.", icon: CalendarCheck, countKey: "attendance" },
      { label: "Homework review", purpose: "Shows submissions that need teacher feedback.", status: "Preview", nextAction: "Publish assignments before submissions appear.", icon: FileText, countKey: "assignments" },
      { label: "Marks pending", purpose: "Tracks exam marks that need entry or publishing.", status: "Preview", nextAction: "Create exam schedules before marks entry.", icon: GraduationCap, countKey: "marks" },
      { label: "Parent messages", purpose: "Keeps teacher-parent threads scoped to assigned students.", status: "Preview", nextAction: "Enable communication workflows when ready.", icon: MessageSquareText, countKey: "messages" },
      { label: "Student needs attention", purpose: "Will use real attendance/results/LMS signals only.", status: "Coming Later", nextAction: "Collect enough real student progress data first.", icon: AlertCircle }
    ]
  },
  student: {
    themeClass: "theme-student",
    endpoint: "student",
    roleLabel: "Student",
    title: "Student Growth Dashboard",
    subtitle: "A focused student view for daily work, attendance, learning, results, library, fees, and notices from real student-scoped data.",
    heroTitle: "Student daily focus",
    heroDetail: "Today's timetable, assignments, exams, library, and LMS items appear only when records exist for this student.",
    attentionTitle: "What matters today",
    attentionEmpty: "No student tasks are available yet. Timetable, assignments, results, and LMS progress will appear after setup.",
    profileTitle: "Student profile card",
    profileEmpty: "Student profile data is not available from the dashboard endpoint yet.",
    metrics: [
      { key: "attendance", label: "Attendance records", detail: "Own attendance records visible to the student.", icon: CalendarCheck },
      { key: "timetable", label: "Timetable items", detail: "Class timetable records in scope.", icon: CalendarDays },
      { key: "assignments", label: "Assignments", detail: "Assigned homework and class work.", icon: FileText },
      { key: "submissions", label: "Submissions", detail: "Student submitted work records.", icon: ClipboardList },
      { key: "materials", label: "Learning materials", detail: "Available LMS material records.", icon: BookOpen },
      { key: "results", label: "Published results", detail: "Results visible to this student.", icon: GraduationCap },
      { key: "certificates", label: "Certificates", detail: "Issued student certificates.", icon: CheckCircle2 },
      { key: "fees", label: "Fee records", detail: "Fee records visible by school policy.", icon: Banknote }
    ],
    previews: [
      { label: "Today's timetable", purpose: "Shows class periods after timetable setup.", status: "Setup Required", nextAction: "Academic setup and timetable records are required.", icon: CalendarDays, countKey: "timetable" },
      { label: "Attendance percentage", purpose: "Uses real attendance records only.", status: "Preview", nextAction: "Mark attendance before summaries appear.", icon: CalendarCheck, countKey: "attendance" },
      { label: "Homework and assignments", purpose: "Lists assigned work and submission states.", status: "Preview", nextAction: "Teachers publish assignments first.", icon: FileText, countKey: "assignments" },
      { label: "Upcoming exams", purpose: "Shows scheduled exams when published to students.", status: "Preview", nextAction: "Create exam schedules before this card fills.", icon: BookOpen },
      { label: "Recommended reading", purpose: "Shows librarian/teacher reading recommendations later.", status: "Coming Later", nextAction: "Add reading lists in the library reading phase.", icon: Library },
      { label: "Achievement portfolio", purpose: "Combines real certificates, reading, projects, and praise notes.", status: "Coming Later", nextAction: "Collect verified achievements first.", icon: Sparkles }
    ]
  },
  parent: {
    themeClass: "theme-parent",
    endpoint: "parent",
    roleLabel: "Parent / Guardian",
    title: "Parent Engagement Hub",
    subtitle: "A linked-child dashboard for attendance, homework, fees, results, notices, reading, and school communication.",
    heroTitle: "What needs my attention?",
    heroDetail: "Parent actions appear only from linked child records, such as fees, notices, leave requests, homework, library, and teacher messages.",
    attentionTitle: "Family action queue",
    attentionEmpty: "No child-linked action is available yet. If no child appears, contact school administration to link the parent account.",
    profileTitle: "Linked children",
    profileEmpty: "No child profile is linked to your account. Contact school administration.",
    metrics: [
      { key: "children", label: "Linked children", detail: "Child profiles linked to this guardian.", icon: Users },
      { key: "attendance", label: "Attendance records", detail: "Attendance records for linked child profiles.", icon: CalendarCheck },
      { key: "results", label: "Published results", detail: "Published child results only.", icon: GraduationCap },
      { key: "homework", label: "Homework records", detail: "Homework visible for linked children.", icon: FileText },
      { key: "fees", label: "Fee records", detail: "Child fee records visible to this parent.", icon: Banknote },
      { key: "payments", label: "Payments", detail: "Payment records linked to children.", icon: CreditCard },
      { key: "communication", label: "Messages/notices", detail: "School communication in parent scope.", icon: MessageSquareText },
      { key: "performance", label: "Progress records", detail: "Child performance summaries when available.", icon: Sparkles }
    ],
    previews: [
      { label: "Child selector", purpose: "Switches between linked children when more than one exists.", status: "Setup Required", nextAction: "Link child profiles to this parent account.", icon: Users, countKey: "children" },
      { label: "Leave request", purpose: "Will support full-day, half-day, late arrival, and early pickup requests.", status: "Preview", nextAction: "Parent leave backend workflow is planned for a later phase.", icon: CalendarCheck },
      { label: "Homework preview", purpose: "Shows linked child assignments when teachers publish work.", status: "Preview", nextAction: "Publish assignments before this card fills.", icon: FileText, countKey: "homework" },
      { label: "Parent-friendly fees", purpose: "Explains due/paid/partial/overdue fee records with real amounts.", status: "Preview", nextAction: "Create fee structures and invoices first.", icon: Banknote, countKey: "fees" },
      { label: "Library and reading", purpose: "Shows issued books, overdue books, and reading support later.", status: "Preview", nextAction: "Library and reading workflows come in a later slice.", icon: Library },
      { label: "Parent data update", purpose: "Lets parents request contact/emergency detail corrections later.", status: "Coming Later", nextAction: "Approval workflow is required before editing official records.", icon: ShieldCheck }
    ]
  },
  librarian: {
    themeClass: "theme-library",
    endpoint: "library",
    roleLabel: "Librarian",
    title: "Library Operations Dashboard",
    subtitle: "A school-scoped library workspace for catalog visibility, circulation previews, reading requests, and digital reading room planning.",
    heroTitle: "Library summary",
    heroDetail: "Catalog, issue, return, fine, overdue, request, and reading data appears only when real library records exist.",
    attentionTitle: "Library work queue",
    attentionEmpty: "No library work queue is available yet. Add book catalog records before circulation and reading insights appear.",
    profileTitle: "Catalog snapshot",
    profileEmpty: "No book catalog summary is available yet. Add books and copies before issuing library books.",
    metrics: [
      { key: "books", label: "Books", detail: "Book records in the school catalog.", icon: BookOpen },
      { key: "availableBooks", label: "Available books", detail: "Available copies/records reported by backend.", icon: Library },
      { key: "issues", label: "Issued records", detail: "Book issue records in scope.", icon: ClipboardList },
      { key: "returns", label: "Returns", detail: "Return records in scope.", icon: CheckCircle2 },
      { key: "fines", label: "Fine records", detail: "Library fine records in scope.", icon: Banknote },
      { key: "pendingFines", label: "Pending fines", detail: "Pending fine count from backend.", icon: AlertCircle },
      { key: "fineAmount", label: "Fine amount", detail: "Fine total from real records.", icon: Banknote, currency: true }
    ],
    previews: [
      { label: "Book catalog", purpose: "Search, filter, and manage real book records when catalog data exists.", status: "Ready", nextAction: "Open the existing book list when catalog management is enabled.", icon: BookOpen, countKey: "books" },
      { label: "Overdue recovery queue", purpose: "Ranks overdue books by real issue and due-date records.", status: "Preview", nextAction: "Issue books before overdue queues can populate.", icon: AlertCircle },
      { label: "Book request queue", purpose: "Parents/students can request books in a later reading workflow.", status: "Coming Later", nextAction: "Add request workflow after catalog stability.", icon: MessageSquareText },
      { label: "Digital Reading Room", purpose: "Librarian-approved digital reading items for students and parents.", status: "Coming Later", nextAction: "Add reading item models and upload/provider policy later.", icon: Library },
      { label: "Reading challenges", purpose: "Uses real reading logs and confirmations only.", status: "Coming Later", nextAction: "Collect reading activity before badges or streaks.", icon: Sparkles }
    ]
  },
  finance: {
    themeClass: "theme-finance",
    endpoint: "finance",
    roleLabel: "Finance Officer",
    title: "Finance Control Dashboard",
    subtitle: "A real-data finance foundation for fee setup, invoices, payments, scholarships, discounts, and reports.",
    heroTitle: "Finance summary",
    heroDetail: "Money totals and fee status cards use backend values only. Empty states explain missing fee setup instead of showing static amounts.",
    attentionTitle: "Finance action queue",
    attentionEmpty: "No finance action is available yet. Create fee structures and invoices before collections, dues, and reports appear.",
    profileTitle: "Fee setup status",
    profileEmpty: "No fee setup data is available yet. Create fee structure before invoices and parent fee views.",
    metrics: [
      { key: "fees", label: "Fee records", detail: "Fee categories or fee records in scope.", icon: Banknote },
      { key: "invoices", label: "Invoices", detail: "Invoice records in scope.", icon: FileText },
      { key: "payments", label: "Payments", detail: "Payment records in scope.", icon: CreditCard },
      { key: "scholarships", label: "Scholarships", detail: "Scholarship records in scope.", icon: Sparkles },
      { key: "discounts", label: "Discounts", detail: "Discount/concession records in scope.", icon: ShieldCheck },
      { key: "reports", label: "Reports", detail: "Finance report records in scope.", icon: ClipboardList },
      { key: "invoicedAmount", label: "Invoiced", detail: "Total invoiced amount from backend.", icon: Banknote, currency: true },
      { key: "paidAmount", label: "Paid", detail: "Total paid amount from backend.", icon: CreditCard, currency: true }
    ],
    previews: [
      { label: "Fee structure", purpose: "Defines school fees before invoices and parent views.", status: "Setup Required", nextAction: "Create fee structure in the finance workflow phase.", icon: Banknote, countKey: "fees" },
      { label: "Paid / unpaid / partial", purpose: "Summarizes real invoice and payment statuses only.", status: "Preview", nextAction: "Create invoices and record payments first.", icon: CreditCard, countKey: "payments" },
      { label: "Parent fee explanation", purpose: "Shows families what is due, why, and by when.", status: "Preview", nextAction: "Requires real fee structures and invoices.", icon: FileText },
      { label: "Daily collection", purpose: "Shows daily/monthly collection from payment records.", status: "Preview", nextAction: "Record payments before collection charts appear.", icon: CalendarDays },
      { label: "Finance reports", purpose: "Audit-friendly reports from real finance data.", status: "Preview", nextAction: "Enable reports after finance records exist.", icon: ClipboardList, countKey: "reports" }
    ]
  }
};

export function RoleDashboardFoundation({ kind }: { kind: keyof typeof configs }) {
  const config = configs[kind];
  const { data, loading, error, retry } = useDashboard(config.endpoint);
  const normalized = useMemo(() => normalizeDashboard(data), [data]);

  return (
    <div className={`${config.themeClass} space-y-5`}>
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{config.roleLabel}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.subtitle}</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={retry} type="button">
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      {loading ? <StatePanel text={`Loading ${config.title.toLowerCase()}`} /> : error ? <StatePanel text={error} tone="error" onRetry={retry} /> : (
        <>
          <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">{config.heroTitle}</p>
                <h2 className="mt-1 text-xl font-semibold">{config.heroDetail}</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-success">
                <ShieldCheck aria-hidden={true} size={16} />
                Role-scoped view
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.metrics.map((item) => (
              <MetricCard key={item.key} item={item} value={normalized.counts[item.key] ?? 0} />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <ActionQueue title={config.attentionTitle} emptyText={config.attentionEmpty} previews={config.previews} counts={normalized.counts} />
            <ProfileSummary title={config.profileTitle} emptyText={config.profileEmpty} data={normalized.raw} kind={kind} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
            <div className="flex flex-col gap-1 border-b border-border pb-3">
              <h2 className="text-base font-semibold">Module status</h2>
              <p className="text-sm text-muted-foreground">Safe module previews with real counts where the backend already provides them.</p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {config.previews.map((item) => (
                <ModuleStatusCard key={item.label} item={item} count={item.countKey ? normalized.counts[item.countKey] ?? 0 : undefined} />
              ))}
            </div>
          </section>

          {kind === "teacher" ? <TeacherTimetablePanel /> : null}
          {kind === "teacher" ? <TeacherAttendanceManager /> : null}
          {kind === "student" ? <StudentTimetablePanel /> : null}
          {kind === "student" ? <StudentAttendancePanel /> : null}
          {kind === "student" ? <StudentFeesPanel /> : null}
          {kind === "finance" ? <FinanceFeesPanel /> : null}
        </>
      )}
    </div>
  );
}

function TeacherTimetablePanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api("teacher", "timetable")
      .then((payload: ApiOne<Row[]> | { success: true; data: Row[] }) => setRecords(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Timetable could not load."))
      .finally(() => setLoading(false));
  }, []);
  return <TimetableList title="My Timetable" records={records} loading={loading} error={error} emptyText="No timetable slots assigned yet." />;
}

function StudentTimetablePanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api("student", "timetable")
      .then((payload: ApiOne<Row[]> | { success: true; data: Row[] }) => setRecords(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Timetable could not load."))
      .finally(() => setLoading(false));
  }, []);
  return <TimetableList title="My Timetable" records={records} loading={loading} error={error} emptyText="No timetable slots have been created for your class yet." />;
}

function TimetableList({ title, records, loading, error, emptyText }: { title: string; records: Row[]; loading: boolean; error: string | null; emptyText: string }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {loading ? <StatePanel text="Loading timetable" compact /> : error ? <StatePanel text={error} tone="error" compact /> : records.length === 0 ? <StatePanel text={emptyText} compact /> : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {records.map((row) => <div key={String(row.id)} className="rounded-md border border-border bg-background p-3 text-sm"><p className="font-medium">{stringValue(row.subject)} - {stringValue(row.className)}</p><p className="mt-1 text-muted-foreground">{stringValue(row.dayOfWeek).replaceAll("_", " ")} - {stringValue(row.startsAt)} to {stringValue(row.endsAt)}</p><p className="mt-1 text-muted-foreground">Teacher: {stringValue(row.teacher)}</p></div>)}
        </div>
      )}
    </section>
  );
}
function TeacherMarksEntryPanel() {
  const [exams, setExams] = useState<Row[]>([]);
  const [examId, setExamId] = useState("");
  const [students, setStudents] = useState<Row[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    api("teacher", "exams")
      .then((payload: ApiOne<Row[]>) => {
        const rows = Array.isArray(payload.data) ? payload.data : [];
        setExams(rows);
        setExamId((current) => current || String(rows[0]?.id ?? ""));
      })
      .catch((caught) => setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Exams could not load." }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!examId) { setStudents([]); return; }
    api("teacher", `exams/${examId}/students`)
      .then((payload: ApiOne<{ students: Row[] }>) => {
        const rows = Array.isArray(payload.data?.students) ? payload.data.students : [];
        setStudents(rows);
        setMarks(Object.fromEntries(rows.map((student) => [String(student.name), String((student.mark as Row | undefined)?.marksObtained ?? "")])));
      })
      .catch((caught) => setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Students could not load for marks entry." }));
  }, [examId]);

  async function saveMarks() {
    setSaving(true);
    setMessage(null);
    try {
      await api("teacher", "results/marks", { method: "POST", body: JSON.stringify({ examId, records: students.map((student) => ({ studentName: String(student.name), marksObtained: Number(marks[String(student.name)] || 0) })) }) });
      setMessage({ tone: "success", text: "Marks saved." });
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Marks could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Exam Marks Entry</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter marks only for assigned class and subject exams.</p>
      {message ? <div className={`mt-3 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {loading ? <StatePanel text="Loading exams" compact /> : exams.length === 0 ? <StatePanel text="Ask School Admin to create exam schedule first." compact /> : (
        <div className="mt-4 space-y-4">
          <label className="grid gap-1 text-sm font-medium">Exam<select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={examId} onChange={(event) => setExamId(event.target.value)}>{exams.map((exam) => <option key={String(exam.id)} value={String(exam.id)}>{stringValue(exam.title)} - {stringValue(exam.className)} - {stringValue(exam.subject)}</option>)}</select></label>
          {students.length === 0 ? <StatePanel text="No students found for this exam class." compact /> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-border text-sm"><thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2 font-semibold">Student</th><th className="px-3 py-2 font-semibold">Marks</th></tr></thead><tbody className="divide-y divide-border">{students.map((student) => <tr key={String(student.id ?? student.name)}><td className="px-3 py-2">{stringValue(student.name)}</td><td className="px-3 py-2"><input className="min-h-9 rounded-md border border-border bg-background px-2 text-sm" min={0} type="number" value={marks[String(student.name)] ?? ""} onChange={(event) => setMarks((current) => ({ ...current, [String(student.name)]: event.target.value }))} /></td></tr>)}</tbody></table></div>}
          <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={saving || students.length === 0} onClick={saveMarks} type="button">{saving ? "Saving..." : "Save marks"}</button>
        </div>
      )}
    </section>
  );
}

function StudentResultsPanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api("student", "results?pageSize=20")
      .then((payload: ApiOne<Row[]>) => setRecords(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Results could not load."))
      .finally(() => setLoading(false));
  }, []);
  return <ResultList title="My Results" records={records} loading={loading} error={error} emptyText="No results have been published for you yet." />;
}

function ResultList({ title, records, loading, error, emptyText }: { title: string; records: Row[]; loading: boolean; error: string | null; emptyText: string }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {loading ? <StatePanel text="Loading results" compact /> : error ? <StatePanel text={error} tone="error" compact /> : records.length === 0 ? <StatePanel text={emptyText} compact /> : <div className="mt-4 grid gap-3 md:grid-cols-2">{records.map((row) => { const percent = Number(row.maxMarks) > 0 ? Math.round((Number(row.marksObtained) / Number(row.maxMarks)) * 100) : null; return <div key={String(row.id)} className="rounded-md border border-border bg-background p-3 text-sm"><p className="font-medium">{stringValue(row.assessment)} - {stringValue(row.subject)}</p><p className="mt-1 text-muted-foreground">{stringValue(row.marksObtained)}/{stringValue(row.maxMarks)}{percent == null ? "" : ` (${percent}%)`}</p><p className="mt-1 text-muted-foreground">{stringValue(row.status)}</p></div>; })}</div>}
    </section>
  );
}
function TeacherAttendanceManager() {
  const today = new Date().toISOString().slice(0, 10);
  const [context, setContext] = useState<TeacherAttendanceContext | null>(null);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<TeacherAttendanceStudent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    api("teacher", "attendance/context")
      .then((payload: ApiOne<TeacherAttendanceContext>) => {
        const data = payload.data ?? {};
        setContext(data);
        const firstClassId = String(data.assignments?.[0]?.classId ?? "");
        setClassId((current) => current || firstClassId);
      })
      .catch((caught) => setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Attendance context could not load." }))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    const query = new URLSearchParams({ classId, date });
    if (sectionId) query.set("sectionId", sectionId);
    api("teacher", `attendance/students?${query.toString()}`)
      .then((payload: ApiOne<{ students: TeacherAttendanceStudent[] }>) => {
        const rows = Array.isArray(payload.data?.students) ? payload.data.students : [];
        setStudents(rows);
        setStatuses(Object.fromEntries(rows.map((row) => [row.name, String(row.attendance?.status ?? row.suggestedStatus ?? "PRESENT")])));
        setRemarks(Object.fromEntries(rows.map((row) => [row.name, String(row.attendance?.remarks ?? "")])));
      })
      .catch((caught) => setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Students could not load for attendance." }));
  }, [classId, sectionId, date]);

  const assignments = context?.assignments ?? [];
  const sections = assignments.filter((item) => item.classId === classId && item.section).map((item) => item.section as Row);

  async function saveAttendance() {
    setSaving(true);
    setMessage(null);
    try {
      await api("teacher", "attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          classId,
          sectionId: sectionId || null,
          date,
          records: students.map((student) => ({ studentName: student.name, status: statuses[student.name] ?? "PRESENT", remarks: remarks[student.name] || null }))
        })
      });
      setMessage({ tone: "success", text: "Attendance saved." });
      setRefreshKey((value) => value + 1);
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Attendance could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Attendance Marking</h2>
          <p className="mt-1 text-sm text-muted-foreground">Mark attendance only for classes assigned by School Admin.</p>
        </div>
        <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)} type="button"><RefreshCw aria-hidden={true} size={15} />Refresh</button>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {loading ? <StatePanel text="Loading attendance setup" compact /> : assignments.length === 0 ? <StatePanel text="Ask School Admin to assign class before marking attendance." compact /> : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium">Class<select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={classId} onChange={(event) => { setClassId(event.target.value); setSectionId(""); }}>
              {Array.from(new Map(assignments.map((item) => [item.classId, item.class])).entries()).map(([id, row]) => <option key={id} value={id}>{stringValue((row as Row)?.name) !== "Not available" ? stringValue((row as Row).name) : id}</option>)}
            </select></label>
            <label className="grid gap-1 text-sm font-medium">Section<select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
              <option value="">All sections</option>
              {sections.map((row) => <option key={String(row.id)} value={String(row.id)}>{stringValue(row.name)}</option>)}
            </select></label>
            <label className="grid gap-1 text-sm font-medium">Date<input className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          </div>
          {students.length === 0 ? <StatePanel text="No students are available for the selected class." compact /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Note</th></tr></thead>
                <tbody className="divide-y divide-border">{students.map((student) => <tr key={student.name}><td className="px-3 py-2">{student.name}{student.approvedLeave ? <span className="ml-2 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-xs text-warning">Approved leave</span> : null}</td><td className="px-3 py-2"><select className="min-h-9 rounded-md border border-border bg-background px-2 text-sm" value={statuses[student.name] ?? "PRESENT"} onChange={(event) => setStatuses((current) => ({ ...current, [student.name]: event.target.value }))}>{["PRESENT", "ABSENT", "LATE", "HALF_DAY", "EXCUSED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td><td className="px-3 py-2"><input className="min-h-9 rounded-md border border-border bg-background px-2 text-sm" value={remarks[student.name] ?? ""} onChange={(event) => setRemarks((current) => ({ ...current, [student.name]: event.target.value }))} /></td></tr>)}</tbody>
              </table>
            </div>
          )}
          <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={saving || students.length === 0} onClick={saveAttendance} type="button">{saving ? "Saving..." : "Save attendance"}</button>
        </div>
      )}
    </section>
  );
}

function StudentAttendancePanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api("student", "attendance?pageSize=10")
      .then((payload: ApiOne<Row[]> | { success: true; data: Row[] }) => setRecords(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Attendance could not load."))
      .finally(() => setLoading(false));
  }, []);
  const present = records.filter((row) => row.status === "PRESENT").length;
  const attendanceRate = records.length === 0 ? null : Math.round((present / records.length) * 100);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">My Attendance</h2>
      {loading ? <StatePanel text="Loading attendance" compact /> : error ? <StatePanel text={error} tone="error" compact /> : records.length === 0 ? <StatePanel text="No attendance has been marked yet." compact /> : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Attendance rate: {attendanceRate == null ? "No data" : `${formatNumber(attendanceRate)}%`}</p>
          {records.slice(0, 8).map((row) => <div key={String(row.id)} className="rounded-md border border-border bg-background p-3 text-sm"><p className="font-medium">{stringValue(row.status).replaceAll("_", " ")}</p><p className="text-muted-foreground">{formatDate(String(row.attendanceDate))} - {stringValue(row.className)}</p></div>)}
        </div>
      )}
    </section>
  );
}

function StudentFeesPanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api("student", "fees?pageSize=20")
      .then((payload: ApiOne<Row[]>) => setRecords(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Fees could not load."))
      .finally(() => setLoading(false));
  }, []);
  return <FeeList title="My Fees" records={records} loading={loading} error={error} emptyText="No fee records have been created for you yet." />;
}

function FinanceFeesPanel() {
  const [records, setRecords] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Row>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    Promise.all([api("finance", "fees?pageSize=10"), api("finance", "fees/summary")])
      .then(([feePayload, summaryPayload]) => {
        setRecords(Array.isArray(feePayload.data) ? feePayload.data : []);
        setSummary(isObject(summaryPayload.data) ? summaryPayload.data : {});
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Finance fees could not load."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Fee Collection</h2>
      {loading ? <StatePanel text="Loading finance fees" compact /> : error ? <StatePanel text={error} tone="error" compact /> : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3 text-sm"><p className="text-muted-foreground">Invoices</p><p className="mt-1 text-xl font-semibold">{formatNumber(Number(summary.total ?? records.length))}</p></div>
            <div className="rounded-md border border-border bg-background p-3 text-sm"><p className="text-muted-foreground">Invoiced</p><p className="mt-1 text-xl font-semibold">{formatCurrency(Number(summary.amount ?? 0))}</p></div>
            <div className="rounded-md border border-border bg-background p-3 text-sm"><p className="text-muted-foreground">Paid</p><p className="mt-1 text-xl font-semibold">{formatCurrency(Number(summary.paidAmount ?? 0))}</p></div>
          </div>
          <FeeList title="Recent fee records" records={records} loading={false} error={null} emptyText="No fee records have been created yet." />
        </div>
      )}
    </section>
  );
}

function FeeList({ title, records, loading, error, emptyText }: { title: string; records: Row[]; loading: boolean; error: string | null; emptyText: string }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {loading ? <StatePanel text="Loading fees" compact /> : error ? <StatePanel text={error} tone="error" compact /> : records.length === 0 ? <StatePanel text={emptyText} compact /> : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {records.map((row) => <div key={String(row.id)} className="rounded-md border border-border bg-background p-3 text-sm"><p className="font-medium">{stringValue(row.feeTitle)} - {stringValue(row.status)}</p><p className="mt-1 text-muted-foreground">Amount: {formatCurrency(Number(row.amount ?? 0))} - Paid: {formatCurrency(Number(row.paidAmount ?? 0))} - Balance: {formatCurrency(Number(row.balanceAmount ?? 0))}</p><p className="mt-1 text-muted-foreground">Due {formatDate(String(row.dueDate))}</p></div>)}
        </div>
      )}
    </section>
  );
}
function MetricCard({ item, value }: { item: MetricConfig; value: number }) {
  const Icon = item.icon;
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{item.currency ? formatCurrency(value) : formatNumber(value)}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
    </article>
  );
}

function ActionQueue({ title, emptyText, previews, counts }: { title: string; emptyText: string; previews: PreviewConfig[]; counts: Record<string, number> }) {
  const actionable = previews.filter((item) => item.status === "Setup Required" || (item.countKey && (counts[item.countKey] ?? 0) === 0)).slice(0, 4);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {actionable.length === 0 ? <StatePanel text={emptyText} compact /> : actionable.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex gap-3 rounded-md border border-border bg-background p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning"><Icon aria-hidden={true} size={17} /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.nextAction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileSummary({ title, emptyText, data, kind }: { title: string; emptyText: string; data: Row; kind: keyof typeof configs }) {
  const profile = getProfileRows(data, kind);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {profile.length === 0 ? <StatePanel text={emptyText} compact /> : (
        <div className="mt-4 space-y-3">
          {profile.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ModuleStatusCard({ item, count }: { item: PreviewConfig; count?: number }) {
  const Icon = item.icon;
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={19} /></span>
        <StatusBadge status={item.status} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{item.label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.purpose}</p>
      {typeof count === "number" ? <p className="mt-3 text-sm font-medium">Real count: {formatNumber(count)}</p> : null}
      <div className="mt-auto pt-4">
        <button className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted-foreground" type="button" disabled>
          {item.nextAction}
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: ModuleStatus }) {
  const className = status === "Ready"
    ? "border-success/25 bg-success/10 text-success"
    : status === "Setup Required"
      ? "border-warning/30 bg-warning/10 text-warning"
      : status === "Locked"
        ? "border-error/25 bg-error/10 text-error"
        : "border-border bg-muted text-muted-foreground";
  return <span className={`rounded-md border px-2 py-1 text-xs font-medium ${className}`}>{status}</span>;
}

function StatePanel({ text, tone, compact, onRetry }: { text: string; tone?: "error"; compact?: boolean; onRetry?: () => void }) {
  return (
    <div className={`rounded-lg border ${tone === "error" ? "border-error/30 bg-error/10 text-error" : "border-border bg-background text-muted-foreground"} ${compact ? "mt-4 p-4" : "p-6"} text-sm`} role={tone === "error" ? "alert" : undefined}>
      {text}
      {onRetry ? <button className="ml-3 rounded-md border border-border bg-surface px-3 py-1 font-medium" onClick={onRetry} type="button">Retry</button> : null}
    </div>
  );
}

function useDashboard(endpoint: string) {
  const [data, setData] = useState<Row>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api(endpoint, "dashboard")
      .then((payload: ApiOne<Row>) => setData(isObject(payload.data) ? payload.data : {}))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Request failed."))
      .finally(() => setLoading(false));
  }, [endpoint, refreshKey]);

  return { data, loading, error, retry: () => setRefreshKey((value) => value + 1) };
}

async function api(endpoint: string, path: string, init?: RequestInit) {
  const response = await fetch(`/api/${endpoint}/${path}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) }
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function normalizeDashboard(data: Row | null | undefined) {
  const raw = isObject(data) ? data : {};
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number") counts[key] = safeNumber(value);
    if (Array.isArray(value)) counts[key] = value.length;
  }
  if (Array.isArray(raw.childProfiles)) counts.children = raw.childProfiles.length;
  return { raw, counts };
}

function getProfileRows(data: Row, kind: keyof typeof configs) {
  if (kind === "teacher" && isObject(data.profile)) {
    return [
      { label: "Name", value: stringValue(data.profile.name) },
      { label: "Employee number", value: stringValue(data.profile.employeeNumber) },
      { label: "Email", value: stringValue(data.profile.email) },
      { label: "Specialization", value: stringValue(data.profile.specialization) },
      { label: "Status", value: stringValue(data.profile.status) }
    ].filter((item) => item.value !== "Not available");
  }

  if (kind === "student" && isObject(data.profile)) {
    return [
      { label: "Name", value: stringValue(data.profile.name) },
      { label: "Class", value: stringValue(data.profile.className) },
      { label: "Admission number", value: stringValue(data.profile.admissionNumber) }
    ].filter((item) => item.value !== "Not available");
  }

  if (kind === "parent" && Array.isArray(data.childProfiles)) {
    return data.childProfiles.slice(0, 4).filter(isObject).map((child) => ({
      label: stringValue(child.name),
      value: [child.className, child.admissionNumber].map(stringValue).filter((value) => value !== "Not available").join(" - ") || "Linked child profile"
    }));
  }

  const rows = [
    { label: "Dashboard source", value: "Real backend dashboard endpoint" },
    { label: "Last refresh", value: new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date()) }
  ];
  return Object.keys(data).length > 0 ? rows : [];
}

function isObject(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "0";
}

function formatCurrency(value: number | null | undefined) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not available";
}


