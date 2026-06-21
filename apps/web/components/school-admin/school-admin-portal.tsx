"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Clock3,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Library,
  Megaphone,
  RefreshCw,
  School,
  Settings,
  ShieldCheck,
  Sparkles,
  TableProperties,
  UserRoundCheck,
  Users,
  WalletCards
} from "lucide-react";
import { formatNumber } from "../../lib/super-admin-dashboard";
import { normalizeSchoolAdminDashboard, type SchoolAdminDashboardData } from "../../lib/school-admin-dashboard";

type ModuleId =
  | "dashboard"
  | "admissions"
  | "students"
  | "parents"
  | "teachers"
  | "academic"
  | "classes"
  | "sections"
  | "subjects"
  | "attendance"
  | "timetable"
  | "exams"
  | "fees"
  | "library"
  | "reading"
  | "lms"
  | "notices"
  | "reports"
  | "settings";

type ApiOne<T> = { success: true; data: T };
type ApiList<T> = { success: true; data: T[] };
type LeaveRequest = {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  reason: string;
  parentNote?: string | null;
  reviewerComment?: string | null;
  createdAt: string;
  student?: { name?: string | null; admissionNumber?: string | null; className?: string | null } | null;
  requestedBy?: { name?: string | null; email?: string | null } | null;
};
type IconType = React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
type ModuleStatus = "Ready" | "Setup Required" | "Preview" | "Locked" | "Coming Later";

type ModuleConfig = {
  id: ModuleId;
  label: string;
  icon: IconType;
  purpose: string;
  status: ModuleStatus;
  countKey?: keyof ReturnType<typeof normalizeSchoolAdminDashboard>["metrics"];
  nextAction: string;
  requirements: string;
};

const modules: ModuleConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: GraduationCap, purpose: "Principal daily brief, setup coach, school metrics, and analytics.", status: "Ready", nextAction: "Review school operations", requirements: "Uses the school admin dashboard endpoint." },
  { id: "admissions", label: "Admissions", icon: ClipboardList, purpose: "Inquiry, application, interview, and enrollment pipeline.", status: "Preview", countKey: "admissions", nextAction: "Open admissions after the dedicated workflow slice", requirements: "Needs admission applications and review states." },
  { id: "students", label: "Students", icon: GraduationCap, purpose: "Student directory, class/section assignment, and parent links.", status: "Setup Required", countKey: "students", nextAction: "Add students after academic setup", requirements: "Needs classes, sections, and student profiles." },
  { id: "parents", label: "Parents", icon: Users, purpose: "Guardian accounts, linked children, engagement, and contact workflows.", status: "Setup Required", countKey: "parents", nextAction: "Link parents after student profiles exist", requirements: "Needs student profiles and guardian links." },
  { id: "teachers", label: "Teachers", icon: UserRoundCheck, purpose: "Teacher accounts, subject assignments, and class responsibility.", status: "Setup Required", countKey: "teachers", nextAction: "Create teachers before assignments", requirements: "Needs teacher profiles and academic structure." },
  { id: "academic", label: "Academic Setup", icon: BookOpen, purpose: "Academic year, classes, sections, subjects, and teacher assignment foundation.", status: "Setup Required", nextAction: "Create academic year, classes, sections, and subjects", requirements: "Academic setup is the dependency for attendance, exams, timetable, and LMS." },
  { id: "classes", label: "Classes", icon: School, purpose: "Grade/class records and class-level structure.", status: "Setup Required", countKey: "classes", nextAction: "Create classes before sections", requirements: "Needs academic year and class records." },
  { id: "sections", label: "Sections", icon: TableProperties, purpose: "Class sections, rosters, capacity, and timetable grouping.", status: "Setup Required", countKey: "sections", nextAction: "Create sections after classes", requirements: "Needs class records." },
  { id: "subjects", label: "Subjects/Courses", icon: BookOpen, purpose: "Subject catalog and teacher assignment readiness.", status: "Setup Required", countKey: "subjects", nextAction: "Create subjects after classes", requirements: "Needs class structure and teacher profiles." },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, purpose: "Daily attendance summaries, teacher marking queues, and exceptions.", status: "Setup Required", countKey: "attendance", nextAction: "Add students and sections before attendance", requirements: "Needs students, sections, and attendance records." },
  { id: "timetable", label: "Timetable", icon: CalendarDays, purpose: "Class, section, subject, and teacher schedule grid.", status: "Setup Required", countKey: "timetable", nextAction: "Complete academic setup before timetable", requirements: "Needs classes, sections, subjects, and teacher assignments." },
  { id: "exams", label: "Exams/Results", icon: ClipboardList, purpose: "Exam schedules, marks, result summaries, and publishing.", status: "Setup Required", countKey: "exams", nextAction: "Create exam schedule before marks/results", requirements: "Needs academic setup and exam records." },
  { id: "fees", label: "Fees/Finance", icon: WalletCards, purpose: "Fee structures, invoices, payments, and parent-friendly fee status.", status: "Setup Required", countKey: "fees", nextAction: "Create fee structure before invoices", requirements: "Needs fee setup records." },
  { id: "library", label: "Library", icon: Library, purpose: "Book catalog, availability, circulation, overdue, and reading support.", status: "Preview", countKey: "libraryBooks", nextAction: "Add books and copies before circulation", requirements: "Needs library book records." },
  { id: "reading", label: "Reading Program", icon: Sparkles, purpose: "Digital reading room, parent reading support, book requests, and reading challenges.", status: "Coming Later", nextAction: "Build after library catalog is stable", requirements: "Needs reading item, assignment, and confirmation models later." },
  { id: "lms", label: "LMS", icon: BookOpen, purpose: "Learning materials, assignments, submissions, and progress tracking.", status: "Preview", countKey: "lmsProgress", nextAction: "Add LMS materials after classes and subjects", requirements: "Needs courses, materials, assignments, and progress records." },
  { id: "notices", label: "Notices", icon: Megaphone, purpose: "Audience-targeted announcements and acknowledgement-ready communication.", status: "Preview", nextAction: "Create real notices before notification cards appear", requirements: "Needs notice records and audience rules." },
  { id: "reports", label: "Reports", icon: ClipboardList, purpose: "School, teacher, student, attendance, finance, exam, and library reports.", status: "Preview", nextAction: "Reports will use real database queries only", requirements: "Needs populated module data." },
  { id: "settings", label: "Settings", icon: Settings, purpose: "School profile, campuses, academic defaults, branding, and provider settings.", status: "Preview", nextAction: "Configure once settings workflow is enabled", requirements: "Needs school profile and provider configuration records." }
];

