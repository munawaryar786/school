"use client";

import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, Building2, Download, FileClock, Landmark, Loader2, Plus, RefreshCw, Save, Search, Settings, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";

type ApiList<T> = { success: true; data: T[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number } };
type ApiOne<T> = { success: true; data: T };

type Row = Record<string, any>;

const sections = [
  { id: "schools", label: "Schools", icon: Building2 },
  { id: "administrators", label: "Administrators", icon: UserCog },
  { id: "subscriptions", label: "Subscriptions", icon: Landmark },
  { id: "revenue", label: "Revenue", icon: Download },
  { id: "users", label: "Users", icon: Users },
  { id: "audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "backups", label: "Backup", icon: ArchiveRestore }
] as const;

type SectionId = (typeof sections)[number]["id"];

export function SuperAdminPortal() {
  const [section, setSection] = useState<SectionId>("schools");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setStatus("");
    setSearch("");
  }, [section]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Super Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Platform operations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage schools, administrators, subscriptions, revenue, users, audit trails, settings, and backup operations.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-border" aria-label="Super Admin modules">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium ${section === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
              onClick={() => setSection(item.id)}
            >
              <Icon aria-hidden={true} size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {message ? <div className="rounded-md border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">{message}</div> : null}

      <Toolbar section={section} search={search} setSearch={setSearch} status={status} setStatus={setStatus} onExport={() => exportCsv(section, search, status)} />

      <SectionBody section={section} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={(text) => { setMessage(text); setRefreshKey((value) => value + 1); }} />
    </div>
  );
}

function Toolbar({ section, search, setSearch, status, setStatus, onExport }: { section: SectionId; search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; onExport: () => void }) {
  const statusOptions = useMemo(() => {
    if (section === "schools") return ["", "ACTIVE", "TRIAL", "SUSPENDED", "ARCHIVED"];
    if (section === "subscriptions") return ["", "TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"];
    if (section === "administrators") return ["", "ACTIVE", "INVITED", "SUSPENDED"];
    if (section === "users") return ["", "ACTIVE", "INACTIVE"];
    return [""];
  }, [section]);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <Search aria-hidden={true} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
      </label>
      {statusOptions.length > 1 ? (
        <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statusOptions.map((item) => <option key={item || "all"} value={item}>{item || "All statuses"}</option>)}
        </select>
      ) : null}
      {section !== "settings" && section !== "backups" ? (
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium" onClick={onExport}>
          <Download aria-hidden={true} size={16} />
          Export
        </button>
      ) : null}
    </div>
  );
}

function SectionBody({ section, search, status, page, setPage, refreshKey, onDone }: { section: SectionId; search: string; status: string; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void }) {
  if (section === "schools") return <CrudSection title="Schools" endpoint="schools" columns={["name", "slug", "status", "email", "phone"]} emptyForm={{ name: "", slug: "", status: "TRIAL", email: "", phone: "", address: "", website: "" }} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={onDone} />;
  if (section === "administrators") return <CrudSection title="Administrators" endpoint="administrators" columns={["name", "email", "schoolName", "status"]} emptyForm={{ schoolId: "", name: "", email: "", password: "Password123!", status: "ACTIVE" }} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={onDone} />;
  if (section === "subscriptions") return <SubscriptionsSection search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={onDone} />;
  if (section === "revenue") return <ReadOnlySection title="Revenue Reports" endpoint="revenue" columns={["schoolName", "planName", "status", "amount", "currency", "periodStart"]} search={search} page={page} setPage={setPage} refreshKey={refreshKey} />;
  if (section === "users") return <CrudSection title="Users" endpoint="users" columns={["name", "email", "isActive", "roles"]} emptyForm={{ name: "", email: "", password: "Password123!", isActive: true }} search={search} status={status} page={page} setPage={setPage} refreshKey={refreshKey} onDone={onDone} />;
  if (section === "audit-logs") return <ReadOnlySection title="Audit Logs" endpoint="audit-logs" columns={["action", "resource", "resourceId", "createdAt"]} search={search} page={page} setPage={setPage} refreshKey={refreshKey} />;
  if (section === "settings") return <SettingsSection onDone={onDone} refreshKey={refreshKey} />;
  return <BackupsSection onDone={onDone} refreshKey={refreshKey} />;
}

function CrudSection({ title, endpoint, columns, emptyForm, search, status, page, setPage, refreshKey, onDone }: { title: string; endpoint: string; columns: string[]; emptyForm: Row; search: string; status: string; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void }) {
  const [form, setForm] = useState<Row>(emptyForm);
  const { data, loading, error } = useList(endpoint, search, status, page, refreshKey);
  async function submit() {
    await api(endpoint, { method: "POST", body: JSON.stringify(coerceForm(form)) });
    setForm(emptyForm);
    onDone(`${title} saved successfully.`);
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <FormPanel title={`Create ${title}`} form={form} setForm={setForm} onSubmit={submit} />
      <DataTable title={title} columns={columns} data={data?.data ?? []} loading={loading} error={error} pagination={data?.pagination} setPage={setPage} onDelete={async (row) => { await api(`${endpoint}/${row.id}`, { method: "DELETE" }); onDone(`${title} record deleted.`); }} />
    </div>
  );
}

