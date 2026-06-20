"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Archive,
  ArchiveRestore,
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  Eye,
  FileClock,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle
} from "lucide-react";
import {
  administratorSchema,
  campusSchema,
  createSchoolSchema,
  updateAdministratorSchema,
  updateCampusSchema,
  updateSchoolSchema,
  type AdministratorInput,
  type CampusInput,
  type CreateSchoolInput
} from "@school-erp/shared";
import { ensureArray, formatNumber, normalizeDashboardData, type SuperAdminDashboardData } from "../../lib/super-admin-dashboard";

type ApiList<T> = { success: true; data: T[]; pagination?: PaginationMeta };
type ApiOne<T> = { success: true; data: T };
type PaginationMeta = { page: number; pageSize: number; total: number; totalPages: number };
type FieldErrors<T extends object> = Partial<Record<keyof T, string>>;
type SortState = { sortBy: string; sortDirection: "asc" | "desc" };
type Row = Record<string, any>;

type SchoolDetailData = Row & {
  counts?: Partial<Record<"campuses" | "users" | "teachers" | "students" | "parents" | "libraryBooks" | "administrators", number>>;
  schoolAdmins?: Row[];
  campuses?: Row[];
  usersByRole?: Array<{ role: string; count: number }>;
  recentActivity?: Row[];
};

type SchoolOption = { id: string; name: string; slug: string; status: string };

const sections = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "schools", label: "Schools", icon: Building2 },
  { id: "campuses", label: "Campuses", icon: Landmark },
  { id: "administrators", label: "Administrators", icon: UserCog },
  { id: "audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "backups", label: "Backup", icon: ArchiveRestore }
] as const;

type SectionId = (typeof sections)[number]["id"];

const emptySchoolForm: CreateSchoolInput = { name: "", slug: "", status: "TRIAL", email: "", phone: "", address: "", website: "" };
const emptyCampusForm: CampusInput = { schoolId: "", name: "", code: "", status: "ACTIVE", address: "", phone: "", email: "" };
const emptyAdministratorForm: AdministratorInput = { schoolId: "", name: "", email: "", password: "", status: "ACTIVE" };

export function SuperAdminPortal() {
  const [section, setSection] = useState<SectionId>("dashboard");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortState>({ sortBy: "createdAt", sortDirection: "desc" });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setStatus("");
    setSearch("");
    setSort({ sortBy: "createdAt", sortDirection: "desc" });
  }, [section]);

  function done(text: string) {
    setMessage(text);
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Super Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Platform operations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage tenant lifecycle, campuses, school administrators, audit activity, and real platform health metrics.
          </p>
        </div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium" onClick={() => setRefreshKey((value) => value + 1)} type="button">
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
              type="button"
            >
              <Icon aria-hidden={true} size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {message ? <div className="rounded-md border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">{message}</div> : null}

      {section !== "dashboard" ? (
        <Toolbar
          section={section}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          onExport={() => exportCsv(section, search, status, sort)}
        />
      ) : null}

      {section === "dashboard" ? <DashboardSection refreshKey={refreshKey} /> : null}
      {section === "schools" ? <SchoolsSection search={search} status={status} sort={sort} setSort={setSort} page={page} setPage={setPage} refreshKey={refreshKey} onDone={done} /> : null}
      {section === "campuses" ? <CampusesSection search={search} status={status} sort={sort} setSort={setSort} page={page} setPage={setPage} refreshKey={refreshKey} onDone={done} /> : null}
      {section === "administrators" ? <AdministratorsSection search={search} status={status} sort={sort} setSort={setSort} page={page} setPage={setPage} refreshKey={refreshKey} onDone={done} /> : null}
      {section === "audit-logs" ? <ReadOnlySection title="Audit Logs" endpoint="audit-logs" columns={["action", "resource", "resourceId", "createdAt"]} search={search} page={page} setPage={setPage} refreshKey={refreshKey} /> : null}
      {section === "settings" ? <SettingsSection onDone={done} refreshKey={refreshKey} /> : null}
      {section === "backups" ? <BackupsSection onDone={done} refreshKey={refreshKey} /> : null}
    </div>
  );
}

