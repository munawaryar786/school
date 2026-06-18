"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Download, FileCheck2, FileText, GraduationCap, Loader2, Pencil, RefreshCw, Save, Search, Trash2, UserPlus, X } from "lucide-react";

type ResourceId = "dashboard" | "applications" | "enrollments" | "documents" | "reports";
type Row = Record<string, any>;
type ApiList<T> = { success: true; data: T[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number } };
type ApiOne<T> = { success: true; data: T };

const resources: Array<{ id: ResourceId; label: string; icon: any; columns: string[]; form: Row; status: string[] }> = [
  { id: "dashboard", label: "Dashboard", icon: ClipboardList, columns: [], form: {}, status: [] },
  { id: "applications", label: "Applications", icon: UserPlus, columns: ["applicationNo", "applicantName", "guardianName", "guardianPhone", "desiredClass", "source", "appliedOn", "status", "notes"], form: { applicationNo: "APP-2026-NEW", applicantName: "Applicant Name", guardianName: "Guardian Name", guardianPhone: "555-0100", desiredClass: "Grade 1", source: "ONLINE", appliedOn: "2026-06-12", status: "SUBMITTED", notes: "New admission inquiry" }, status: ["", "SUBMITTED", "SHORTLISTED", "APPROVED", "REJECTED", "WAITLISTED"] },
  { id: "enrollments", label: "Enrollments", icon: GraduationCap, columns: ["applicationId", "studentName", "className", "enrollmentNo", "enrolledOn", "status", "notes"], form: { applicationId: "", studentName: "Applicant Name", className: "Grade 1", enrollmentNo: "ENR-2026-NEW", enrolledOn: "2026-06-15", status: "ENROLLED", notes: "Created from admissions workflow" }, status: ["", "ENROLLED", "WITHDRAWN", "PENDING"] },
  { id: "documents", label: "Documents", icon: FileCheck2, columns: ["applicationId", "applicantName", "documentType", "fileUrl", "verifiedBy", "uploadedOn", "status"], form: { applicationId: "", applicantName: "Applicant Name", documentType: "Birth Certificate", fileUrl: "https://schoolerp.local/admissions/documents/new.pdf", verifiedBy: "School Admin", uploadedOn: "2026-06-12", status: "PENDING" }, status: ["", "PENDING", "VERIFIED", "REJECTED"] },
  { id: "reports", label: "Reports", icon: FileText, columns: ["title", "period", "metric", "value", "status"], form: { title: "Admissions Pipeline", period: "2026-06", metric: "Applications", value: 12, status: "PUBLISHED" }, status: ["", "DRAFT", "PUBLISHED", "ARCHIVED"] }
];

export function AdmissionsPortal() {
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
    <div className="theme-school-admin space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Admissions</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Admissions workspace</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Manage applications, enrollment decisions, document verification, and admissions reports for the active school.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-border" aria-label="Admissions modules">
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
          <CrudPanel active={active} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={(text) => { setMessage(text); setRefreshKey((value) => value + 1); }} />
        </>
      )}
    </div>
  );
}

function Dashboard({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error } = useSimple<ApiOne<Row>>("dashboard", refreshKey);
  const cards = [
    { key: "applications", label: "Applications", icon: UserPlus },
    { key: "shortlisted", label: "Shortlisted", icon: ClipboardList },
    { key: "enrolled", label: "Enrolled", icon: GraduationCap },
    { key: "pendingDocuments", label: "Pending Docs", icon: FileCheck2 },
    { key: "reports", label: "Reports", icon: FileText }
  ];
  if (loading) return <State text="Loading dashboard" />;
  if (error) return <State text={error} tone="error" />;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.key} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={20} /></div>
            <p className="mt-4 text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold">{data?.data?.[item.key] ?? 0}</p>
          </article>
        );
      })}
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