function SubscriptionsSection(props: { search: string; status: string; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void }) {
  const [form, setForm] = useState<Row>({ schoolId: "", planId: "", status: "TRIAL", billingCycle: "MONTHLY", currentPeriodStart: new Date().toISOString().slice(0, 10), currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), amount: 0, currency: "USD" });
  const list = useList("subscriptions", props.search, props.status, props.page, props.refreshKey);
  const plans = useSimpleList("plans", props.refreshKey);
  async function createPlan() {
    await api("plans", { method: "POST", body: JSON.stringify({ name: `Plan ${Date.now()}`, description: "Created from Super Admin", monthlyAmount: 9900, annualAmount: 99000, currency: "USD", isActive: true }) });
    props.onDone("Subscription plan created.");
  }
  async function submit() {
    await api("subscriptions", { method: "POST", body: JSON.stringify(coerceForm(form)) });
    props.onDone("Subscription saved successfully.");
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={createPlan}><Plus aria-hidden={true} size={16} />Create default plan</button>
        <p className="text-xs text-muted-foreground">Available plans: {plans.data?.data?.map((plan: Row) => plan.name).join(", ") || "none"}</p>
        <FormPanel title="Create Subscription" form={form} setForm={setForm} onSubmit={submit} />
      </div>
      <DataTable title="Subscriptions" columns={["schoolName", "planName", "status", "amount", "currency"]} data={list.data?.data ?? []} loading={list.loading} error={list.error} pagination={list.data?.pagination} setPage={props.setPage} onDelete={async (row) => { await api(`subscriptions/${row.id}`, { method: "DELETE" }); props.onDone("Subscription cancelled."); }} />
    </div>
  );
}

function ReadOnlySection({ title, endpoint, columns, search, page, setPage, refreshKey }: { title: string; endpoint: string; columns: string[]; search: string; page: number; setPage: (page: number) => void; refreshKey: number }) {
  const { data, loading, error } = useList(endpoint, search, "", page, refreshKey);
  return <DataTable title={title} columns={columns} data={data?.data ?? []} loading={loading} error={error} pagination={data?.pagination} setPage={setPage} />;
}

function SettingsSection({ onDone, refreshKey }: { onDone: (message: string) => void; refreshKey: number }) {
  const [form, setForm] = useState<Row>({ key: "platform.support_email", value: "support@schoolerp.local", description: "Support email", isSecret: false });
  const settings = useSimpleList("settings", refreshKey);
  async function submit() {
    await api("settings", { method: "POST", body: JSON.stringify({ ...form, value: parseSettingValue(form.value) }) });
    onDone("System setting saved.");
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <FormPanel title="Save Setting" form={form} setForm={setForm} onSubmit={submit} />
      <DataTable title="System Settings" columns={["key", "description", "isSecret", "updatedAt"]} data={settings.data?.data ?? []} loading={settings.loading} error={settings.error} />
    </div>
  );
}

function BackupsSection({ onDone, refreshKey }: { onDone: (message: string) => void; refreshKey: number }) {
  const backups = useSimpleList("backups", refreshKey);
  async function createBackup() {
    await api("backups", { method: "POST", body: "{}" });
    onDone("Backup created.");
  }
  async function restore(row: Row) {
    await api(`backups/${row.id}/restore`, { method: "POST", body: "{}" });
    onDone("Backup restored.");
  }
  return (
    <div className="space-y-4">
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={createBackup}><FileClock aria-hidden={true} size={16} />Create Backup</button>
      <DataTable title="Backups" columns={["status", "fileSize", "checksum", "createdAt", "restoredAt"]} data={backups.data?.data ?? []} loading={backups.loading} error={backups.error} onRestore={restore} />
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
            {typeof value === "boolean" ? (
              <input type="checkbox" checked={value} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
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

function DataTable({ title, columns, data, loading, error, pagination, setPage, onDelete, onRestore }: { title: string; columns: string[]; data: Row[]; loading: boolean; error: string | null; pagination?: { page: number; totalPages: number; total: number }; setPage?: (page: number) => void; onDelete?: (row: Row) => Promise<void>; onRestore?: (row: Row) => Promise<void> }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {pagination ? <span className="text-xs text-muted-foreground">{pagination.total} records</span> : null}
      </div>
      {loading ? <State text="Loading records" /> : error ? <State text={error} tone="error" /> : data.length === 0 ? <State text="No records found" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}<th className="px-4 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => <td key={column} className="px-4 py-3">{formatValue(row[column])}</td>)}
                  <td className="px-4 py-3 text-right">
                    {onRestore ? <button className="mr-2 rounded-md border border-border px-2 py-1 text-xs" onClick={() => onRestore(row)}>Restore</button> : null}
                    {onDelete ? <button className="inline-flex rounded-md border border-border p-2 text-danger" onClick={() => onDelete(row)} aria-label="Delete"><Trash2 aria-hidden={true} size={14} /></button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && setPage ? (
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
  return <div className={`p-6 text-sm ${tone === "error" ? "text-danger" : "text-muted-foreground"}`}>{text}</div>;
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
    api(`${endpoint}?${params.toString()}`)
      .then(setData)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [endpoint, search, status, page, refreshKey]);
  return { data, loading, error };
}

function useSimpleList(endpoint: string, refreshKey: number) {
  const [data, setData] = useState<ApiOne<Row[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api(endpoint).then(setData).catch((caught) => setError(caught.message)).finally(() => setLoading(false));
  }, [endpoint, refreshKey]);
  return { data, loading, error };
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/super-admin/${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function exportCsv(section: SectionId, search: string, status: string) {
  const params = new URLSearchParams({ format: "csv", pageSize: "100" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  window.location.href = `/api/super-admin/${section}?${params.toString()}`;
}

function coerceForm(form: Row) {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => {
    if (["monthlyAmount", "annualAmount", "amount"].includes(key)) return [key, Number(value)];
    if (key === "isActive" || key === "isSecret") return [key, Boolean(value)];
    return [key, value];
  }));
}

function parseSettingValue(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