function DashboardSection({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error, retry } = useOne<SuperAdminDashboardData>("dashboard", refreshKey);
  if (loading) return <LoadingPanel text="Loading Super Admin metrics" />;
  if (error) return <ErrorPanel text={error} onRetry={retry} />;
  if (!data) return <EmptyPanel text="No dashboard data is available." />;

  const dashboard = normalizeDashboardData(data);
  const { metrics: dashboardMetrics } = dashboard;
  const schoolsByStatus = ensureArray(dashboard.schoolsByStatus);
  const usersByRole = ensureArray(dashboard.usersByRole);
  const newSchoolsOverTime = ensureArray(dashboard.newSchoolsOverTime);
  const campusesPerSchool = ensureArray(dashboard.campusesPerSchool);
  const administratorStatusSummary = ensureArray(dashboard.administratorStatusSummary);
  const recentAdministratorActivity = ensureArray(dashboard.recentAdministratorActivity);
  const metrics = [
    ["Total schools", dashboardMetrics.totalSchools, "All school tenants including archived records", Building2],
    ["Active schools", dashboardMetrics.activeSchools, "Schools currently available to users", CheckCircle2],
    ["Suspended schools", dashboardMetrics.suspendedSchools, "Schools blocked from normal operations", ShieldAlert],
    ["Archived schools", dashboardMetrics.archivedSchools, "Schools archived from normal tenant lists", Archive],
    ["Total campuses", dashboardMetrics.totalCampuses, "Campus records across active tenant history", Landmark],
    ["School administrators", dashboardMetrics.totalAdministrators, "Assigned school administrator memberships", UserCog],
    ["Active administrators", dashboardMetrics.activeAdministrators, "Administrators who can currently operate schools", ShieldCheck],
    ["Suspended administrators", dashboardMetrics.suspendedAdministrators, "Administrators blocked from school operations", ShieldAlert],
    ["Total users", dashboardMetrics.totalUsers, "Platform user accounts", Users],
    ["Total students", dashboardMetrics.totalStudents, "Student profiles across schools", Users],
    ["Total staff", dashboardMetrics.totalStaff, "Staff and operational memberships", UserCog]
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, description, Icon]) => (
          <section key={label} className="rounded-lg border border-border bg-surface p-4 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
            </div>
            <p className="mt-3 text-3xl font-semibold">{formatNumber(value)}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickActionCard title="Create school" detail={`${formatNumber(dashboardMetrics.totalSchools)} schools currently tracked`} icon={Plus} />
        <QuickActionCard title="Create administrator" detail={`${formatNumber(dashboardMetrics.totalAdministrators)} administrators currently assigned`} icon={UserCog} />
        <QuickActionCard title="Review activity" detail={`${formatNumber(recentAdministratorActivity.length)} recent platform events loaded`} icon={Activity} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartList title="Schools by status" rows={schoolsByStatus.map((item) => ({ label: item.status, value: item.count }))} summary={`Schools are currently distributed across ${formatNumber(schoolsByStatus.length)} status groups.`} />
        <ChartList title="Users by role" rows={usersByRole.map((item) => ({ label: item.role, value: item.count }))} summary={`User memberships are currently distributed across ${formatNumber(usersByRole.length)} role groups.`} />
        <ChartList title="New schools over time" rows={newSchoolsOverTime.map((item) => ({ label: item.label, value: item.count }))} summary="New school records grouped from real created dates." />
        <ChartList title="Campuses per school" rows={campusesPerSchool.map((item) => ({ label: item.schoolName, value: item.count }))} summary="Campus counts are grouped from active school records." />
        <ChartList title="Administrator status" rows={administratorStatusSummary.map((item) => ({ label: item.status, value: item.count }))} summary="School administrator memberships grouped by status." />
      </div>

      <section className="rounded-lg border border-border bg-surface shadow-panel">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Recent administrator activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Last updated {dashboard.lastUpdatedAt ? formatDate(dashboard.lastUpdatedAt) : "Not available"}</p>
        </div>
        {recentAdministratorActivity.length === 0 ? (
          <EmptyPanel text="No recent administrator activity found." compact />
        ) : (
          <div className="divide-y divide-border">
            {recentAdministratorActivity.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{item.action} {item.resource}</p>
                  <p className="text-muted-foreground">{item.schoolName ?? "Platform"} - {item.actorName ?? item.actorEmail ?? "System"}</p>
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

function QuickActionCard({ title, detail, icon: Icon }: { title: string; detail: string; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }> }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </section>
  );
}

function SchoolDetailPanel({ schoolId, refreshKey, onClose }: { schoolId: string; refreshKey: number; onClose: () => void }) {
  const { data, loading, error, retry } = useOne<SchoolDetailData>(`schools/${schoolId}`, refreshKey);
  if (loading) return <LoadingPanel text="Loading school detail" />;
  if (error) return <ErrorPanel text={error} onRetry={retry} />;
  if (!data) return <EmptyPanel text="No school detail is available." />;

  const counts: NonNullable<SchoolDetailData["counts"]> = data.counts ?? {};
  const summaryRows = {
    name: data.name,
    slug: data.slug,
    status: data.status,
    email: data.email,
    phone: data.phone,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
  const countCards = [
    ["Campuses", counts.campuses ?? 0],
    ["Administrators", counts.administrators ?? 0],
    ["Users", counts.users ?? 0],
    ["Teachers", counts.teachers ?? 0],
    ["Students", counts.students ?? 0],
    ["Parents", counts.parents ?? 0],
    ["Library books", counts.libraryBooks ?? 0]
  ] as const;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-panel xl:col-start-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{data.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">School detail, assigned administrators, campuses, counts, and recent activity.</p>
        </div>
        <button className="h-10 rounded-md border border-border px-3 text-sm" onClick={onClose} type="button">Close</button>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {Object.entries(summaryRows).map(([key, value]) => (
          <div key={key} className="rounded-md border border-border bg-background p-3">
            <dt className="text-xs uppercase text-muted-foreground">{key}</dt>
            <dd className="mt-1 break-words text-sm">{key === "status" ? <StatusBadge value={value} /> : formatValue(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {countCards.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-background p-3">
            <p className="text-xs uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{formatNumber(value)}</p>
          </div>
        ))}
      </div>

      <MiniTable title="Assigned School Administrators" columns={["name", "email", "status", "createdAt"]} rows={data.schoolAdmins ?? []} />
      <MiniTable title="Campuses" columns={["name", "code", "status", "createdAt"]} rows={data.campuses ?? []} />
      <ChartList title="School users by role" rows={(data.usersByRole ?? []).map((item) => ({ label: item.role, value: item.count }))} summary="Role counts are scoped to this school." />
      <MiniTable title="Recent School Activity" columns={["action", "resource", "actorName", "createdAt"]} rows={data.recentActivity ?? []} />
    </section>
  );
}

function SchoolsSection(props: ListSectionProps) {
  const [form, setForm] = useState<CreateSchoolInput>(emptySchoolForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const formState = useValidatedSubmit<CreateSchoolInput>();
  const list = useList("schools", props.search, props.status, props.sort, props.page, props.refreshKey);

  function edit(row: Row) {
    setEditingId(row.id);
    setForm({ name: row.name ?? "", slug: row.slug ?? "", status: row.status ?? "TRIAL", email: row.email ?? "", phone: row.phone ?? "", address: row.address ?? "", website: row.website ?? "" });
    formState.clear();
  }

  async function submit() {
    const schema = editingId ? updateSchoolSchema : createSchoolSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return formState.setValidation(parsed.error);
    await formState.run(async () => {
      await api(editingId ? `schools/${editingId}` : "schools", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(parsed.data) });
      setEditingId(null);
      setForm(emptySchoolForm);
      props.onDone(editingId ? "School updated." : "School created successfully.");
    });
  }

  async function lifecycle(row: Row, action: "activate" | "suspend" | "archive") {
    const label = action === "archive" ? "archive" : action;
    if (!window.confirm(`Confirm ${label} for ${row.name}?`)) return;
    if (action === "archive") await api(`schools/${row.id}`, { method: "DELETE" });
    else await api(`schools/${row.id}/${action}`, { method: "POST", body: "{}" });
    props.onDone(`School ${label} action completed.`);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
      <FormCard title={editingId ? "Edit School" : "Create School"} error={formState.summaryError}>
        <TextField label="School name" value={form.name} error={formState.fieldErrors.name} onChange={(value) => updateForm(setForm, "name", value)} onBlur={() => { if (!form.slug && form.name) updateForm(setForm, "slug", slugify(form.name)); }} />
        <TextField label="Slug" value={form.slug} error={formState.fieldErrors.slug} helper="Lowercase letters, numbers, and hyphens only." onChange={(value) => updateForm(setForm, "slug", slugify(value))} />
        <SelectField label="Status" value={form.status} options={["TRIAL", "ACTIVE", "SUSPENDED", "ARCHIVED"]} error={formState.fieldErrors.status} onChange={(value) => updateForm(setForm, "status", value as CreateSchoolInput["status"])} />
        <TextField label="Email" value={form.email ?? ""} error={formState.fieldErrors.email} inputMode="email" onChange={(value) => updateForm(setForm, "email", value)} />
        <TextField label="Phone" value={form.phone ?? ""} error={formState.fieldErrors.phone} inputMode="tel" onChange={(value) => updateForm(setForm, "phone", value)} />
        <TextField label="Website" value={form.website ?? ""} error={formState.fieldErrors.website} inputMode="url" placeholder="https://example.edu" onChange={(value) => updateForm(setForm, "website", value)} />
        <TextAreaField label="Address" value={form.address ?? ""} error={formState.fieldErrors.address} onChange={(value) => updateForm(setForm, "address", value)} />
        <SubmitRow saving={formState.saving} label={editingId ? "Update school" : "Create school"} onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptySchoolForm); formState.clear(); } : undefined} />
      </FormCard>
      <DataTable
        title="Schools"
        columns={["name", "slug", "status", "email", "phone"]}
        data={list.data?.data ?? []}
        loading={list.loading}
        error={list.error}
        pagination={list.data?.pagination}
        sort={props.sort}
        setSort={props.setSort}
        setPage={props.setPage}
        onView={(row) => setSelectedSchoolId(row.id)}
        onEdit={edit}
        actions={(row) => (
          <>
            <ActionButton label="Activate" icon={CheckCircle2} onClick={() => lifecycle(row, "activate")} />
            <ActionButton label="Suspend" icon={XCircle} onClick={() => lifecycle(row, "suspend")} />
            <ActionButton label="Archive" icon={Archive} danger onClick={() => lifecycle(row, "archive")} />
          </>
        )}
      />
      {selectedSchoolId ? <SchoolDetailPanel schoolId={selectedSchoolId} refreshKey={props.refreshKey} onClose={() => setSelectedSchoolId(null)} /> : null}
    </div>
  );
}

function CampusesSection(props: ListSectionProps) {
  const [form, setForm] = useState<CampusInput>(emptyCampusForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formState = useValidatedSubmit<CampusInput>();
  const list = useList("campuses", props.search, props.status, props.sort, props.page, props.refreshKey);
  const schools = useSchoolOptions(props.refreshKey);

  function edit(row: Row) {
    setEditingId(row.id);
    setForm({ schoolId: row.schoolId ?? "", name: row.name ?? "", code: row.code ?? "", status: row.status ?? "ACTIVE", address: row.address ?? "", phone: row.phone ?? "", email: row.email ?? "" });
    formState.clear();
  }

  async function submit() {
    const schema = editingId ? updateCampusSchema : campusSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return formState.setValidation(parsed.error);
    await formState.run(async () => {
      await api(editingId ? `campuses/${editingId}` : "campuses", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(parsed.data) });
      setEditingId(null);
      setForm(emptyCampusForm);
      props.onDone(editingId ? "Campus updated." : "Campus created.");
    });
  }

  async function archive(row: Row) {
    if (!window.confirm(`Archive campus ${row.name}?`)) return;
    await api(`campuses/${row.id}`, { method: "DELETE" });
    props.onDone("Campus archived.");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
      <FormCard title={editingId ? "Edit Campus" : "Create Campus"} error={formState.summaryError}>
        <SchoolSelect value={form.schoolId} schools={schools.data} loading={schools.loading} error={schools.error} fieldError={formState.fieldErrors.schoolId} onChange={(value) => updateForm(setForm, "schoolId", value)} />
        <TextField label="Campus name" value={form.name} error={formState.fieldErrors.name} onChange={(value) => updateForm(setForm, "name", value)} />
        <TextField label="Code" value={form.code} error={formState.fieldErrors.code} onChange={(value) => updateForm(setForm, "code", value.toUpperCase())} />
        <SelectField label="Status" value={form.status} options={["ACTIVE", "INACTIVE", "ARCHIVED"]} error={formState.fieldErrors.status} onChange={(value) => updateForm(setForm, "status", value as CampusInput["status"])} />
        <TextField label="Email" value={form.email ?? ""} error={formState.fieldErrors.email} inputMode="email" onChange={(value) => updateForm(setForm, "email", value)} />
        <TextField label="Phone" value={form.phone ?? ""} error={formState.fieldErrors.phone} inputMode="tel" onChange={(value) => updateForm(setForm, "phone", value)} />
        <TextAreaField label="Address" value={form.address ?? ""} error={formState.fieldErrors.address} onChange={(value) => updateForm(setForm, "address", value)} />
        <SubmitRow saving={formState.saving} label={editingId ? "Update campus" : "Create campus"} onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyCampusForm); formState.clear(); } : undefined} />
      </FormCard>
      <DataTable title="Campuses" columns={["name", "code", "schoolName", "status", "email"]} data={list.data?.data ?? []} loading={list.loading} error={list.error} pagination={list.data?.pagination} sort={props.sort} setSort={props.setSort} setPage={props.setPage} onEdit={edit} onDelete={archive} />
    </div>
  );
}