function CrudPanel({ active, search, status, page, setPage, refreshKey, onDone }: { active: (typeof resources)[number]; search: string; status: string; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void }) {
  const [form, setForm] = useState<Row>(active.form);
  const [editing, setEditing] = useState<Row | null>(null);
  const { data, loading, error } = useList(active.id, search, status, page, refreshKey);
  useEffect(() => {
    setForm(active.form);
    setEditing(null);
  }, [active.id]);
  async function submit() {
    const body = JSON.stringify(coerceForm(form));
    if (editing?.id) {
      await api(`${active.id}/${editing.id}`, { method: "PATCH", body });
      setEditing(null);
      setForm(active.form);
      onDone(`${active.label} record updated.`);
      return;
    }
    await api(active.id, { method: "POST", body });
    setForm(active.form);
    onDone(`${active.label} record created.`);
  }
  function startEdit(row: Row) {
    setEditing(row);
    setForm(formFromRow(active.form, row));
  }
  function cancelEdit() {
    setEditing(null);
    setForm(active.form);
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <FormPanel title={editing ? `Edit ${active.label}` : `Create ${active.label}`} form={form} setForm={setForm} onSubmit={submit} submitLabel={editing ? "Update" : "Save"} onCancel={editing ? cancelEdit : undefined} />
      <DataTable active={active} data={data?.data ?? []} loading={loading} error={error} pagination={data?.pagination} setPage={setPage} onEdit={startEdit} onDelete={async (row) => {
        if (!window.confirm(`Delete this ${active.label.toLowerCase()} record? This action cannot be undone.`)) return;
        await api(`${active.id}/${row.id}`, { method: "DELETE" });
        if (editing?.id === row.id) cancelEdit();
        onDone(`${active.label} record deleted.`);
      }} />
    </div>
  );
}

function FormPanel({ title, form, setForm, onSubmit, submitLabel, onCancel }: { title: string; form: Row; setForm: (form: Row) => void; onSubmit: () => Promise<void>; submitLabel: string; onCancel?: () => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium uppercase text-muted-foreground">{key}</span>
            {key === "notes" ? (
              <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            ) : (
              <input className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            )}
          </label>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-65" disabled={saving} onClick={async () => { setSaving(true); try { await onSubmit(); } finally { setSaving(false); } }}>
          {saving ? <Loader2 aria-hidden={true} className="animate-spin" size={16} /> : <Save aria-hidden={true} size={16} />}
          {submitLabel}
        </button>
        {onCancel ? (
          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground" type="button" onClick={onCancel}>
            <X aria-hidden={true} size={16} />
            Cancel edit
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DataTable({ active, data, loading, error, pagination, setPage, onEdit, onDelete }: { active: (typeof resources)[number]; data: Row[]; loading: boolean; error: string | null; pagination?: { page: number; totalPages: number; total: number }; setPage: (page: number) => void; onEdit: (row: Row) => void; onDelete: (row: Row) => Promise<void> }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{active.label}</h2>
        {pagination ? <span className="text-xs text-muted-foreground">{pagination.total} records</span> : null}
      </div>
      {loading ? <State text="Loading records" /> : error ? <State text={error} tone="error" /> : data.length === 0 ? <State text="No records found" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>{active.columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}<th className="px-4 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id}>
                  {active.columns.map((column) => <td key={column} className="px-4 py-3">{formatValue(row[column])}</td>)}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="inline-flex rounded-md border border-border p-2 text-muted-foreground hover:text-foreground" onClick={() => onEdit(row)} aria-label={`Edit ${active.label} record`}>
                        <Pencil aria-hidden={true} size={14} />
                      </button>
                      <button className="inline-flex rounded-md border border-border p-2 text-danger" onClick={() => onDelete(row)} aria-label={`Delete ${active.label} record`}>
                        <Trash2 aria-hidden={true} size={14} />
                      </button>
                    </div>
                  </td>
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
  const response = await fetch(`/api/admissions/${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function exportCsv(resource: ResourceId, search: string, status: string) {
  const params = new URLSearchParams({ format: "csv", pageSize: "100" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  window.location.href = `/api/admissions/${resource}?${params.toString()}`;
}

function coerceForm(form: Row) {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => {
    if (key === "value") return [key, Number(value)];
    return [key, value];
  }));
}

function formFromRow(form: Row, row: Row) {
  return Object.fromEntries(Object.keys(form).map((key) => [key, formatInputValue(row[key])]));
}

function formatInputValue(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  if (value === null || value === undefined) return "";
  return value;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
}
