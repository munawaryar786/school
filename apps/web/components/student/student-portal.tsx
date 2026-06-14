"use client";

import { useEffect, useState } from "react";
import { Award, Banknote, CalendarCheck, CalendarDays, Download, FileCheck2, FileText, GraduationCap, Loader2, MonitorCheck, ReceiptText, RefreshCw, Save, Search, Send, Trash2, UploadCloud } from "lucide-react";

type ResourceId = "dashboard" | "attendance" | "timetable" | "assignments" | "submissions" | "materials" | "results" | "online-exams" | "exam-attempts" | "certificates" | "transcripts" | "fees" | "payments";
type Row = Record<string, any>;
type ApiList<T> = { success: true; data: T[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number } };
type ApiOne<T> = { success: true; data: T };

const resources: Array<{ id: ResourceId; label: string; icon: any; columns: string[]; form?: Row; status: string[] }> = [
  { id: "dashboard", label: "Dashboard", icon: GraduationCap, columns: [], status: [] },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, columns: ["studentName", "className", "attendanceDate", "status", "remarks"], status: ["", "PRESENT", "ABSENT", "LATE", "EXCUSED"] },
  { id: "timetable", label: "Timetable", icon: CalendarDays, columns: ["className", "subject", "teacher", "dayOfWeek", "startsAt", "endsAt", "status"], status: ["", "ACTIVE", "INACTIVE"] },
  { id: "assignments", label: "Assignments", icon: FileText, columns: ["title", "className", "subject", "dueDate", "maxMarks", "status"], status: ["", "PUBLISHED", "CLOSED"] },
  { id: "submissions", label: "Submissions", icon: Send, columns: ["assignmentTitle", "className", "subject", "content", "attachmentUrl", "status", "submittedAt"], form: { assignmentTitle: "Fractions worksheet", className: "Grade 1", subject: "Mathematics", content: "Completed work submitted through the portal.", attachmentUrl: "https://schoolerp.local/submissions/student-work", status: "SUBMITTED" }, status: ["", "SUBMITTED", "GRADED", "RETURNED"] },
  { id: "materials", label: "Materials", icon: UploadCloud, columns: ["title", "className", "subject", "resourceType", "url", "status"], status: ["", "PUBLISHED", "ARCHIVED"] },
  { id: "results", label: "Results", icon: FileCheck2, columns: ["studentName", "className", "subject", "assessment", "marksObtained", "maxMarks", "status"], status: ["", "RECORDED", "PUBLISHED", "REVISED"] },
  { id: "online-exams", label: "Online Exams", icon: MonitorCheck, columns: ["title", "className", "subject", "opensAt", "closesAt", "durationMinutes", "status"], status: ["", "OPEN", "CLOSED", "SCHEDULED"] },
  { id: "exam-attempts", label: "Exam Attempts", icon: MonitorCheck, columns: ["examTitle", "subject", "score", "status", "submittedAt"], form: { examTitle: "Mathematics Online Quiz", subject: "Mathematics", answers: "q1=A;q2=C", status: "SUBMITTED" }, status: ["", "SUBMITTED", "GRADED"] },
  { id: "certificates", label: "Certificates", icon: Award, columns: ["title", "certificateNumber", "issuedOn", "fileUrl", "status"], status: ["", "ISSUED", "REVOKED"] },
  { id: "transcripts", label: "Transcripts", icon: ReceiptText, columns: ["title", "academicYear", "gpa", "fileUrl", "status"], status: ["", "PUBLISHED", "ARCHIVED"] },
  { id: "fees", label: "Fees", icon: Banknote, columns: ["title", "amount", "dueDate", "status"], status: ["", "PENDING", "PAID", "OVERDUE"] },
  { id: "payments", label: "Payments", icon: Banknote, columns: ["feeTitle", "amount", "paidOn", "method", "status", "receiptNumber"], form: { feeTitle: "June Tuition", amount: 25000, paidOn: "2026-06-12", method: "ONLINE", status: "PAID", receiptNumber: "RCPT-STUDENT-NEW" }, status: ["", "PAID", "PENDING", "FAILED"] }
];