function AdministratorsSection(props: ListSectionProps) {
  const [form, setForm] = useState<AdministratorInput>(emptyAdministratorForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState("");
  const formState = useValidatedSubmit<AdministratorInput>();
  const list = useList("administrators", props.search, props.status, props.sort, props.page, props.refreshKey, schoolFilter);
  const schools = useSchoolOptions(props.refreshKey);

  function edit(row: Row) {
    setEditingId(row.id);
    setForm({ schoolId: row.schoolId ?? "", name: row.name ?? "", email: row.email ?? "", password: "", status: row.status ?? "ACTIVE" });
    formState.clear();
  }

  async function submit() {
    const schema = editingId ? updateAdministratorSchema : administratorSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return formState.setValidation(parsed.error);
    await formState.run(async () => {
      await api(editingId ? `administrators/${editingId}` : "administrators", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(parsed.data) });
      setEditingId(null);
      setForm(emptyAdministratorForm);
      props.onDone(editingId ? "Administrator updated." : "Administrator created.");
    });
  }

  async function suspend(row: Row) {
    if (!window.confirm(`Suspend administrator ${row.name}?`)) return;
    await api(`administrators/${row.id}/suspend`, { method: "POST", body: "{}" });
    props.onDone("Administrator suspended.");
  }

  async function activate(row: Row) {
    await api(`administrators/${row.id}/activate`, { method: "POST", body: "{}" });
    props.onDone("Administrator activated.");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
      <FormCard title={editingId ? "Edit Administrator" : "Create Administrator"} error={formState.summaryError}>
        <SchoolSelect value={form.schoolId} schools={schools.data} loading={schools.loading} error={schools.error} fieldError={formState.fieldErrors.schoolId} onChange={(value) => updateForm(setForm, "schoolId", value)} />
        <TextField label="Name" value={form.name} error={formState.fieldErrors.name} onChange={(value) => updateForm(setForm, "name", value)} />
        <TextField label="Email" value={form.email} error={formState.fieldErrors.email} inputMode="email" onChange={(value) => updateForm(setForm, "email", value)} />
        <TextField label="Password" value={form.password ?? ""} error={formState.fieldErrors.password} helper={editingId ? "Leave blank to keep the current password." : "Minimum 8 characters."} onChange={(value) => updateForm(setForm, "password", value)} />
        <SelectField label="Status" value={form.status} options={["ACTIVE", "INVITED", "SUSPENDED"]} error={formState.fieldErrors.status} onChange={(value) => updateForm(setForm, "status", value as AdministratorInput["status"])} />
        <SubmitRow saving={formState.saving} label={editingId ? "Update administrator" : "Create administrator"} onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyAdministratorForm); formState.clear(); } : undefined} />
      </FormCard>
      <div className="space-y-4">
        <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
          <SchoolSelect value={schoolFilter} schools={schools.data} loading={schools.loading} error={schools.error} onChange={setSchoolFilter} />
        </section>
        <DataTable
          title="School Administrators"
          columns={["name", "email", "schoolName", "status", "createdAt"]}
          data={list.data?.data ?? []}
          loading={list.loading}
          error={list.error}
          pagination={list.data?.pagination}
          sort={props.sort}
          setSort={props.setSort}
          setPage={props.setPage}
          onEdit={edit}
          actions={(row) => (
            <>
              <ActionButton label="Activate" icon={CheckCircle2} onClick={() => activate(row)} />
              <ActionButton label="Suspend" icon={XCircle} danger onClick={() => suspend(row)} />
            </>
          )}
        />
      </div>
    </div>
  );
}

