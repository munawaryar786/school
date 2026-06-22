"use client";

import { useEffect, useState } from "react";
import type { ComponentType, FormEvent } from "react";
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
type ApiList<T> = { success: true; data: T[]; pagination?: { total: number; page: number; pageSize: number; totalPages: number } };
type BulkSetupResult = { created: number; existing: number; total: number; rows: ResourceRow[] };
type ReadinessStatus = "READY" | "SETUP_REQUIRED" | "DEPENDENCY_REQUIRED" | "COMING_LATER";
type ReadinessModule = { id: string; label: string; status: ReadinessStatus; ready: boolean; nextAction: string; missingDependencies: string[] };
type ReadinessData = {
  counts: Record<string, number>;
  flags: Record<string, boolean>;
  modules: Record<string, ReadinessModule>;
  nextActions: Array<{ module: string; action: string; missingDependencies: string[] }>;
};
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
type AdmissionRow = ResourceRow & {
  applicationNo?: string;
  applicantName?: string;
  guardianName?: string;
  guardianPhone?: string;
  desiredClass?: string;
  source?: string;
  appliedOn?: string;
  notes?: string | null;
  enrollments?: Array<{ id: string; enrollmentNo?: string; studentName?: string; className?: string; status?: string; enrolledOn?: string }>;
};
type AttendanceSummary = {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byClass: Array<{ className: string; count: number }>;
};
type IconType = ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
type ModuleStatus = "Ready" | "Setup Required" | "Preview" | "Locked" | "Coming Later";
type FieldType = "text" | "date" | "number" | "select" | "checkbox" | "password";
type ResourceRow = Record<string, any> & { id: string; status?: string };
type FieldConfig = { name: string; label: string; type?: FieldType; required?: boolean; options?: Array<{ value: string; label: string }>; placeholder?: string };
type ResourceConfig = { moduleId: ModuleId; resource: string; title: string; description: string; fields: FieldConfig[]; columns: Array<{ key: string; label: string; render?: (row: ResourceRow) => string }>; submitLabel: string; emptyText: string };

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
  { id: "admissions", label: "Admissions", icon: ClipboardList, purpose: "Application review and enrollment conversion into real student profiles.", status: "Setup Required", countKey: "admissions", nextAction: "Create an admission applicant", requirements: "Needs an active academic year and class records." },
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

const openedModules = new Set<ModuleId>(["academic", "classes", "sections", "subjects", "admissions", "students", "teachers", "parents", "attendance", "timetable"]);
const lockedDependencyText: Partial<Record<ModuleId, string>> = {
  attendance: "Locked until academic years, classes, sections, students, and teacher assignment foundations are complete.",
  timetable: "Locked until classes, sections, subjects, and teacher assignments are available.",
  exams: "Locked until academic setup and subject structure are ready.",
  fees: "Locked until student profiles and finance setup are opened in a later phase.",
  library: "Locked until the library circulation phase opens catalog and copy workflows.",
  reading: "Locked until library catalog and reading-program models are implemented.",
  lms: "Locked until courses, teacher assignments, and LMS content models are opened."
};

const statusOptions = [{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }];
const dayOptions = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((value) => ({ value, label: humanize(value) }));