export function StudentPortal() {
  const [resource, setResource] = useState<ResourceId>("dashboard");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const active = resources.find((item) => item.id === resource)!;

  useEffect(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, [resource]);

  return (
    <div className="theme-student space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Student</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Student portal</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Track attendance, timetable, assignments, materials, results, exams, certificates, transcripts, fees, and payments.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-border" aria-label="Student modules">
        {resources.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium ${resource === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setResource(item.id)}>
              <Icon aria-hidden={true} size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {message ? <div className="rounded-md border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">{message}</div> : null}

      {resource === "dashboard" ? <Dashboard refreshKey={refreshKey} /> : (
        <>
          <Toolbar active={active} search={search} setSearch={setSearch} status={status} setStatus={setStatus} />
          <ResourcePanel active={active} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={(text) => { setMessage(text); setRefreshKey((value) => value + 1); }} />
        </>
      )}
    </div>
  );
}

function Dashboard({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error } = useSimple<ApiOne<Row>>("dashboard", refreshKey);
  const cards = resources.filter((item) => item.id !== "dashboard");
  if (loading) return <State text="Loading dashboard" />;
  if (error) return <State text={error} tone="error" />;
  return (
    <section className="space-y-4">
      {data?.data?.profile ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{data.data.profile.name}</span>
          <span> · {data.data.profile.className}</span>
          {data.data.profile.admissionNumber ? <span> · {data.data.profile.admissionNumber}</span> : null}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          const key = item.id === "online-exams" ? "onlineExams" : item.id === "exam-attempts" ? "examAttempts" : item.id;
          return (
            <article key={item.id} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={20} /></div>
              <p className="mt-4 text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-3xl font-semibold">{data?.data?.[key] ?? 0}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Toolbar({ active, search, setSearch, status, setStatus }: { active: (typeof resources)[number]; search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <Search aria-hidden={true} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${active.label.toLowerCase()}`} />
      </label>
      <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
        {active.status.map((item) => <option key={item || "all"} value={item}>{item || "All statuses"}</option>)}
      </select>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium" onClick={() => exportCsv(active.id, search, status)}>
        <Download aria-hidden={true} size={16} />
        Export
      </button>
    </div>
  );
}

function ResourcePanel({ active, search, status, page, setPage, refreshKey, onDone }: { active: (typeof resources)[number]; search: string; status: string; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void }) {
  const [form, setForm] = useState<Row>(active.form ?? {});
  const { data, loading, error } = useList(active.id, search, status, page, refreshKey);
  useEffect(() => setForm(active.form ?? {}), [active.id]);
  async function submit() {
    await api(active.id, { method: "POST", body: JSON.stringify(coerceForm(form)) });
    setForm(active.form ?? {});
    onDone(`${active.label} saved.`);
  }
  return (
    <div className={active.form ? "grid gap-4 xl:grid-cols-[360px_1fr]" : "grid gap-4"}>
      {active.form ? <FormPanel title={`Create ${active.label}`} form={form} setForm={setForm} onSubmit={submit} /> : null}
      <DataTable active={active} data={data?.data ?? []} loading={loading} error={error} pagination={data?.pagination} setPage={setPage} onDelete={active.form ? async (row) => { await api(`${active.id}/${row.id}`, { method: "DELETE" }); onDone(`${active.label} deleted.`); } : undefined} />
    </div>
  );
}

function FormPanel({ title, form, setForm, onSubmit }: { title: string; form: Row; setForm: (form: Row) => void; onSubmit: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium uppercase text-muted-foreground">{key}</span>
            {["content", "answers"].includes(key) ? (
              <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            ) : (
              <input className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            )}
          </label>
        ))}
      </div>
      <button className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-65" disabled={saving} onClick={async () => { setSaving(true); try { await onSubmit(); } finally { setSaving(false); } }}>
        {saving ? <Loader2 aria-hidden={true} className="animate-spin" size={16} /> : <Save aria-hidden={true} size={16} />}
        Save
      </button>
    </section>
  );
}

function DataTable({ active, data, loading, error, pagination, setPage, onDelete }: { active: (typeof resources)[number]; data: Row[]; loading: boolean; error: string | null; pagination?: { page: number; totalPages: number; total: number }; setPage: (page: number) => void; onDelete?: (row: Row) => Promise<void> }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{active.label}</h2>
        {pagination ? <span className="text-xs text-muted-foreground">{pagination.total} records</span> : null}
      </div>
      {loading ? <State text="Loading records" /> : error ? <State text={error} tone="error" /> : data.length === 0 ? <State text="No records found" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>{active.columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}{onDelete ? <th className="px-4 py-3 text-right font-semibold">Actions</th> : null}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id}>
                  {active.columns.map((column) => <td key={column} className="px-4 py-3">{formatValue(row[column])}</td>)}
                  {onDelete ? (
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex rounded-md border border-border p-2 text-danger" onClick={() => onDelete(row)} aria-label="Delete"><Trash2 aria-hidden={true} size={14} /></button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination ? (
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>Previous</button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)}>Next</button>
        </div>
      ) : null}
    </section>
  );
}

function State({ text, tone }: { text: string; tone?: "error" }) {
  return <div className={`rounded-lg border border-border bg-surface p-6 text-sm ${tone === "error" ? "text-danger" : "text-muted-foreground"}`}>{text}</div>;
}

function useList(endpoint: string, search: string, status: string, page: number, refreshKey: number) {
  const [data, setData] = useState<ApiList<Row> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setLoading(true);
    setError(null);
    api(`${endpoint}?${params.toString()}`).then(setData).catch((caught) => setError(caught.message)).finally(() => setLoading(false));
  }, [endpoint, search, status, page, refreshKey]);
  return { data, loading, error };
}

function useSimple<T>(endpoint: string, refreshKey: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api(endpoint).then(setData).catch((caught) => setError(caught.message)).finally(() => setLoading(false));
  }, [endpoint, refreshKey]);
  return { data, loading, error };
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/student/${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function exportCsv(resource: ResourceId, search: string, status: string) {
  const params = new URLSearchParams({ format: "csv", pageSize: "100" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  window.location.href = `/api/student/${resource}?${params.toString()}`;
}

function coerceForm(form: Row) {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => {
    if (["amount"].includes(key)) return [key, Number(value)];
    if (key === "answers") return [key, parseAnswers(String(value))];
    return [key, value];
  }));
}

function parseAnswers(value: string) {
  return Object.fromEntries(value.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const [key, ...rest] = part.split("=");
    return [key.trim(), rest.join("=").trim()];
  }));
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
}