type ListSectionProps = { search: string; status: string; sort: SortState; setSort: (sort: SortState) => void; page: number; setPage: (page: number) => void; refreshKey: number; onDone: (message: string) => void };

function Toolbar({ section, search, setSearch, status, setStatus, onExport }: { section: SectionId; search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; onExport: () => void }) {
  const statusOptions = useMemo(() => {
    if (section === "schools") return ["", "ACTIVE", "TRIAL", "SUSPENDED", "ARCHIVED"];
    if (section === "campuses") return ["", "ACTIVE", "INACTIVE", "ARCHIVED"];
    if (section === "administrators") return ["", "ACTIVE", "INVITED", "SUSPENDED"];
    return [""];
  }, [section]);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <Search aria-hidden={true} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
      </label>
      {statusOptions.length > 1 ? (
        <select className="h-11 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status filter">
          {statusOptions.map((item) => <option key={item || "all"} value={item}>{item || "All statuses"}</option>)}
        </select>
      ) : null}
      {section !== "settings" && section !== "backups" ? (
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium" onClick={onExport} type="button">
          <Download aria-hidden={true} size={16} />
          Export
        </button>
      ) : null}
    </div>
  );
}

function DataTable({
  title,
  columns,
  data,
  loading,
  error,
  pagination,
  sort,
  setSort,
  setPage,
  onView,
  onEdit,
  onDelete,
  actions
}: {
  title: string;
  columns: string[];
  data: Row[];
  loading: boolean;
  error: string | null;
  pagination?: PaginationMeta;
  sort?: SortState;
  setSort?: (sort: SortState) => void;
  setPage?: (page: number) => void;
  onView?: (row: Row) => void;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => Promise<void>;
  actions?: (row: Row) => React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {pagination ? <span className="text-xs text-muted-foreground">{pagination.total} records</span> : null}
      </div>
      {loading ? <LoadingPanel text="Loading records" compact /> : error ? <ErrorPanel text={error} compact /> : data.length === 0 ? <EmptyPanel text="No records found." compact /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    <button className="inline-flex items-center gap-1 disabled:cursor-default" disabled={!isSortableColumn(column)} onClick={() => setSort?.(toggleSort(column, sort))} type="button">
                      {column}
                      {sort?.sortBy === column ? <span aria-hidden="true">{sort.sortDirection === "asc" ? "↑" : "↓"}</span> : null}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => <td key={column} className="px-4 py-3">{column === "status" ? <StatusBadge value={row[column]} /> : formatValue(row[column])}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {onView ? <ActionButton label="View" icon={Eye} onClick={() => onView(row)} /> : null}
                      {onEdit ? <ActionButton label="Edit" icon={Pencil} onClick={() => onEdit(row)} /> : null}
                      {actions?.(row)}
                      {onDelete ? <ActionButton label="Archive" icon={Trash2} danger onClick={() => void onDelete(row)} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && setPage ? (
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button className="h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)} type="button">Previous</button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button className="h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)} type="button">Next</button>
        </div>
      ) : null}
    </section>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  const text = formatValue(value) || "UNKNOWN";
  const tone = text === "ACTIVE" ? "border-success/30 bg-success/10 text-success" : text === "SUSPENDED" || text === "ARCHIVED" ? "border-error/30 bg-error/10 text-error" : text === "TRIAL" || text === "INVITED" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${tone}`}>{text}</span>;
}

function ChartList({ title, rows, summary }: { title: string; rows: Array<{ label: string; value: number }>; summary: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      {rows.length === 0 ? <EmptyPanel text="No chart data available." compact /> : (
        <div className="mt-4 space-y-3" aria-label={summary}>
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-sm"><span>{row.label}</span><span>{row.value}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MiniTable({ title, columns, rows }: { title: string; columns: string[]; rows: Row[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {rows.length === 0 ? <EmptyPanel text={`No ${title.toLowerCase()} found.`} compact /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id ?? `${title}-${JSON.stringify(row)}`}>
                  {columns.map((column) => <td key={column} className="px-4 py-3">{column === "status" ? <StatusBadge value={row[column]} /> : formatValue(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReadOnlySection({ title, endpoint, columns, search, page, setPage, refreshKey }: { title: string; endpoint: string; columns: string[]; search: string; page: number; setPage: (page: number) => void; refreshKey: number }) {
  const { data, loading, error } = useList(endpoint, search, "", { sortBy: "createdAt", sortDirection: "desc" }, page, refreshKey);
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
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={createBackup} type="button"><FileClock aria-hidden={true} size={16} />Create Backup</button>
      <DataTable title="Backups" columns={["status", "fileSize", "checksum", "createdAt", "restoredAt"]} data={backups.data?.data ?? []} loading={backups.loading} error={backups.error} actions={(row) => <ActionButton label="Restore" icon={ArchiveRestore} onClick={() => void restore(row)} />} />
    </div>
  );
}

function FormPanel({ title, form, setForm, onSubmit }: { title: string; form: Row; setForm: (form: Row) => void; onSubmit: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return (
    <FormCard title={title}>
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
      <SubmitRow saving={saving} label="Save" onSubmit={async () => { setSaving(true); try { await onSubmit(); } finally { setSaving(false); } }} />
    </FormCard>
  );
}

function FormCard({ title, error, children }: { title: string; error?: string | null; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {error ? <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error" role="alert">{error}</div> : null}
      {children}
    </section>
  );
}

function TextField({ label, value, error, helper, placeholder, inputMode, onChange, onBlur }: { label: string; value: string; error?: string; helper?: string; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; onChange: (value: string) => void; onBlur?: () => void }) {
  const id = useMemo(() => `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, [label]);
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input id={id} className={`h-11 w-full rounded-md border bg-background px-3 text-sm ${error ? "border-error" : "border-border"}`} value={value} placeholder={placeholder} inputMode={inputMode} aria-invalid={Boolean(error)} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
      {helper && !error ? <span className="mt-1 block text-xs text-muted-foreground">{helper}</span> : null}
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
}