export function SchoolAdminPortal() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const active = modules.find((item) => item.id === activeModule) ?? modules[0];

  return (
    <div className="theme-school-admin grid gap-5 xl:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-border bg-surface p-3 shadow-panel xl:sticky xl:top-4 xl:self-start">
        <div className="border-b border-border px-2 pb-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">School Admin / Principal</p>
          <p className="mt-1 text-lg font-semibold">School operations</p>
        </div>
        <nav className="mt-3 grid max-h-[70vh] gap-1 overflow-y-auto pr-1" aria-label="School Admin modules">
          {modules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                onClick={() => setActiveModule(item.id)}
                type="button"
              >
                <Icon aria-hidden={true} size={16} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">School Admin / Principal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">School Operations Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Real school-scoped metrics, setup guidance, analytics, and safe module entry points for the assigned school.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => setRefreshKey((value) => value + 1)} type="button">
            <RefreshCw aria-hidden={true} size={16} />
            Refresh
          </button>
        </header>

        {activeModule === "dashboard" ? <Dashboard refreshKey={refreshKey} /> : <ModulePreview module={active} />}
      </main>
    </div>
  );
}

function Dashboard({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error, retry } = useDashboard(refreshKey);
  if (loading) return <StatePanel text="Loading school dashboard" />;
  if (error) return <StatePanel text={error} tone="error" onRetry={retry} />;
  if (!data) return <StatePanel text="No school dashboard data is available." />;

  const dashboard = normalizeSchoolAdminDashboard(data);
  const currentDate = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date());
  const metricCards = [
    ["Campuses", dashboard.metrics.campuses, "Campus records scoped to this school", School],
    ["Teachers", dashboard.metrics.teachers, "Teacher profiles in this school", UserRoundCheck],
    ["Students", dashboard.metrics.students, "Student profiles in this school", GraduationCap],
    ["Parents", dashboard.metrics.parents, "Parent/guardian accounts linked to this school", Users],
    ["Classes", dashboard.metrics.classes, "Class records in this school", School],
    ["Sections", dashboard.metrics.sections, "Section records in this school", TableProperties],
    ["Subjects/Courses", dashboard.metrics.subjects, "Subject records in this school", BookOpen],
    ["Admissions", dashboard.metrics.admissions, "Admission application records", ClipboardList],
    ["Attendance Records", dashboard.metrics.attendance, "Attendance records available", CalendarCheck],
    ["Fee Records", dashboard.metrics.fees, "Fee records available", WalletCards],
    ["Exam Records", dashboard.metrics.exams, "Exam records available", ClipboardList],
    ["Library Books", dashboard.metrics.libraryBooks, "Book records in this school", Library],
    ["LMS Progress", dashboard.metrics.lmsProgress, "LMS progress records available", Sparkles]
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{currentDate}</p>
            <h2 className="mt-1 text-2xl font-semibold">{dashboard.school?.name ?? "Assigned school"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Principal Daily Brief for school operations. {dashboard.school?.slug ? `${dashboard.school.slug} - ` : ""}{dashboard.school?.status ?? "Status unavailable"}.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-success">
            <ShieldCheck aria-hidden={true} size={16} />
            School-scoped access
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SetupCoach dashboard={dashboard} />
        <ActionQueue dashboard={dashboard} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value, detail, Icon]) => (
          <MetricCard key={label} label={label} value={value} detail={detail} Icon={Icon} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Students by class" rows={dashboard.studentsByClass.map((item) => ({ label: item.label, value: item.count }))} emptyText="No data yet. Start setting up students and classes." />
        <BarChart title="Admissions by status" rows={dashboard.admissionsByStatus.map((item) => ({ label: item.status, value: item.count }))} emptyText="No data yet. Start setting up admissions before this chart can show applications." />
        <BarChart title="Attendance by status" rows={dashboard.attendanceByStatus.map((item) => ({ label: item.status, value: item.count }))} emptyText="No data yet. Attendance has not been marked for this period." />
        <BarChart title="Fee status summary" rows={dashboard.feeStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No data yet. Create a fee structure before invoices and parent fee views." />
        <BarChart title="Exam status summary" rows={dashboard.examStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No data yet. Create exam schedules before marks/results." />
        <BarChart title="Library status summary" rows={dashboard.libraryStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No data yet. Add books and copies before issuing library books." />
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
        <div className="flex flex-col gap-1 border-b border-border pb-3">
          <h2 className="text-base font-semibold">Module Hub</h2>
          <p className="text-sm text-muted-foreground">Safe module states with real counts where available. No module link leaves this dashboard unless the route already exists in the app shell.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.filter((item) => item.id !== "dashboard").map((item) => (
            <ModuleStatusCard key={item.id} module={item} dashboard={dashboard} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface shadow-panel">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Recent school activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Last updated {dashboard.lastUpdatedAt ? formatDate(dashboard.lastUpdatedAt) : "Not available"}</p>
        </div>
        {dashboard.recentActivity.length === 0 ? (
          <StatePanel text="No recent school activity found." compact />
        ) : (
          <div className="divide-y divide-border">
            {dashboard.recentActivity.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{item.action} {item.resource}</p>
                  <p className="text-muted-foreground">{item.actorName ?? item.actorEmail ?? "System"}</p>
                </div>
                <time className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LeaveRequestReviewQueue() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api("leave-requests?pageSize=6")
      .then((payload: ApiList<LeaveRequest>) => setRequests(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Leave request queue could not load."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function review(id: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW" | "CLARIFICATION_REQUESTED") {
    setMessage(null);
    try {
      await api(`leave-requests/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewerComment: comments[id] || null })
      });
      setComments((current) => ({ ...current, [id]: "" }));
      setMessage({ tone: "success", text: "Leave request updated." });
      setRefreshKey((value) => value + 1);
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Leave request could not be updated." });
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Parent leave request queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">School-scoped parent leave and half-day requests awaiting review.</p>
        </div>
        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)} type="button">
          <RefreshCw aria-hidden={true} size={15} />
          Refresh
        </button>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {loading ? <StatePanel text="Loading leave requests" compact /> : error ? <StatePanel text={error} tone="error" compact onRetry={() => setRefreshKey((value) => value + 1)} /> : requests.length === 0 ? <StatePanel text="No parent leave requests are waiting for review." compact /> : (
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 aria-hidden={true} className="text-primary" size={16} />
                    <p className="font-semibold">{request.student?.name ?? "Student"} - {humanize(request.type)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{request.student?.className ?? "Class not available"} | {request.requestedBy?.name ?? request.requestedBy?.email ?? "Parent"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(request.startDate)} to {formatDate(request.endDate)}</p>
                </div>
                <LeaveStatusBadge status={request.status} />
              </div>
              <p className="mt-3 text-sm leading-6">{request.reason}</p>
              {request.parentNote ? <p className="mt-2 rounded-md border border-border bg-surface p-2 text-sm text-muted-foreground">Parent note: {request.parentNote}</p> : null}
              <label className="mt-3 grid gap-1 text-sm font-medium">
                Review comment
                <textarea className="min-h-16 rounded-md border border-border bg-surface px-3 py-2 text-sm" value={comments[request.id] ?? ""} onChange={(event) => setComments((current) => ({ ...current, [request.id]: event.target.value }))} />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 text-sm font-medium text-success" onClick={() => review(request.id, "APPROVED")} type="button"><CheckCircle2 aria-hidden={true} size={15} />Approve</button>
                <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-error/30 bg-error/10 px-3 text-sm font-medium text-error" onClick={() => review(request.id, "REJECTED")} type="button">Reject</button>
                <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium" onClick={() => review(request.id, "CLARIFICATION_REQUESTED")} type="button">Ask clarification</button>
                <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium" onClick={() => review(request.id, "UNDER_REVIEW")} type="button">Mark under review</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function SetupCoach({ dashboard }: { dashboard: ReturnType<typeof normalizeSchoolAdminDashboard> }) {
  const steps = [
    ["Create academic year", dashboard.metrics.classes + dashboard.metrics.sections + dashboard.metrics.subjects > 0],
    ["Add classes", dashboard.metrics.classes > 0],
    ["Add sections", dashboard.metrics.sections > 0],
    ["Add subjects", dashboard.metrics.subjects > 0],
    ["Add teachers", dashboard.metrics.teachers > 0],
    ["Assign teachers", dashboard.metrics.teachers > 0 && dashboard.metrics.subjects > 0],
    ["Add students", dashboard.metrics.students > 0],
    ["Link parents/guardians", dashboard.metrics.parents > 0],
    ["Create fee structure", dashboard.metrics.fees > 0],
    ["Add library books", dashboard.metrics.libraryBooks > 0],
    ["Create notices", dashboard.recentActivity.some((item) => item.resource.toLowerCase().includes("notice"))],
    ["Prepare exams/timetable later", dashboard.metrics.exams > 0 || dashboard.metrics.timetable > 0]
  ] as const;
  const complete = steps.filter(([, done]) => done).length;

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">School Setup Coach</h2>
          <p className="mt-1 text-sm text-muted-foreground">Real setup dependencies, not assumed completion.</p>
        </div>
        <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-sm font-medium text-primary">{formatNumber(complete)} / {formatNumber(steps.length)}</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map(([label, done]) => (
          <div key={label} className="flex items-center gap-2 rounded-md border border-border bg-background p-3 text-sm">
            {done ? <CheckCircle2 aria-hidden={true} className="text-success" size={17} /> : <AlertCircle aria-hidden={true} className="text-warning" size={17} />}
            <span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionQueue({ dashboard }: { dashboard: ReturnType<typeof normalizeSchoolAdminDashboard> }) {
  const actions = [
    dashboard.metrics.classes === 0 ? "Create classes before sections, subjects, timetable, and attendance." : null,
    dashboard.metrics.sections === 0 ? "Create sections after classes so students can be grouped correctly." : null,
    dashboard.metrics.subjects === 0 ? "Create subjects/courses before teacher assignment and LMS setup." : null,
    dashboard.metrics.teachers === 0 ? "Add teachers before class readiness and timetable views can work." : null,
    dashboard.metrics.students === 0 ? "No students yet. Add students manually or convert approved admissions later." : null,
    dashboard.metrics.fees === 0 ? "Create a fee structure before invoices and parent fee views." : null,
    dashboard.metrics.libraryBooks === 0 ? "Add books and copies before issuing library books." : null,
    dashboard.metrics.attendance === 0 ? "Attendance has not been marked for this period." : null
  ].filter(Boolean) as string[];

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Today's Action Queue</h2>
      {actions.length === 0 ? <StatePanel text="No setup actions are pending from the available dashboard data." compact /> : (
        <div className="mt-4 space-y-3">
          {actions.slice(0, 6).map((item) => (
            <div key={item} className="flex gap-3 rounded-md border border-border bg-background p-3 text-sm">
              <AlertCircle aria-hidden={true} className="mt-0.5 shrink-0 text-warning" size={17} />
              <p className="leading-5 text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value, detail, Icon }: { label: string; value: number; detail: string; Icon: IconType }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{formatNumber(value)}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </section>
  );
}

function ModulePreview({ module }: { module: ModuleConfig }) {
  const Icon = module.icon;
  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-panel">
      <div className="flex max-w-4xl items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={20} /></span>
        <div className="min-w-0">
          <StatusBadge status={module.status} />
          <h2 className="mt-3 text-xl font-semibold">{module.label}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.purpose}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Setup requirements</p>
              <p className="mt-1 text-sm leading-5">{module.requirements}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Next safe action</p>
              <p className="mt-1 text-sm leading-5">{module.nextAction}</p>
            </div>
          </div>
          <button className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-muted-foreground" type="button" disabled>
            Workflow not opened in Phase 32B
          </button>
        </div>
      </div>
    </section>
  );
}

function ModuleStatusCard({ module, dashboard }: { module: ModuleConfig; dashboard: ReturnType<typeof normalizeSchoolAdminDashboard> }) {
  const Icon = module.icon;
  const count = module.countKey ? dashboard.metrics[module.countKey] : undefined;
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={19} /></span>
        <StatusBadge status={module.status} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{module.label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.purpose}</p>
      {typeof count === "number" ? <p className="mt-3 text-sm font-medium">Real count: {formatNumber(count)}</p> : null}
      <button className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted-foreground" type="button" disabled>
        {module.nextAction}
      </button>
    </article>
  );
}


function LeaveStatusBadge({ status }: { status: string }) {
  const className = status === "APPROVED"
    ? "border-success/25 bg-success/10 text-success"
    : status === "REJECTED"
      ? "border-error/25 bg-error/10 text-error"
      : "border-warning/30 bg-warning/10 text-warning";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${className}`}>{humanize(status)}</span>;
}
function StatusBadge({ status }: { status: ModuleStatus }) {
  const className = status === "Ready"
    ? "border-success/25 bg-success/10 text-success"
    : status === "Setup Required"
      ? "border-warning/30 bg-warning/10 text-warning"
      : status === "Locked"
        ? "border-error/25 bg-error/10 text-error"
        : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${className}`}>{status}</span>;
}

function BarChart({ title, rows, emptyText }: { title: string; rows: Array<{ label: string; value: number }>; emptyText: string }) {
  const safeRows = rows.filter((row) => row.label);
  const max = Math.max(...safeRows.map((row) => row.value), 1);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {safeRows.length === 0 ? <StatePanel text={emptyText} compact /> : (
        <div className="mt-4 space-y-3">
          {safeRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{row.label}</span>
                <span className="text-muted-foreground">{formatNumber(row.value)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted" aria-label={`${row.label}: ${formatNumber(row.value)}`}>
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatePanel({ text, tone, compact, onRetry }: { text: string; tone?: "error"; compact?: boolean; onRetry?: () => void }) {
  return (
    <div className={`rounded-lg border ${tone === "error" ? "border-error/30 bg-error/10 text-error" : "border-border bg-surface text-muted-foreground"} ${compact ? "mt-4 p-4" : "p-6"} text-sm`} role={tone === "error" ? "alert" : undefined}>
      {text}
      {onRetry ? <button className="ml-3 rounded-md border border-border px-3 py-1" onClick={onRetry} type="button">Retry</button> : null}
    </div>
  );
}

function useDashboard(refreshKey: number) {
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api("dashboard")
      .then((payload: ApiOne<SchoolAdminDashboardData>) => setData(payload.data))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Request failed."))
      .finally(() => setLoading(false));
  }, [refreshKey, retryKey]);
  return { data, loading, error, retry: () => setRetryKey((value) => value + 1) };
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/school-admin/${path}`, { headers: { "content-type": "application/json" }, ...init });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