const relationOptions = [{ value: "FATHER", label: "Father" }, { value: "MOTHER", label: "Mother" }, { value: "GUARDIAN", label: "Guardian" }, { value: "OTHER", label: "Other" }];
const admissionStatusOptions = [
  { value: "NEW", label: "New" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ENROLLED", label: "Enrolled" }
];

const resourceConfigs: Record<Exclude<ModuleId, "dashboard" | "admissions" | "attendance" | "timetable" | "exams" | "fees" | "library" | "reading" | "lms" | "notices" | "reports" | "settings">, ResourceConfig> = {
  academic: {
    moduleId: "academic",
    resource: "academic-years",
    title: "Academic Setup",
    description: "Create academic years and mark the active/current year for this school.",
    submitLabel: "Save academic year",
    emptyText: "No academic year exists yet.",
    fields: [
      { name: "name", label: "Academic year", required: true, placeholder: "2026-2027" },
      { name: "startsOn", label: "Starts on", type: "date", required: true },
      { name: "endsOn", label: "Ends on", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [
      { key: "name", label: "Year" },
      { key: "startsOn", label: "Starts", render: (row) => shortDate(row.startsOn) },
      { key: "endsOn", label: "Ends", render: (row) => shortDate(row.endsOn) },
      { key: "status", label: "Status" }
    ]
  },
  classes: {
    moduleId: "classes",
    resource: "classes",
    title: "Classes",
    description: "Manage grade/class records. Sections, subjects, students, attendance, and timetable depend on these.",
    submitLabel: "Save class",
    emptyText: "No class records exist yet.",
    fields: [
      { name: "name", label: "Class name", required: true, placeholder: "Grade 1" },
      { name: "code", label: "Code", required: true, placeholder: "G1" },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [{ key: "name", label: "Class" }, { key: "code", label: "Code" }, { key: "status", label: "Status" }]
  },
  sections: {
    moduleId: "sections",
    resource: "sections",
    title: "Sections",
    description: "Create class sections and capacity foundations for rosters and timetable grouping.",
    submitLabel: "Save section",
    emptyText: "No section records exist yet.",
    fields: [
      { name: "classId", label: "Class", type: "select", required: true },
      { name: "name", label: "Section", required: true, placeholder: "A" },
      { name: "capacity", label: "Capacity", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [
      { key: "name", label: "Section" },
      { key: "class", label: "Class", render: (row) => row.class?.name ?? row.classId },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status" }
    ]
  },
  subjects: {
    moduleId: "subjects",
    resource: "subjects",
    title: "Subjects/Courses",
    description: "Manage the subject catalog used by teacher assignments, exams, timetable, and LMS later.",
    submitLabel: "Save subject",
    emptyText: "No subject records exist yet.",
    fields: [
      { name: "name", label: "Subject", required: true, placeholder: "Mathematics" },
      { name: "code", label: "Code", required: true, placeholder: "MATH" },
      { name: "type", label: "Type", type: "select", options: [{ value: "CORE", label: "Core" }, { value: "ELECTIVE", label: "Elective" }] },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [{ key: "name", label: "Subject" }, { key: "code", label: "Code" }, { key: "type", label: "Type" }, { key: "status", label: "Status" }]
  },
  students: {
    moduleId: "students",
    resource: "students",
    title: "Students",
    description: "Create and edit student profiles. This schema currently stores class assignment as class name.",
    submitLabel: "Save student",
    emptyText: "No student profiles exist yet.",
    fields: [
      { name: "admissionNumber", label: "Admission number", required: true },
      { name: "name", label: "Student name", required: true },
      { name: "guardianName", label: "Guardian name", required: true },
      { name: "guardianPhone", label: "Guardian phone", required: true },
      { name: "className", label: "Class", required: true },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [{ key: "admissionNumber", label: "Admission #" }, { key: "name", label: "Name" }, { key: "className", label: "Class" }, { key: "guardianName", label: "Guardian" }, { key: "status", label: "Status" }]
  },
  teachers: {
    moduleId: "teachers",
    resource: "teachers",
    title: "Teachers",
    description: "Manage teacher profiles, login access, and class/section/subject assignment foundations below.",
    submitLabel: "Save teacher",
    emptyText: "No teacher profiles exist yet.",
    fields: [
      { name: "employeeNumber", label: "Employee number", required: true },
      { name: "name", label: "Teacher name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone" },
      { name: "specialization", label: "Specialization" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "loginEnabled", label: "Login enabled", type: "checkbox" },
      { name: "password", label: "Temporary/reset password", type: "password", placeholder: "Minimum 8 characters" }
    ],
    columns: [
      { key: "employeeNumber", label: "Employee #" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "loginEnabled", label: "Login", render: (row) => row.loginEnabled ? "Enabled" : row.membershipStatus === "SUSPENDED" ? "Disabled" : "Profile only" },
      { key: "specialization", label: "Specialization" },
      { key: "status", label: "Status" }
    ]
  },
  parents: {
    moduleId: "parents",
    resource: "parents",
    title: "Parents/Guardians",
    description: "Create parent accounts and link them to existing student profiles through verified guardian links.",
    submitLabel: "Save parent",
    emptyText: "No parent or guardian accounts exist yet.",
    fields: [
      { name: "name", label: "Parent/guardian name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone" },
      { name: "studentId", label: "Link child", type: "select" },
      { name: "relationType", label: "Relation", type: "select", options: relationOptions },
      { name: "isEmergencyContact", label: "Emergency contact", type: "checkbox" },
      { name: "loginEnabled", label: "Login enabled", type: "checkbox" },
      { name: "password", label: "Temporary/reset password", type: "password", placeholder: "Minimum 8 characters" }
    ],
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "loginEnabled", label: "Login", render: (row) => row.loginEnabled ? "Enabled" : "Disabled" },
      { key: "links", label: "Linked children", render: (row) => Array.isArray(row.links) && row.links.length ? row.links.map((link: any) => `${link.student?.name ?? "Student"} (${humanize(link.relationType)})`).join(", ") : "None" }
    ]
  }
};

export function SchoolAdminPortal() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const readiness = useReadiness(refreshKey);
  const active = modules.find((item) => item.id === activeModule) ?? modules[0];
  const refreshAll = () => setRefreshKey((value) => value + 1);

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
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={refreshAll} type="button">
            <RefreshCw aria-hidden={true} size={16} />
            Refresh
          </button>
        </header>

        {activeModule === "dashboard" ? (
          <Dashboard refreshKey={refreshKey} readiness={readiness} onOpenModule={setActiveModule} />
        ) : activeModule === "admissions" ? (
          <AdmissionsWorkspace refreshKey={refreshKey} onChanged={refreshAll} />
        ) : activeModule === "attendance" ? (
          <AttendanceWorkspace refreshKey={refreshKey} />
        ) : activeModule === "timetable" ? (
          <TimetableWorkspace refreshKey={refreshKey} onChanged={refreshAll} />
        ) : openedModules.has(activeModule) ? (
          <CorePeopleWorkspace moduleId={activeModule} refreshKey={refreshKey} onChanged={refreshAll} />
        ) : (
          <ModulePreview module={active} readiness={readiness.data} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ refreshKey, readiness, onOpenModule }: { refreshKey: number; readiness: ReturnType<typeof useReadiness>; onOpenModule: (moduleId: ModuleId) => void }) {
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
        <SetupCoach dashboard={dashboard} readiness={readiness.data} onOpenModule={onOpenModule} />
        <ActionQueue dashboard={dashboard} readiness={readiness.data} loading={readiness.loading} error={readiness.error} onRetry={readiness.retry} />
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
            <ModuleStatusCard key={item.id} module={item} dashboard={dashboard} readiness={readiness.data} onOpenModule={onOpenModule} />
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

function TimetableWorkspace({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const emptyForm = { className: "", subject: "", teacher: "", dayOfWeek: "MONDAY", startsAt: "08:00", endsAt: "08:40", status: "ACTIVE" };
  const { rows, loading, error, refresh, setRows } = useResourceList("timetable", refreshKey);
  const classes = useResourceList("classes", refreshKey);
  const subjects = useResourceList("subjects", refreshKey);
  const teachers = useResourceList("teachers", refreshKey);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<ResourceRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const update = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const startEdit = (row: ResourceRow) => {
    setEditing(row);
    setForm({
      className: String(row.className ?? ""),
      subject: String(row.subject ?? ""),
      teacher: String(row.teacher ?? ""),
      dayOfWeek: String(row.dayOfWeek ?? "MONDAY"),
      startsAt: String(row.startsAt ?? "08:00"),
      endsAt: String(row.endsAt ?? "08:40"),
      status: String(row.status ?? "ACTIVE")
    });
    setMessage(null);
  };
  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.className || !form.subject || !form.teacher || !form.dayOfWeek || !form.startsAt || !form.endsAt) {
      setMessage({ tone: "error", text: "Class, subject, teacher, day, start time, and end time are required." });
      return;
    }
    if (form.startsAt >= form.endsAt) {
      setMessage({ tone: "error", text: "End time must be after start time." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload: ApiOne<ResourceRow> = await api(editing ? `timetable/${editing.id}` : "timetable", { method: editing ? "PATCH" : "POST", body: JSON.stringify(form) });
      const warnings = Array.isArray(payload.data?.warnings) ? payload.data.warnings : [];
      setMessage({ tone: warnings.length ? "error" : "success", text: warnings.length ? `Saved with warning: ${warnings[0]}` : editing ? "Timetable slot updated." : "Timetable slot created." });
      setRows((current) => editing ? current.map((row) => row.id === payload.data.id ? payload.data : row) : [payload.data, ...current]);
      reset();
      refresh();
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Timetable slot could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: ResourceRow) {
    setSaving(true);
    setMessage(null);
    try {
      await api(`timetable/${row.id}`, { method: "DELETE" });
      setRows((current) => current.filter((item) => item.id !== row.id));
      setMessage({ tone: "success", text: "Timetable slot removed." });
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Timetable slot could not be removed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status="Ready" />
            <h2 className="mt-3 text-2xl font-semibold">Timetable</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Create class timetable slots using real classes, subjects, and teachers. Section-specific slots, rooms, and notes need a later schema expansion.</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={refresh} type="button"><RefreshCw aria-hidden={true} size={15} />Refresh</button>
        </div>
      </section>

      <form className="rounded-lg border border-border bg-surface p-4 shadow-panel" onSubmit={submit}>
        <h3 className="text-base font-semibold">{editing ? "Edit timetable slot" : "Create timetable slot"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">End time must be after start time. Conflict warnings are shown after save.</p>
        {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FieldControl field={{ name: "className", label: "Class", type: "select", required: true, options: [{ value: "", label: classes.loading ? "Loading classes" : "Select class" }, ...classes.rows.map((row) => ({ value: String(row.name ?? row.id), label: optionLabelForClass(row) }))] }} value={form.className} onChange={(value) => update("className", value)} />
          <FieldControl field={{ name: "subject", label: "Subject", type: "select", required: true, options: [{ value: "", label: subjects.loading ? "Loading subjects" : "Select subject" }, ...subjects.rows.map((row) => ({ value: String(row.name ?? row.id), label: `${row.name ?? row.code}${row.status ? ` - ${humanize(row.status)}` : ""}` }))] }} value={form.subject} onChange={(value) => update("subject", value)} />
          <FieldControl field={{ name: "teacher", label: "Teacher", type: "select", required: true, options: [{ value: "", label: teachers.loading ? "Loading teachers" : "Select teacher" }, ...teachers.rows.map((row) => ({ value: String(row.name ?? row.id), label: `${row.name ?? row.email}${row.status ? ` - ${humanize(row.status)}` : ""}` }))] }} value={form.teacher} onChange={(value) => update("teacher", value)} />
          <FieldControl field={{ name: "dayOfWeek", label: "Day", type: "select", required: true, options: dayOptions }} value={form.dayOfWeek} onChange={(value) => update("dayOfWeek", value)} />
          <FieldControl field={{ name: "startsAt", label: "Start time", type: "text", required: true, placeholder: "08:00" }} value={form.startsAt} onChange={(value) => update("startsAt", value)} />
          <FieldControl field={{ name: "endsAt", label: "End time", type: "text", required: true, placeholder: "08:40" }} value={form.endsAt} onChange={(value) => update("endsAt", value)} />
          <FieldControl field={{ name: "status", label: "Status", type: "select", options: statusOptions }} value={form.status} onChange={(value) => update("status", value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={saving || classes.rows.length === 0 || subjects.rows.length === 0 || teachers.rows.length === 0} type="submit">{saving ? "Saving..." : editing ? "Update slot" : "Create slot"}</button>
          {editing ? <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium" onClick={reset} type="button">Cancel edit</button> : null}
        </div>
        {classes.rows.length === 0 ? <p className="mt-3 text-sm text-error">Create classes before timetable slots.</p> : null}
        {subjects.rows.length === 0 ? <p className="mt-3 text-sm text-error">Create subjects before timetable slots.</p> : null}
        {teachers.rows.length === 0 ? <p className="mt-3 text-sm text-error">Create teachers before timetable slots.</p> : null}
      </form>

      <section className="rounded-lg border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div><h3 className="text-base font-semibold">Timetable slots</h3><p className="mt-1 text-xs text-muted-foreground">Real school-scoped slots only.</p></div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium">{formatNumber(rows.length)}</span>
        </div>
        {loading ? <StatePanel text="Loading timetable" compact /> : error ? <StatePanel text={error} tone="error" compact onRetry={refresh} /> : rows.length === 0 ? <StatePanel text="No timetable slots have been created yet." compact /> : (
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-border text-sm"><thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 font-semibold">Class</th><th className="px-4 py-3 font-semibold">Subject</th><th className="px-4 py-3 font-semibold">Teacher</th><th className="px-4 py-3 font-semibold">Day</th><th className="px-4 py-3 font-semibold">Time</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-border">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.className}</td><td className="px-4 py-3">{row.subject}</td><td className="px-4 py-3">{row.teacher}</td><td className="px-4 py-3">{humanize(row.dayOfWeek ?? "")}</td><td className="px-4 py-3">{row.startsAt} - {row.endsAt}</td><td className="px-4 py-3">{humanize(row.status ?? "")}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium" onClick={() => startEdit(row)} type="button">Edit</button><button className="rounded-md border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-medium text-error" onClick={() => remove(row)} type="button">Remove</button></div></td></tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  );
}
function AttendanceWorkspace({ refreshKey }: { refreshKey: number }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams({ pageSize: "100", date });
    if (status) query.set("status", status);
    Promise.all([
      api(`attendance?${query.toString()}`),
      api(`attendance/summary?${query.toString()}`)
    ])
      .then(([listPayload, summaryPayload]) => {
        setRows(Array.isArray(listPayload.data) ? listPayload.data : []);
        setSummary(summaryPayload.data ?? null);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Attendance monitoring could not load."))
      .finally(() => setLoading(false));
  }, [date, status, refreshKey, retryKey]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status="Ready" />
            <h2 className="mt-3 text-2xl font-semibold">Attendance Monitoring</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Review teacher-marked attendance by date, class, and status from real school records.</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={() => setRetryKey((value) => value + 1)} type="button">
            <RefreshCw aria-hidden={true} size={15} />
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium">Date<input className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-medium">Status<select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {["PRESENT", "ABSENT", "LATE", "HALF_DAY", "EXCUSED"].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
          </select></label>
        </div>
      </section>

      {summary ? (
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Total" value={summary.total} detail="Attendance records for selected filters" Icon={CalendarCheck} />
          {summary.byStatus.map((item) => <MetricCard key={item.status} label={humanize(item.status)} value={item.count} detail="Status count" Icon={CalendarCheck} />)}
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h3 className="text-base font-semibold">Attendance records</h3>
            <p className="mt-1 text-xs text-muted-foreground">Marked by assigned teachers. No static rows.</p>
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium">{formatNumber(rows.length)}</span>
        </div>
        {loading ? <StatePanel text="Loading attendance" compact /> : error ? <StatePanel text={error} tone="error" compact onRetry={() => setRetryKey((value) => value + 1)} /> : rows.length === 0 ? <StatePanel text="No attendance has been marked for the selected filters." compact /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-3 font-semibold">Student</th><th className="px-4 py-3 font-semibold">Class</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Remarks</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.studentName}</td><td className="px-4 py-3">{row.className}</td><td className="px-4 py-3">{shortDate(row.attendanceDate)}</td><td className="px-4 py-3">{humanize(row.status ?? "")}</td><td className="px-4 py-3">{row.remarks ?? ""}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
function SetupCoach({ dashboard, readiness, onOpenModule }: { dashboard: ReturnType<typeof normalizeSchoolAdminDashboard>; readiness: ReadinessData | null; onOpenModule: (moduleId: ModuleId) => void }) {
  const flags = readiness?.flags;
  const steps = [
    { label: "Create active academic year", done: flags?.hasActiveAcademicYear ?? dashboard.metrics.classes + dashboard.metrics.sections + dashboard.metrics.subjects > 0, count: readiness?.counts?.activeAcademicYears ?? 0, moduleId: "academic" as ModuleId, action: "Open academic setup" },
    { label: "Create classes 1-12", done: flags?.hasClass ?? dashboard.metrics.classes > 0, count: readiness?.counts?.classes ?? dashboard.metrics.classes, moduleId: "classes" as ModuleId, action: "Open classes" },
    { label: "Create sections", done: flags?.hasSection ?? dashboard.metrics.sections > 0, count: readiness?.counts?.sections ?? dashboard.metrics.sections, moduleId: "sections" as ModuleId, action: "Open sections" },
    { label: "Create subjects", done: flags?.hasSubject ?? dashboard.metrics.subjects > 0, count: readiness?.counts?.subjects ?? dashboard.metrics.subjects, moduleId: "subjects" as ModuleId, action: "Open subjects" },
    { label: "Create admissions", done: flags?.hasAdmission ?? dashboard.metrics.admissions > 0, count: readiness?.counts?.admissions ?? dashboard.metrics.admissions, moduleId: "admissions" as ModuleId, action: "Open admissions" },
    { label: "Enroll students", done: flags?.hasStudent ?? dashboard.metrics.students > 0, count: readiness?.counts?.students ?? dashboard.metrics.students, moduleId: "students" as ModuleId, action: "Open students" },
    { label: "Create teachers", done: flags?.hasTeacher ?? dashboard.metrics.teachers > 0, count: readiness?.counts?.teachers ?? dashboard.metrics.teachers, moduleId: "teachers" as ModuleId, action: "Open teachers" },
    { label: "Assign teachers", done: flags?.hasTeacherAssignment ?? false, count: readiness?.counts?.teacherAssignments ?? 0, moduleId: "teachers" as ModuleId, action: "Open assignments" },
    { label: "Mark attendance", done: flags?.hasAttendance ?? dashboard.metrics.attendance > 0, count: readiness?.counts?.attendanceRecords ?? dashboard.metrics.attendance, moduleId: "attendance" as ModuleId, action: "Open attendance" },
    { label: "Create timetable slots", done: flags?.hasTimetable ?? dashboard.metrics.timetable > 0, count: readiness?.counts?.timetableSlots ?? dashboard.metrics.timetable, moduleId: "timetable" as ModuleId, action: "Open timetable" }
  ] as const;
  const complete = steps.filter((step) => step.done).length;

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
        {steps.map((step) => (
          <div key={step.label} className="grid gap-3 rounded-md border border-border bg-background p-3 text-sm">
            <div className="flex items-center gap-2">
              {step.done ? <CheckCircle2 aria-hidden={true} className="text-success" size={17} /> : <AlertCircle aria-hidden={true} className="text-warning" size={17} />}
              <span className={step.done ? "font-medium" : "text-muted-foreground"}>{step.label}</span>
              <span className="ml-auto rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium">{formatNumber(step.count)}</span>
            </div>
            <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium" type="button" onClick={() => onOpenModule(step.moduleId)}>
              {step.done ? "Review" : step.action}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionQueue({ dashboard, readiness, loading, error, onRetry }: { dashboard: ReturnType<typeof normalizeSchoolAdminDashboard>; readiness: ReadinessData | null; loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) return <section className="rounded-lg border border-border bg-surface p-4 shadow-panel"><StatePanel text="Loading setup readiness" compact /></section>;
  if (error) return <section className="rounded-lg border border-border bg-surface p-4 shadow-panel"><StatePanel text={error} tone="error" compact onRetry={onRetry} /></section>;
  const readinessActions = readiness?.nextActions?.slice(0, 6).map((item) => `${item.module}: ${item.action}${item.missingDependencies.length ? ` Missing: ${item.missingDependencies.join(", ")}.` : ""}`) ?? [];
  const actions = readinessActions.length ? readinessActions : [
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

function ModulePreview({ module, readiness }: { module: ModuleConfig; readiness: ReadinessData | null }) {
  const Icon = module.icon;
  const moduleReadiness = readiness?.modules[module.id];
  const dependencyText = moduleReadiness?.missingDependencies.length ? `Missing: ${moduleReadiness.missingDependencies.join(", ")}` : lockedDependencyText[module.id] ?? module.requirements;
  const status = moduleReadiness ? readinessStatusToModuleStatus(moduleReadiness.status) : module.status;
  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-panel">
      <div className="flex max-w-4xl items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={20} /></span>
        <div className="min-w-0">
          <StatusBadge status={status} />
          <h2 className="mt-3 text-xl font-semibold">{module.label}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.purpose}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Setup requirements</p>
              <p className="mt-1 text-sm leading-5">{dependencyText}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Next safe action</p>
              <p className="mt-1 text-sm leading-5">{moduleReadiness?.nextAction ?? module.nextAction}</p>
            </div>
          </div>
          <button className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-muted-foreground" type="button" disabled>
            Dependency required
          </button>
        </div>
      </div>
    </section>
  );
}

function CorePeopleWorkspace({ moduleId, refreshKey, onChanged }: { moduleId: ModuleId; refreshKey: number; onChanged: () => void }) {
  const config = resourceConfigs[moduleId as keyof typeof resourceConfigs];
  const [editing, setEditing] = useState<ResourceRow | null>(null);
  const { rows, loading, error, refresh, setRows } = useResourceList(config.resource, refreshKey);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status="Ready" />
            <h2 className="mt-3 text-2xl font-semibold">{config.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.description}</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={refresh} type="button">
            <RefreshCw aria-hidden={true} size={15} />
            Refresh
          </button>
        </div>
      </section>

      {moduleId === "classes" || moduleId === "subjects" ? <CoreSetupActions moduleId={moduleId} onCompleted={() => { refresh(); onChanged(); }} /> : null}

      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <ResourceForm config={config} editing={editing} onCancel={() => setEditing(null)} onSaved={(row) => {
          setRows((current) => editing ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
          setEditing(null);
          onChanged();
          refresh();
        }} />
        <ResourceTable config={config} rows={rows} loading={loading} error={error} onRetry={refresh} onEdit={setEditing} />
      </section>

      {moduleId === "academic" ? <AcademicYearActions rows={rows} onChanged={() => { refresh(); onChanged(); }} /> : null}
      {moduleId === "teachers" ? <TeacherAssignments refreshKey={refreshKey} onChanged={onChanged} /> : null}
      {moduleId === "parents" ? <ParentLinking rows={rows} onChanged={() => { refresh(); onChanged(); }} /> : null}
    </div>
  );
}

function AcademicYearActions({ rows, onChanged }: { rows: ResourceRow[]; onChanged: () => void }) {
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const active = rows.find((row) => String(row.status ?? "").toUpperCase() === "ACTIVE");

  async function activate(row: ResourceRow) {
    setSavingId(row.id);
    setMessage(null);
    try {
      await api(`academic-years/${row.id}/activate`, { method: "PATCH", body: JSON.stringify({}) });
      setMessage({ tone: "success", text: `${row.name ?? "Academic year"} is now active.` });
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Academic year could not be activated." });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold">Active academic year</h3>
        <p className="mt-1 text-sm text-muted-foreground">{active ? `${active.name} is currently active.` : "No active academic year is selected yet."}</p>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {rows.map((row) => (
          <button key={row.id} className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium disabled:opacity-60" disabled={savingId === row.id || String(row.status ?? "").toUpperCase() === "ACTIVE"} onClick={() => activate(row)} type="button">
            {String(row.status ?? "").toUpperCase() === "ACTIVE" ? "Active" : savingId === row.id ? "Activating..." : `Activate ${row.name ?? "year"}`}
          </button>
        ))}
      </div>
    </section>
  );
}

function AdmissionsWorkspace({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const { rows, loading, error, refresh, setRows } = useResourceList("admissions", refreshKey);
  const { rows: classes } = useResourceList("classes", refreshKey);
  const [editing, setEditing] = useState<AdmissionRow | null>(null);

  function saved(row: ResourceRow) {
    setRows((current) => editing ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
    setEditing(null);
    onChanged();
    refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status="Ready" />
            <h2 className="mt-3 text-2xl font-semibold">Admissions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Create applicant records, review admission status, and convert approved applicants into real student profiles.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium" onClick={refresh} type="button">
            <RefreshCw aria-hidden={true} size={15} />
            Refresh
          </button>
        </div>
      </section>

      {classes.length === 0 ? <StatePanel text="Create classes before adding admission applicants." compact /> : null}
      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <AdmissionForm editing={editing} classes={classes} onCancel={() => setEditing(null)} onSaved={saved} />
        <AdmissionTable rows={rows as AdmissionRow[]} loading={loading} error={error} onRetry={refresh} onEdit={setEditing} onChanged={() => { refresh(); onChanged(); }} />
      </section>
    </div>
  );
}

function AdmissionForm({ editing, classes, onCancel, onSaved }: { editing: AdmissionRow | null; classes: ResourceRow[]; onCancel: () => void; onSaved: (row: ResourceRow) => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setForm({
      applicationNo: editing?.applicationNo ?? "",
      applicantName: editing?.applicantName ?? "",
      guardianName: editing?.guardianName ?? "",
      guardianPhone: editing?.guardianPhone ?? "",
      desiredClass: admissionClassValue(editing?.desiredClass ?? "", classes),
      source: editing?.source ?? "SCHOOL_ADMIN",
      status: editing?.status ?? "NEW",
      notes: editing?.notes ?? ""
    });
    setMessage(null);
  }, [editing, classes]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        ...(form.applicationNo ? { applicationNo: form.applicationNo } : {}),
        applicantName: form.applicantName,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        desiredClass: form.desiredClass,
        source: form.source || "SCHOOL_ADMIN",
        status: form.status || "NEW",
        ...(form.notes ? { notes: form.notes } : {})
      };
      const payload: ApiOne<AdmissionRow> = await api(editing ? `admissions/${editing.id}` : "admissions", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(body)
      });
      setMessage({ tone: "success", text: editing ? "Admission updated." : "Admission applicant created." });
      onSaved(payload.data);
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Admission could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rounded-lg border border-border bg-surface p-4 shadow-panel" onSubmit={submit}>
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold">{editing ? "Edit admission" : "Create admission applicant"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Applicant records are school-scoped and can be converted only after approval.</p>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      <div className="mt-4 grid gap-3">
        <FieldControl field={{ name: "applicationNo", label: "Application number", placeholder: "Auto-generated if blank" }} value={form.applicationNo} onChange={(value) => setForm((current) => ({ ...current, applicationNo: value }))} />
        <FieldControl field={{ name: "applicantName", label: "Applicant name", required: true }} value={form.applicantName} onChange={(value) => setForm((current) => ({ ...current, applicantName: value }))} />
        <FieldControl field={{ name: "guardianName", label: "Guardian name", required: true }} value={form.guardianName} onChange={(value) => setForm((current) => ({ ...current, guardianName: value }))} />
        <FieldControl field={{ name: "guardianPhone", label: "Guardian phone", required: true }} value={form.guardianPhone} onChange={(value) => setForm((current) => ({ ...current, guardianPhone: value }))} />
        <FieldControl field={{ name: "desiredClass", label: "Requested class", type: "select", required: true, options: [{ value: "", label: "Select class" }, ...classes.map((row, index) => ({ value: row.id, label: optionLabelForClass(row, index) }))] }} value={form.desiredClass} onChange={(value) => setForm((current) => ({ ...current, desiredClass: value }))} />
        <FieldControl field={{ name: "status", label: "Status", type: "select", options: admissionStatusOptions }} value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <FieldControl field={{ name: "source", label: "Source" }} value={form.source} onChange={(value) => setForm((current) => ({ ...current, source: value }))} />
        <label className="grid gap-1 text-sm font-medium">
          Notes
          <textarea className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.notes ?? ""} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" type="submit" disabled={saving || classes.length === 0}>{saving ? "Saving..." : editing ? "Update admission" : "Create admission"}</button>
        {editing ? <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium" type="button" onClick={onCancel}>Cancel edit</button> : null}
      </div>
    </form>
  );
}

function AdmissionTable({ rows, loading, error, onRetry, onEdit, onChanged }: { rows: AdmissionRow[]; loading: boolean; error: string | null; onRetry: () => void; onEdit: (row: AdmissionRow) => void; onChanged: () => void }) {
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [admissionNumbers, setAdmissionNumbers] = useState<Record<string, string>>({});

  async function setStatus(row: AdmissionRow, status: string) {
    setSavingId(row.id);
    setMessage(null);
    try {
      await api(`admissions/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage({ tone: "success", text: `Admission marked ${humanize(status)}.` });
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Admission status could not be updated." });
    } finally {
      setSavingId(null);
    }
  }

  async function convert(row: AdmissionRow) {
    setSavingId(row.id);
    setMessage(null);
    try {
      await api(`admissions/${row.id}/convert-to-student`, {
        method: "POST",
        body: JSON.stringify({ ...(admissionNumbers[row.id] ? { admissionNumber: admissionNumbers[row.id] } : {}) })
      });
      setMessage({ tone: "success", text: "Admission converted to student profile." });
      setAdmissionNumbers((current) => ({ ...current, [row.id]: "" }));
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Admission could not be converted." });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface shadow-panel">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-base font-semibold">Admission records</h3>
          <p className="mt-1 text-xs text-muted-foreground">Approved admissions can be converted into real students.</p>
        </div>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium">{formatNumber(rows.length)}</span>
      </div>
      {message ? <div className={`mx-4 mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {loading ? <StatePanel text="Loading admissions" compact /> : error ? <StatePanel text={error} tone="error" compact onRetry={onRetry} /> : rows.length === 0 ? <StatePanel text="No admission applicants have been created yet." compact /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Application</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Guardian</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 align-top">{row.applicationNo ?? row.id}<br /><span className="text-xs text-muted-foreground">{row.appliedOn ? shortDate(row.appliedOn) : ""}</span></td>
                  <td className="px-4 py-3 align-top">{row.applicantName}</td>
                  <td className="px-4 py-3 align-top">{row.guardianName}<br /><span className="text-xs text-muted-foreground">{row.guardianPhone}</span></td>
                  <td className="px-4 py-3 align-top">{row.desiredClass}</td>
                  <td className="px-4 py-3 align-top"><LeaveStatusBadge status={row.status ?? "NEW"} /></td>
                  <td className="min-w-[280px] px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium" type="button" onClick={() => onEdit(row)}>Edit</button>
                      {row.status !== "ENROLLED" ? <button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium" disabled={savingId === row.id} type="button" onClick={() => setStatus(row, "UNDER_REVIEW")}>Review</button> : null}
                      {row.status !== "ENROLLED" ? <button className="rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-sm font-medium text-success" disabled={savingId === row.id} type="button" onClick={() => setStatus(row, "APPROVED")}>Approve</button> : null}
                      {row.status !== "ENROLLED" ? <button className="rounded-md border border-error/30 bg-error/10 px-3 py-1.5 text-sm font-medium text-error" disabled={savingId === row.id} type="button" onClick={() => setStatus(row, "REJECTED")}>Reject</button> : null}
                    </div>
                    {row.status === "APPROVED" ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input className="min-h-9 rounded-md border border-border bg-background px-3 text-sm" placeholder={`Admission #, blank uses ${row.applicationNo ?? "application number"}`} value={admissionNumbers[row.id] ?? ""} onChange={(event) => setAdmissionNumbers((current) => ({ ...current, [row.id]: event.target.value }))} />
                        <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={savingId === row.id} type="button" onClick={() => convert(row)}>Convert</button>
                      </div>
                    ) : row.status === "ENROLLED" ? <p className="mt-2 text-xs text-muted-foreground">Converted to student.</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CoreSetupActions({ moduleId, onCompleted }: { moduleId: ModuleId; onCompleted: () => void }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const isClasses = moduleId === "classes";
  async function runSetup() {
    setSaving(true);
    setMessage(null);
    try {
      const payload: ApiOne<BulkSetupResult> = await api(isClasses ? "classes/standard-1-12" : "subjects/common", { method: "POST", body: JSON.stringify({}) });
      setMessage({
        tone: "success",
        text: isClasses
          ? `Standard classes ready. Created ${formatNumber(payload.data.created)}; already existed ${formatNumber(payload.data.existing)}.`
          : `Common subjects ready. Created ${formatNumber(payload.data.created)}; already existed ${formatNumber(payload.data.existing)}.`
      });
      onCompleted();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Setup action failed." });
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold">{isClasses ? "Standard classes 1-12" : "Common subject setup"}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {isClasses ? "Create missing Grade 1 through Grade 12 class records. Existing classes are skipped." : "Create missing common subject records. Existing subjects are skipped."}
          </p>
        </div>
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" type="button" disabled={saving} onClick={runSetup}>
          {saving ? "Working..." : isClasses ? "Create missing 1-12" : "Create common subjects"}
        </button>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
    </section>
  );
}

function ResourceForm({ config, editing, onCancel, onSaved }: { config: ResourceConfig; editing: ResourceRow | null; onCancel: () => void; onSaved: (row: ResourceRow) => void }) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { rows: classes } = useResourceList("classes", 0, config.resource === "sections" || config.resource === "students");
  const { rows: students } = useResourceList("students", 0, config.resource === "parents");

  useEffect(() => {
    const next: Record<string, any> = {};
    config.fields.forEach((field) => {
      if (editing) next[field.name] = normalizeFieldValue(editing[field.name], field.type);
      else if (field.type === "checkbox") next[field.name] = false;
      else if (field.type === "select") next[field.name] = field.options?.[0]?.value ?? "";
      else if (field.name === "capacity") next[field.name] = 40;
      else next[field.name] = "";
    });
    setForm(next);
    setMessage(null);
  }, [config.resource, editing]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = config.fields.reduce<Record<string, any>>((acc, field) => {
        const value = form[field.name];
        if (value === "" && !field.required) return acc;
        acc[field.name] = field.type === "number" ? Number(value) : value;
        return acc;
      }, {});
      const payload: ApiOne<ResourceRow> = await api(editing ? `${config.resource}/${editing.id}` : config.resource, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(body)
      });
      setMessage({ tone: "success", text: editing ? "Record updated." : "Record created." });
      onSaved(payload.data);
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Record could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rounded-lg border border-border bg-surface p-4 shadow-panel" onSubmit={submit}>
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold">{editing ? `Edit ${config.title}` : config.submitLabel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">School scoped. Required fields are validated before saving.</p>
        {config.resource === "teachers" || config.resource === "parents" ? (
          <p className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs leading-5 text-warning">
            When login is enabled for a new account, enter a temporary password. Share it securely and ask the user to change it later.
          </p>
        ) : null}
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      <div className="mt-4 grid gap-3">
        {config.fields.map((field) => {
          const dynamicOptions = field.name === "classId" ? classes.map((row) => ({ value: row.id, label: optionLabelForClass(row) })) : field.name === "className" ? classes.map((row) => ({ value: row.name, label: optionLabelForClass(row) })) : field.name === "studentId" ? [{ value: "", label: "No child yet" }, ...students.map((row) => ({ value: row.id, label: optionLabelForStudent(row) }))] : field.options;
          return <FieldControl key={field.name} field={{ ...field, type: dynamicOptions?.length ? "select" : field.type, options: dynamicOptions }} value={form[field.name]} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} />;
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : config.submitLabel}</button>
        {editing ? <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium" type="button" onClick={onCancel}>Cancel edit</button> : null}
      </div>
    </form>
  );
}

function FieldControl({ field, value, onChange }: { field: FieldConfig; value: any; onChange: (value: any) => void }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium">
        <input checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        {field.label}
      </label>
    );
  }
  return (
    <label className="grid gap-1 text-sm font-medium">
      {field.label}
      {field.type === "select" ? (
        <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" required={field.required} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" required={field.required} type={field.type ?? "text"} value={value ?? ""} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ResourceTable({ config, rows, loading, error, onRetry, onEdit }: { config: ResourceConfig; rows: ResourceRow[]; loading: boolean; error: string | null; onRetry: () => void; onEdit: (row: ResourceRow) => void }) {
  return (
    <section className="rounded-lg border border-border bg-surface shadow-panel">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-base font-semibold">{config.title} records</h3>
          <p className="mt-1 text-xs text-muted-foreground">Real database records only. No static rows.</p>
        </div>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium">{formatNumber(rows.length)}</span>
      </div>
      {loading ? <StatePanel text={`Loading ${config.title.toLowerCase()}`} compact /> : error ? <StatePanel text={error} tone="error" compact onRetry={onRetry} /> : rows.length === 0 ? <StatePanel text={config.emptyText} compact /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>{config.columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}<th className="px-4 py-3 font-semibold">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((column) => <td key={column.key} className="max-w-[260px] px-4 py-3 align-top">{column.render ? column.render(row) : String(row[column.key] ?? "")}</td>)}
                  <td className="px-4 py-3 align-top"><button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium" type="button" onClick={() => onEdit(row)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TeacherAssignments({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const [editing, setEditing] = useState<ResourceRow | null>(null);
  const config: ResourceConfig = {
    moduleId: "teachers",
    resource: "teacher-assignments",
    title: "Teacher Assignments",
    description: "Assign teachers to class, optional section, and subject foundations.",
    submitLabel: "Save assignment",
    emptyText: "No teacher assignments exist yet.",
    fields: [
      { name: "teacherId", label: "Teacher", type: "select", required: true },
      { name: "classId", label: "Class", type: "select", required: true },
      { name: "sectionId", label: "Section", type: "select" },
      { name: "subjectId", label: "Subject", type: "select", required: true },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ],
    columns: [
      { key: "teacher", label: "Teacher", render: (row) => row.teacher?.name ?? row.teacherId },
      { key: "class", label: "Class", render: (row) => row.class?.name ?? row.classId },
      { key: "section", label: "Section", render: (row) => row.section?.name ?? "All sections" },
      { key: "subject", label: "Subject", render: (row) => row.subject?.name ?? row.subjectId },
      { key: "status", label: "Status" }
    ]
  };
  const { rows, loading, error, refresh, setRows } = useResourceList("teacher-assignments", refreshKey);
  const { rows: teachers } = useResourceList("teachers", refreshKey);
  const { rows: classes } = useResourceList("classes", refreshKey);
  const { rows: sections } = useResourceList("sections", refreshKey);
  const { rows: subjects } = useResourceList("subjects", refreshKey);
  const classRows = teacherAssignmentClassRows(classes, sections);

  return (
    <div className="space-y-4">
      {classRows.length === 0 ? <StatePanel text="Create classes before assigning teachers." compact /> : null}
      {subjects.length === 0 ? <StatePanel text="Create subjects before assigning teachers. The subject dropdown uses real subject records only." compact /> : null}
      {sections.length === 0 ? <StatePanel text="Create sections before assigning section-specific teachers. You can still use All sections." compact /> : null}
      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <TeacherAssignmentForm
          editing={editing}
          teachers={teachers}
          classes={classes}
          sections={sections}
          subjects={subjects}
          onCancel={() => setEditing(null)}
          onSaved={(row) => {
          setRows((current) => editing ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
          setEditing(null);
          onChanged();
          refresh();
        }} />
        <ResourceTable config={config} rows={rows} loading={loading} error={error} onRetry={refresh} onEdit={setEditing} />
      </section>
    </div>
  );
}

function TeacherAssignmentForm({ editing, teachers, classes, sections, subjects, onCancel, onSaved }: { editing: ResourceRow | null; teachers: ResourceRow[]; classes: ResourceRow[]; sections: ResourceRow[]; subjects: ResourceRow[]; onCancel: () => void; onSaved: (row: ResourceRow) => void }) {
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const classRows = teacherAssignmentClassRows(classes, sections);
  const classIds = new Set(classRows.map((row) => row.id));
  const filteredSections = classId ? sections.filter((section) => teacherAssignmentSectionClassId(section) === classId) : sections;

  useEffect(() => {
    setTeacherId(editing?.teacherId ?? editing?.teacher?.id ?? "");
    setClassId(editing?.classId ?? editing?.class?.id ?? "");
    setSectionId(editing?.sectionId ?? editing?.section?.id ?? "");
    setSubjectId(editing?.subjectId ?? editing?.subject?.id ?? "");
    setStatus(editing?.status ?? "ACTIVE");
    setMessage(null);
  }, [editing]);

  function changeSection(nextSectionId: string) {
    setSectionId(nextSectionId);
    if (!classId && nextSectionId) {
      const inferredClassId = teacherAssignmentSectionClassId(sections.find((section) => section.id === nextSectionId));
      if (inferredClassId && classIds.has(inferredClassId)) {
        setClassId(inferredClassId);
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const inferredClassId = classId || teacherAssignmentSectionClassId(sections.find((section) => section.id === sectionId));
    if (!teacherId) {
      setMessage({ tone: "error", text: "Select a teacher before saving the assignment." });
      return;
    }
    if (!inferredClassId) {
      setMessage({ tone: "error", text: "Select a class before saving the assignment." });
      return;
    }
    if (!subjectId) {
      setMessage({ tone: "error", text: "Select a subject before saving the assignment." });
      return;
    }
    setSaving(true);
    try {
      const payload: ApiOne<ResourceRow> = await api(editing ? `teacher-assignments/${editing.id}` : "teacher-assignments", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ teacherId, classId: inferredClassId, ...(sectionId ? { sectionId } : {}), subjectId, status })
      });
      setClassId(inferredClassId);
      setMessage({ tone: "success", text: classId ? "Teacher assignment saved." : "Teacher assignment saved. Class was inferred from the selected section." });
      onSaved(payload.data);
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Teacher assignment could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rounded-lg border border-border bg-surface p-4 shadow-panel" onSubmit={submit}>
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold">{editing ? "Edit Teacher Assignment" : "Save assignment"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Uses real teacher, class, section, and subject records only.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border border-border bg-background px-2 py-1">Classes loaded: {formatNumber(classRows.length)}</span>
        <span className="rounded-md border border-border bg-background px-2 py-1">Sections loaded: {formatNumber(sections.length)}</span>
        <span className="rounded-md border border-border bg-background px-2 py-1">Subjects loaded: {formatNumber(subjects.length)}</span>
        <span className="rounded-md border border-border bg-background px-2 py-1">Teachers loaded: {formatNumber(teachers.length)}</span>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {classRows.length === 0 ? <StatePanel text="Classes could not be loaded. Open Classes and create missing 1-12, then refresh." compact /> : null}
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-medium">
          Teacher
          <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" required value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
            <option value="">Select teacher</option>
            {teachers.map((row) => <option key={row.id} value={row.id}>{row.name ?? row.email ?? row.id}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Class
          <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" required value={classId} onChange={(event) => { setClassId(event.target.value); if (sectionId && teacherAssignmentSectionClassId(sections.find((section) => section.id === sectionId)) !== event.target.value) setSectionId(""); }}>
            <option value="">Select class</option>
            {classRows.map((row, index) => <option key={row.id} value={row.id}>{optionLabelForClass(row, index)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Section
          <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={sectionId} onChange={(event) => changeSection(event.target.value)}>
            <option value="">All sections</option>
            {filteredSections.map((row) => <option key={row.id} value={row.id}>{optionLabelForSection(row)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Subject
          <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" required value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
            <option value="">Select subject</option>
            {subjects.map((row) => <option key={row.id} value={row.id}>{optionLabelForSubject(row)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Status
          <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : "Save assignment"}</button>
        {editing ? <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium" type="button" onClick={onCancel}>Cancel edit</button> : null}
      </div>
    </form>
  );
}

function ParentLinking({ rows, onChanged }: { rows: ResourceRow[]; onChanged: () => void }) {
  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationType, setRelationType] = useState("GUARDIAN");
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { rows: students } = useResourceList("students", 0, true);

  async function link(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      await api(`parents/${parentId}/link-child`, { method: "POST", body: JSON.stringify({ studentId, relationType, isEmergencyContact, canLogin: true }) });
      setMessage({ tone: "success", text: "Child linked to parent." });
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Child could not be linked." });
    }
  }

  async function toggleLogin(row: ResourceRow) {
    setMessage(null);
    try {
      await api(`parents/${row.id}/login-status`, { method: "PATCH", body: JSON.stringify({ loginEnabled: !row.loginEnabled }) });
      setMessage({ tone: "success", text: "Parent login status updated." });
      onChanged();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Login status could not be updated." });
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold">Parent-child linking</h3>
        <p className="mt-1 text-sm text-muted-foreground">Links are validated by school scope before saving.</p>
      </div>
      {message ? <div className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
      {students.length === 0 ? <StatePanel text="Create student profiles before linking parents." compact /> : null}
      <form className="mt-4 grid gap-3 lg:grid-cols-5" onSubmit={link}>
        <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm lg:col-span-2" required value={parentId} onChange={(event) => setParentId(event.target.value)}>
          <option value="">Select parent</option>
          {rows.map((row) => <option key={row.id} value={row.id}>{row.name} - {row.email}</option>)}
        </select>
        <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm lg:col-span-2" required value={studentId} onChange={(event) => setStudentId(event.target.value)}>
          <option value="">Select student</option>
          {students.map((row) => <option key={row.id} value={row.id}>{optionLabelForStudent(row)}</option>)}
        </select>
        <select className="min-h-10 rounded-md border border-border bg-background px-3 text-sm" value={relationType} onChange={(event) => setRelationType(event.target.value)}>
          {relationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium lg:col-span-2"><input checked={isEmergencyContact} onChange={(event) => setIsEmergencyContact(event.target.checked)} type="checkbox" />Emergency contact</label>
        <button className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Link child</button>
      </form>
      {rows.length ? <div className="mt-4 flex flex-wrap gap-2">{rows.map((row) => <button key={row.id} className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium" type="button" onClick={() => toggleLogin(row)}>{row.loginEnabled ? "Disable" : "Enable"} login: {row.name}</button>)}</div> : null}
    </section>
  );
}

function ModuleStatusCard({ module, dashboard, readiness, onOpenModule }: { module: ModuleConfig; dashboard: ReturnType<typeof normalizeSchoolAdminDashboard>; readiness: ReadinessData | null; onOpenModule: (moduleId: ModuleId) => void }) {
  const Icon = module.icon;
  const moduleReadiness = readiness?.modules[module.id];
  const count = readinessCountFor(module.id, readiness) ?? (module.countKey ? dashboard.metrics[module.countKey] : undefined);
  const status = moduleReadiness ? readinessStatusToModuleStatus(moduleReadiness.status) : module.status;
  const canOpen = openedModules.has(module.id);
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={19} /></span>
        <StatusBadge status={status} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{module.label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.purpose}</p>
      {typeof count === "number" ? <p className="mt-3 text-sm font-medium">Real count: {formatNumber(count)}</p> : null}
      {moduleReadiness?.missingDependencies.length ? <p className="mt-2 text-xs leading-5 text-muted-foreground">Missing: {moduleReadiness.missingDependencies.join(", ")}</p> : null}
      <button className={`mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-md border px-3 text-sm font-medium ${canOpen ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground"}`} type="button" disabled={!canOpen} onClick={() => canOpen && onOpenModule(module.id)}>
        {canOpen ? "Open workspace" : moduleReadiness?.nextAction ?? module.nextAction}
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

function useResourceList(resource: string, refreshKey: number, enabled = true) {
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api(`${resource}?pageSize=100`)
      .then((payload: ApiList<ResourceRow>) => setRows(Array.isArray(payload.data) ? payload.data : []))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Records could not load."))
      .finally(() => setLoading(false));
  }, [resource, refreshKey, retryKey, enabled]);

  return { rows, loading, error, setRows, refresh: () => setRetryKey((value) => value + 1) };
}

function normalizeFieldValue(value: any, type?: FieldType) {
  if (type === "date" && value) return new Date(value).toISOString().slice(0, 10);
  if (type === "checkbox") return Boolean(value);
  return value ?? "";
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function optionLabelForClass(row: ResourceRow, index = 0) {
  const name = row.name ?? row.title ?? row.className ?? row.gradeName ?? row.code ?? `Class ${index + 1}`;
  const code = row.code ? ` (${row.code})` : "";
  const status = row.status ? ` - ${humanize(row.status)}` : "";
  return `${name}${code}${status}`;
}

function admissionClassValue(value: string, classes: ResourceRow[]) {
  if (!value) return "";
  const found = classes.find((row) => [row.id, row.name, row.code, row.className, row.gradeName].some((item) => String(item ?? "").toLowerCase() === value.toLowerCase()));
  return found?.id ?? value;
}

function teacherAssignmentClassRows(classes: ResourceRow[], sections: ResourceRow[]) {
  const byId = new Map<string, ResourceRow>();
  classes.forEach((row, index) => {
    const normalized = normalizeTeacherAssignmentClass(row, index);
    if (normalized?.id) byId.set(normalized.id, normalized);
  });
  sections.forEach((section, index) => {
    const normalized = normalizeTeacherAssignmentClassFromSection(section, index);
    if (normalized?.id && !byId.has(normalized.id)) {
      byId.set(normalized.id, normalized);
    }
  });
  return Array.from(byId.values()).sort((left, right) => optionLabelForClass(left).localeCompare(optionLabelForClass(right), undefined, { numeric: true }));
}

function normalizeTeacherAssignmentClass(row: any, index = 0): ResourceRow | null {
  if (!row?.id) return null;
  return {
    id: String(row.id),
    name: row.name ?? row.title ?? row.className ?? row.gradeName ?? `Class ${index + 1}`,
    title: row.title,
    className: row.className,
    gradeName: row.gradeName,
    code: row.code,
    status: row.status
  };
}

function normalizeTeacherAssignmentClassFromSection(section: any, index = 0): ResourceRow | null {
  const relatedClass = section?.class ?? section?.classLevel ?? section?.classInfo ?? section?.classRecord;
  const id = relatedClass?.id ?? section?.classId;
  if (!id) return null;
  return {
    id: String(id),
    name: relatedClass?.name ?? relatedClass?.title ?? relatedClass?.className ?? relatedClass?.gradeName ?? section?.className ?? `Class ${index + 1}`,
    title: relatedClass?.title,
    className: relatedClass?.className ?? section?.className,
    gradeName: relatedClass?.gradeName,
    code: relatedClass?.code ?? section?.classCode,
    status: relatedClass?.status ?? section?.classStatus
  };
}

function teacherAssignmentSectionClassId(section: any) {
  const relatedClass = section?.class ?? section?.classLevel ?? section?.classInfo ?? section?.classRecord;
  return relatedClass?.id ?? section?.classId ?? "";
}

function optionLabelForSection(row: ResourceRow) {
  const relatedClass = row.class ?? row.classLevel ?? row.classInfo ?? row.classRecord;
  const className = relatedClass?.name ?? row.className ?? relatedClass?.code ?? "Class";
  const sectionName = row.name ?? row.title ?? row.id;
  const status = row.status ? ` - ${humanize(row.status)}` : "";
  return `${className} / ${sectionName}${status}`;
}

function optionLabelForSubject(row: ResourceRow) {
  const name = row.name ?? row.title ?? row.code ?? row.id;
  const code = row.code ? ` (${row.code})` : "";
  const status = row.status ? ` - ${humanize(row.status)}` : "";
  return `${name}${code}${status}`;
}

function optionLabelForStudent(row: ResourceRow) {
  const name = row.name ?? "Student";
  const admission = row.admissionNumber ? `Admission ${row.admissionNumber}` : "No admission #";
  const className = row.className ? ` - ${row.className}` : "";
  const status = row.status ? ` - ${humanize(row.status)}` : "";
  return `${name} (${admission})${className}${status}`;
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

function useReadiness(refreshKey: number) {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api("readiness")
      .then((payload: ApiOne<ReadinessData>) => setData(payload.data))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Setup readiness could not load."))
      .finally(() => setLoading(false));
  }, [refreshKey, retryKey]);
  return { data, loading, error, retry: () => setRetryKey((value) => value + 1) };
}

function readinessStatusToModuleStatus(status: ReadinessStatus): ModuleStatus {
  if (status === "READY") return "Ready";
  if (status === "COMING_LATER") return "Coming Later";
  if (status === "DEPENDENCY_REQUIRED") return "Locked";
  return "Setup Required";
}

function readinessCountFor(moduleId: ModuleId, readiness: ReadinessData | null) {
  const keyByModule: Partial<Record<ModuleId, string>> = {
    academic: "academicYears",
    classes: "classes",
    sections: "sections",
    subjects: "subjects",
    admissions: "admissions",
    students: "students",
    teachers: "teachers",
    parents: "parentGuardians",
    attendance: "attendanceRecords",
    timetable: "timetableSlots",
    exams: "examRecords",
    fees: "feeRecords",
    library: "libraryBooks",
    lms: "lmsProgress"
  };
  const key = keyByModule[moduleId];
  return key ? readiness?.counts?.[key] : undefined;
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/school-admin/${path}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) }
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(friendlySchoolAdminError(path, payload.error?.message ?? "Request failed."));
  return payload;
}

function friendlySchoolAdminError(path: string, message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("authentication is required") || lower.includes("authentication_required")) {
    return "Please log in again to continue.";
  }
  if (lower.includes("school admin resource not found")) {
    if (path.startsWith("admissions")) return "Admissions API is unavailable. Retry after deployment.";
    if (path.startsWith("parents")) return "Parent management API is unavailable. Retry after deployment.";
    return "The selected school resource could not be loaded.";
  }
  if (lower.includes("route not found")) {
    if (path.startsWith("admissions")) return "Admissions API is unavailable. Retry after deployment.";
    if (path.includes("link-child")) return "This child could not be linked. Confirm the student and parent belong to this school.";
    if (path.startsWith("parents")) return "Parent management API is unavailable. Retry after deployment.";
    return "The selected school resource could not be loaded.";
  }
  if (path.includes("link-child") && (lower.includes("not found") || lower.includes("forbidden"))) {
    return "This child could not be linked. Confirm the student and parent belong to this school.";
  }
  return message;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}