function TextAreaField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea className={`min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm ${error ? "border-error" : "border-border"}`} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
}

function SelectField({ label, value, options, error, onChange }: { label: string; value: string; options: string[]; error?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select className={`h-11 w-full rounded-md border bg-background px-3 text-sm ${error ? "border-error" : "border-border"}`} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
}

function SchoolSelect({ value, schools, loading, error, fieldError, onChange }: { value: string; schools: SchoolOption[]; loading: boolean; error: string | null; fieldError?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">School</span>
      <select className={`h-11 w-full rounded-md border bg-background px-3 text-sm ${fieldError ? "border-error" : "border-border"}`} value={value} onChange={(event) => onChange(event.target.value)} disabled={loading || Boolean(error)}>
        <option value="">{loading ? "Loading schools" : error ? "Schools unavailable" : "Select school"}</option>
        {schools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.slug})</option>)}
      </select>
      {fieldError ? <span className="mt-1 block text-sm text-error">{fieldError}</span> : null}
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
}

function SubmitRow({ saving, label, onSubmit, onCancel }: { saving: boolean; label: string; onSubmit: () => void | Promise<void>; onCancel?: () => void }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {onCancel ? <button className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-4 text-sm font-medium" onClick={onCancel} type="button">Cancel</button> : null}
      <button className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-65" disabled={saving} onClick={() => void onSubmit()} type="button">
        {saving ? <Loader2 aria-hidden={true} className="animate-spin" size={16} /> : <Save aria-hidden={true} size={16} />}
        {label}
      </button>
    </div>
  );
}

