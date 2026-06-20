"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Library,
  Megaphone,
  RefreshCw,
  School,
  Settings,
  ShieldCheck,
  TableProperties,
  UserRoundCheck,
  Users,
  WalletCards
} from "lucide-react";
import { formatNumber } from "../../lib/super-admin-dashboard";
import { normalizeSchoolAdminDashboard, type SchoolAdminDashboardData } from "../../lib/school-admin-dashboard";

type ModuleId =
  | "dashboard"
  | "teachers"
  | "students"
  | "parents"
  | "classes"
  | "sections"
  | "subjects"
  | "attendance"
  | "timetable"
  | "exams"
  | "fees"
  | "library"
  | "notices"
  | "reports"
  | "settings";

type ApiOne<T> = { success: true; data: T };

type IconType = React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;

const modules: Array<{ id: ModuleId; label: string; icon: IconType; summary: string }> = [
  { id: "dashboard", label: "Dashboard", icon: GraduationCap, summary: "Real school metrics and analytics." },
  { id: "teachers", label: "Teachers", icon: UserRoundCheck, summary: "Teacher account and assignment workflows are scheduled for the next slice." },
  { id: "students", label: "Students", icon: GraduationCap, summary: "Student records, parent links, and class assignment are scheduled for the next slice." },
  { id: "parents", label: "Parents", icon: Users, summary: "Parent accounts and linked-child access are scheduled for the next slice." },
  { id: "classes", label: "Classes", icon: School, summary: "Academic setup implementation is intentionally not started in this pass." },
  { id: "sections", label: "Sections", icon: TableProperties, summary: "Section setup will be wired after the dashboard foundation is validated." },
  { id: "subjects", label: "Subjects/Courses", icon: BookOpen, summary: "Course setup and teacher assignment are scheduled for the academic setup slice." },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, summary: "Attendance marking and reports are not exposed until the attendance slice." },
  { id: "timetable", label: "Timetable", icon: CalendarDays, summary: "Timetable creation is pending a dedicated implementation slice." },
  { id: "exams", label: "Exams", icon: ClipboardList, summary: "Exam schedules, marks, and results are pending a dedicated slice." },
  { id: "fees", label: "Fees", icon: WalletCards, summary: "Fee setup and payment workflows are pending a dedicated slice." },
  { id: "library", label: "Library", icon: Library, summary: "Book management is pending a dedicated library slice." },
  { id: "notices", label: "Notices", icon: Megaphone, summary: "Communication workflows are pending a dedicated notices slice." },
  { id: "reports", label: "Reports", icon: ClipboardList, summary: "Reports will use real database queries in a later slice." },
  { id: "settings", label: "Settings", icon: Settings, summary: "School settings are pending a dedicated settings slice." }
];

export function SchoolAdminPortal() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="theme-school-admin grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-border bg-surface p-3 shadow-panel lg:sticky lg:top-4 lg:self-start">
        <div className="border-b border-border px-2 pb-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">School Admin</p>
          <p className="mt-1 text-lg font-semibold">Operations</p>
        </div>
        <nav className="mt-3 grid gap-1" aria-label="School Admin modules">
          {modules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                className={`flex h-10 items-center gap-2 rounded-md px-3 text-left text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
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
            <p className="text-sm font-medium text-primary">School Admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">School dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Real school-scoped metrics, analytics, and safe module entry points for the assigned tenant.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)} type="button">
            <RefreshCw aria-hidden={true} size={16} />
            Refresh
          </button>
        </header>

        {activeModule === "dashboard" ? <Dashboard refreshKey={refreshKey} /> : <ComingSoon module={modules.find((item) => item.id === activeModule)!} />}
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
  const metricCards = [
    ["Campuses", dashboard.metrics.campuses, "Campus records scoped to this school", School],
    ["Teachers", dashboard.metrics.teachers, "Teacher profiles in this school", UserRoundCheck],
    ["Students", dashboard.metrics.students, "Student profiles in this school", GraduationCap],
    ["Parents", dashboard.metrics.parents, "Active parent memberships in this school", Users],
    ["Classes", dashboard.metrics.classes, "Class records in this school", School],
    ["Sections", dashboard.metrics.sections, "Section records in this school", TableProperties],
    ["Subjects/Courses", dashboard.metrics.subjects, "Subject records in this school", BookOpen],
    ["Library books", dashboard.metrics.libraryBooks, "Book records in this school", Library]
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{dashboard.school?.name ?? "Assigned school"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard.school?.slug ? `${dashboard.school.slug} - ` : ""}{dashboard.school?.status ?? "Status unavailable"}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">
            <ShieldCheck aria-hidden={true} size={16} />
            School-scoped access
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value, detail, Icon]) => (
          <section key={label} className="rounded-lg border border-border bg-surface p-4 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
            </div>
            <p className="mt-3 text-3xl font-semibold">{formatNumber(value)}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Students by class" rows={dashboard.studentsByClass.map((item) => ({ label: item.label, value: item.count }))} emptyText="No student class distribution is available yet." />
        <BarChart title="Admissions by status" rows={dashboard.admissionsByStatus.map((item) => ({ label: item.status, value: item.count }))} emptyText="No admission applications are available yet." />
        <BarChart title="Fee status summary" rows={dashboard.feeStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No fee records are available yet." />
        <BarChart title="Library status summary" rows={dashboard.libraryStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No library book records are available yet." />
        <BarChart title="Attendance status summary" rows={dashboard.attendanceByStatus.map((item) => ({ label: item.status, value: item.count }))} emptyText="No attendance records are available yet." />
        <BarChart title="Exam status summary" rows={dashboard.examStatusSummary.map((item) => ({ label: item.status, value: item.count }))} emptyText="No exam records are available yet." />
      </div>

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

function ComingSoon({ module }: { module: (typeof modules)[number] }) {
  const Icon = module.icon;
  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-panel">
      <div className="flex max-w-3xl items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={20} /></span>
        <div>
          <p className="text-sm font-medium text-primary">Coming Soon</p>
          <h2 className="mt-1 text-xl font-semibold">{module.label}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
        </div>
      </div>
    </section>
  );
}

function BarChart({ title, rows, emptyText }: { title: string; rows: Array<{ label: string; value: number }>; emptyText: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {rows.length === 0 ? <StatePanel text={emptyText} compact /> : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{row.label}</span>
                <span className="text-muted-foreground">{formatNumber(row.value)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
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

async function api(path: string) {
  const response = await fetch(`/api/school-admin/${path}`, { headers: { "content-type": "application/json" } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}





