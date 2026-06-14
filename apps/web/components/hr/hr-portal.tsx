"use client";

import { useEffect, useState } from "react";
import { BadgeDollarSign, BriefcaseBusiness, CalendarOff, Download, FileText, Loader2, ReceiptText, RefreshCw, Save, Search, Trash2, Users } from "lucide-react";

type ResourceId = "dashboard" | "employees" | "leaves" | "payroll" | "salary-slips";
type Row = Record<string, any>;
type ApiList<T> = { success: true; data: T[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number } };
type ApiOne<T> = { success: true; data: T };

const resources: Array<{ id: ResourceId; label: string; icon: any; columns: string[]; form: Row; status: string[] }> = [
  { id: "dashboard", label: "Dashboard", icon: BriefcaseBusiness, columns: [], form: {}, status: [] },
  { id: "employees", label: "Employees", icon: Users, columns: ["employeeNumber", "name", "department", "designation", "email", "phone", "joiningDate", "salary", "status"], form: { employeeNumber: "EMP-1002", name: "Office Staff", department: "Administration", designation: "Office Coordinator", email: "office.staff@demo-academy.local", phone: "555-0141", joiningDate: "2026-01-05", salary: 45000, status: "ACTIVE" }, status: ["", "ACTIVE", "ON_LEAVE", "SUSPENDED", "EXITED"] },
  { id: "leaves", label: "Leaves", icon: CalendarOff, columns: ["employeeName", "leaveType", "startsOn", "endsOn", "days", "reason", "status"], form: { employeeName: "Teacher User", leaveType: "CASUAL", startsOn: "2026-07-10", endsOn: "2026-07-11", days: 2, reason: "Family commitment.", status: "REQUESTED" }, status: ["", "REQUESTED", "APPROVED", "REJECTED", "CANCELLED"] },
  { id: "payroll", label: "Payroll", icon: BadgeDollarSign, columns: ["employeeName", "payrollMonth", "basicSalary", "allowances", "deductions", "netSalary", "status"], form: { employeeName: "Teacher User", payrollMonth: "2026-07", basicSalary: 65000, allowances: 5000, deductions: 2000, netSalary: 68000, status: "PROCESSED" }, status: ["", "DRAFT", "PROCESSED", "PAID", "HELD"] },
  { id: "salary-slips", label: "Salary Slips", icon: ReceiptText, columns: ["slipNumber", "employeeName", "payrollMonth", "netSalary", "fileUrl", "status"], form: { slipNumber: "SLIP-EMP-1001-2026-07", employeeName: "Teacher User", payrollMonth: "2026-07", netSalary: 68000, fileUrl: "https://schoolerp.local/hr/salary-slips/SLIP-EMP-1001-2026-07.pdf", status: "ISSUED" }, status: ["", "DRAFT", "ISSUED", "REVOKED"] }
];

export function HrPortal() {
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
          <p className="text-sm font-medium text-primary">HR & Payroll</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">HR workspace</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Manage employees, leave requests, payroll runs, and salary slips for the active school.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-border" aria-label="HR modules">
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
    { key: "employees", label: "Employees", icon: Users },
    { key: "leaves", label: "Leaves", icon: CalendarOff },
    { key: "payroll", label: "Payroll", icon: BadgeDollarSign },
    { key: "salarySlips", label: "Salary Slips", icon: ReceiptText },
    { key: "activeEmployees", label: "Active Employees", icon: BriefcaseBusiness },
    { key: "pendingLeaves", label: "Pending Leaves", icon: CalendarOff },
    { key: "payrollAmount", label: "Payroll Amount", icon: FileText }
  ];
  if (loading) return <State text="Loading dashboard" />;
  if (error) return <State text={error} tone="error" />;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
  const { data, loading, error } = useList(active.id, search, status, page, refreshKey);
  useEffect(() => setForm(active.form), [active.id]);
  async function submit() {
    await api(active.id, { method: "POST", body: JSON.stringify(coerceForm(form)) });
    setForm(active.form);
    onDone(`${active.label} record saved.`);
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <FormPanel title={`Create ${active.label}`} form={form} setForm={setForm} onSubmit={submit} />
      <DataTable active={active} data={data?.data ?? []} loading={loading} error={error} pagination={data?.pagination} setPage={setPage} onDelete={async (row) => { await api(`${active.id}/${row.id}`, { method: "DELETE" }); onDone(`${active.label} record deleted.`); }} />
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
            {["reason"].includes(key) ? (
              <textarea className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
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

function DataTable({ active, data, loading, error, pagination, setPage, onDelete }: { active: (typeof resources)[number]; data: Row[]; loading: boolean; error: string | null; pagination?: { page: number; totalPages: number; total: number }; setPage: (page: number) => void; onDelete: (row: Row) => Promise<void> }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{active.label}</h2>
        {pagination ? <span className="text-xs text-muted-foreground">{pagination.total} records</span> : null}
      </div>
      {loading ? <State text="Loading records" /> : error ? <State text={error} tone="error" /> : data.length === 0 ? <State text="No records found" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>{active.columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}<th className="px-4 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id}>
                  {active.columns.map((column) => <td key={column} className="px-4 py-3">{formatValue(row[column])}</td>)}
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex rounded-md border border-border p-2 text-danger" onClick={() => onDelete(row)} aria-label="Delete"><Trash2 aria-hidden={true} size={14} /></button>
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
  const response = await fetch(`/api/hr/${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function exportCsv(resource: ResourceId, search: string, status: string) {
  const params = new URLSearchParams({ format: "csv", pageSize: "100" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  window.location.href = `/api/hr/${resource}?${params.toString()}`;
}

function coerceForm(form: Row) {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => {
    if (["salary", "days", "basicSalary", "allowances", "deductions", "netSalary"].includes(key)) return [key, Number(value)];
    return [key, value];
  }));
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
}