function DetailPanel({ title, rows, onClose }: { title: string; rows: Row; onClose: () => void }) {
  return (
    <section className="xl:col-start-2 rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <button className="h-10 rounded-md border border-border px-3 text-sm" onClick={onClose} type="button">Close</button>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(rows).filter(([, value]) => typeof value !== "object").map(([key, value]) => (
          <div key={key} className="rounded-md border border-border bg-background p-3">
            <dt className="text-xs uppercase text-muted-foreground">{key}</dt>
            <dd className="mt-1 break-words text-sm">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LoadingPanel({ text, compact }: { text: string; compact?: boolean }) {
  return <div className={`rounded-lg border border-border bg-surface ${compact ? "p-6" : "p-8"} text-sm text-muted-foreground`}><Loader2 aria-hidden={true} className="mr-2 inline animate-spin" size={16} />{text}</div>;
}

function EmptyPanel({ text, compact }: { text: string; compact?: boolean }) {
  return <div className={`rounded-lg border border-border bg-surface ${compact ? "p-6" : "p-8"} text-sm text-muted-foreground`}>{text}</div>;
}

function ErrorPanel({ text, onRetry, compact }: { text: string; onRetry?: () => void; compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-error/30 bg-error/10 ${compact ? "p-6" : "p-8"} text-sm text-error`} role="alert">
      {text}
      {onRetry ? <button className="ml-3 rounded-md border border-error/30 px-3 py-1" onClick={onRetry} type="button">Retry</button> : null}
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, danger }: { label: string; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>; onClick: () => void; danger?: boolean }) {
  return (
    <button className={`inline-flex h-9 items-center gap-1 rounded-md border border-border px-2 text-xs ${danger ? "text-error" : "text-muted-foreground"}`} onClick={onClick} type="button">
      <Icon aria-hidden={true} size={14} />
      {label}
    </button>
  );
}

function useValidatedSubmit<T extends object>() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<T>>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  return {
    fieldErrors,
    summaryError,
    saving,
    clear: () => {
      setFieldErrors({});
      setSummaryError(null);
    },
    setValidation: (error: { flatten: () => { fieldErrors: Record<string, string[]> } }) => {
      const flattened = error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(flattened).map(([key, messages]) => [key, messages?.[0]])) as FieldErrors<T>);
      setSummaryError("Fix the highlighted fields before saving.");
    },
    run: async (callback: () => Promise<void>) => {
      setSaving(true);
      setSummaryError(null);
      try {
        await callback();
        setFieldErrors({});
      } catch (caught) {
        setSummaryError(caught instanceof Error ? caught.message : "Request failed.");
      } finally {
        setSaving(false);
      }
    }
  };
}

function useList(endpoint: string, search: string, status: string, sort: SortState, page: number, refreshKey: number, schoolId?: string) {
  const [data, setData] = useState<ApiList<Row> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10", sortBy: sort.sortBy, sortDirection: sort.sortDirection });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (schoolId) params.set("schoolId", schoolId);
    setLoading(true);
    setError(null);
    api(`${endpoint}?${params.toString()}`)
      .then(setData)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [endpoint, search, status, sort.sortBy, sort.sortDirection, page, refreshKey, schoolId]);
  return { data, loading, error };
}

function useOne<T>(endpoint: string, refreshKey: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api(endpoint)
      .then((payload: ApiOne<T>) => setData(payload.data))
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [endpoint, refreshKey, retryKey]);
  return { data, loading, error, retry: () => setRetryKey((value) => value + 1) };
}

function useSimpleList(endpoint: string, refreshKey: number) {
  const [data, setData] = useState<ApiOne<Row[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api(endpoint).then(setData).catch((caught) => setError(caught.message)).finally(() => setLoading(false));
  }, [endpoint, refreshKey]);
  return { data, loading, error };
}

function useSchoolOptions(refreshKey: number) {
  const [data, setData] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api("schools?page=1&pageSize=100&sortBy=name&sortDirection=asc")
      .then((payload: ApiList<Row>) => setData(payload.data.map((school) => ({ id: school.id, name: school.name, slug: school.slug, status: school.status }))))
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);
  return { data, loading, error };
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/super-admin/${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return payload;
}

function exportCsv(section: SectionId, search: string, status: string, sort: SortState) {
  const params = new URLSearchParams({ format: "csv", pageSize: "100", sortBy: sort.sortBy, sortDirection: sort.sortDirection });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  window.location.href = `/api/super-admin/${section}?${params.toString()}`;
}

function updateForm<T extends object, K extends keyof T>(setForm: React.Dispatch<React.SetStateAction<T>>, key: K, value: T[K]) {
  setForm((current) => ({ ...current, [key]: value }));
}

function toggleSort(column: string, current?: SortState): SortState {
  if (current?.sortBy === column) return { sortBy: column, sortDirection: current.sortDirection === "asc" ? "desc" : "asc" };
  return { sortBy: column, sortDirection: "asc" };
}

function isSortableColumn(column: string) {
  return ["name", "slug", "code", "status", "createdAt", "updatedAt", "email"].includes(column);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}



