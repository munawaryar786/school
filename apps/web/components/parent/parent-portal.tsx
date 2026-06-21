"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, CalendarCheck, CheckCircle2, Clock3, FileText, GraduationCap, Library, MessageSquareText, RefreshCw, Send, Users, WalletCards } from "lucide-react";
import { formatNumber } from "../../lib/super-admin-dashboard";

type ApiOne<T> = { success: true; data: T };
type IconType = React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;

type Child = {
  id: string;
  admissionNumber?: string | null;
  name: string;
  className?: string | null;
  status?: string | null;
};

type ChildSummary = {
  child?: Child | null;
  attendance?: { total?: number | null; present?: number | null; attendanceRate?: number | null } | null;
  results?: { total?: number | null; averageScore?: number | null } | null;
  homework?: { open?: number | null } | null;
  fees?: { pending?: number | null; paidPayments?: number | null } | null;
  messages?: { total?: number | null } | null;
  leaveRequests?: { total?: number | null; pending?: number | null; latest?: LeaveRequest | null } | null;
  library?: { available?: boolean; message?: string | null } | null;
};

type LeaveRequest = {
  id: string;
  studentId: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
  parentNote?: string | null;
  reviewerComment?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  timeline?: Array<{ id: string; action: string; note?: string | null; createdAt: string; actor?: { name?: string | null; email?: string | null } | null }> | null;
};

type LeaveForm = {
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  parentNote: string;
};

const leaveTypes = [
  ["FULL_DAY", "Full-day leave"],
  ["MULTI_DAY", "Multi-day leave"],
  ["HALF_DAY", "Half-day leave"],
  ["LATE_ARRIVAL", "Late arrival"],
  ["EARLY_PICKUP", "Early pickup"],
  ["MEDICAL_APPOINTMENT", "Medical appointment"],
  ["EMERGENCY", "Emergency leave"],
  ["FAMILY", "Family leave"],
  ["OTHER", "Other"]
] as const;

const emptyForm: LeaveForm = {
  type: "FULL_DAY",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  reason: "",
  parentNote: ""
};

export function ParentPortal() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ChildSummary | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState<LeaveForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<Child[]>("children")
      .then((rows) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        setChildren(safeRows);
        setSelectedChildId((current) => current ?? safeRows[0]?.id ?? null);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Parent dashboard could not load."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedChildId) {
      setSummary(null);
      setLeaveRequests([]);
      return;
    }
    setChildLoading(true);
    setError(null);
    Promise.all([
      api<ChildSummary>(`children/${selectedChildId}/summary`),
      api<LeaveRequest[]>(`children/${selectedChildId}/leave-requests`)
    ])
      .then(([nextSummary, nextRequests]) => {
        setSummary(nextSummary ?? null);
        setLeaveRequests(Array.isArray(nextRequests) ? nextRequests : []);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Child dashboard could not load."))
      .finally(() => setChildLoading(false));
  }, [selectedChildId, refreshKey]);

  const selectedChild = children.find((child) => child.id === selectedChildId) ?? null;
  const attentionItems = useMemo(() => buildAttentionItems(summary, leaveRequests), [summary, leaveRequests]);
  const summaryCards = buildSummaryCards(summary, leaveRequests.length);

  async function submitLeaveRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChildId) return;
    setSubmitting(true);
    setFormMessage(null);
    try {
      await api<LeaveRequest>(`children/${selectedChildId}/leave-requests`, {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.startTime || null,
          endTime: form.endTime || null,
          reason: form.reason,
          parentNote: form.parentNote || null
        })
      });
      setForm(emptyForm);
      setFormMessage({ tone: "success", text: "Leave request submitted for school review." });
      setRefreshKey((value) => value + 1);
    } catch (caught) {
      setFormMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Leave request could not be submitted." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="theme-parent space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Parent / Guardian</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Parent Engagement Hub</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Linked-child attendance, homework, fees, results, teacher communication, and leave requests from real school data.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => setRefreshKey((value) => value + 1)} type="button">
          <RefreshCw aria-hidden={true} size={16} />
          Refresh
        </button>
      </header>

      {loading ? <StatePanel text="Loading parent engagement hub" /> : error ? <StatePanel text={error} tone="error" onRetry={() => setRefreshKey((value) => value + 1)} /> : children.length === 0 ? <StatePanel text="No child profile is linked to your account. Contact school administration." /> : (
        <>
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <LinkedChildren children={children} selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
            <AttentionCard items={attentionItems} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Selected child</p>
                <h2 className="mt-1 text-xl font-semibold">{selectedChild?.name ?? "Linked child"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{[selectedChild?.className, selectedChild?.admissionNumber].filter(Boolean).join(" - ") || "Profile details will appear when available."}</p>
              </div>
              {childLoading ? <span className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Loading child data</span> : null}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => <SummaryCard key={card.label} {...card} />)}
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <LeaveRequestForm form={form} setForm={setForm} submitting={submitting} message={formMessage} onSubmit={submitLeaveRequest} />
            <LeaveRequestList requests={leaveRequests} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <Library aria-hidden={true} className="text-primary" size={18} />
              <h2 className="text-base font-semibold">Library / Reading</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary?.library?.message ?? "Library reading data is not configured yet."}</p>
          </section>
        </>
      )}
    </div>
  );
}

function LinkedChildren({ children, selectedChildId, onSelect }: { children: Child[]; selectedChildId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Linked Children</h2>
      <div className="mt-4 grid gap-3">
        {children.map((child) => {
          const active = child.id === selectedChildId;
          return (
            <button key={child.id} className={`rounded-md border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`} onClick={() => onSelect(child.id)} type="button">
              <p className="font-semibold">{child.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{[child.className, child.admissionNumber].filter(Boolean).join(" - ") || "Linked child profile"}</p>
              <span className="mt-2 inline-flex rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground">{child.status ?? "ACTIVE"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AttentionCard({ items }: { items: Array<{ label: string; detail: string; icon: IconType; tone?: "warning" | "success" }> }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">What Needs My Attention?</h2>
      {items.length === 0 ? <StatePanel text="No urgent parent actions right now." compact /> : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={`${item.label}-${item.detail}`} className="flex gap-3 rounded-md border border-border bg-background p-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${item.tone === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}><Icon aria-hidden={true} size={17} /></span>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: IconType }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden={true} size={18} /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function LeaveRequestForm({ form, setForm, submitting, message, onSubmit }: { form: LeaveForm; setForm: React.Dispatch<React.SetStateAction<LeaveForm>>; submitting: boolean; message: { tone: "success" | "error"; text: string } | null; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const update = (key: keyof LeaveForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Leave / Half-Day Request</h2>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm font-medium">
          Request type
          <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={form.type} onChange={(event) => update("type", event.target.value)}>
            {leaveTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">Start date<input className="h-10 rounded-md border border-border bg-background px-3 text-sm" required type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-medium">End date<input className="h-10 rounded-md border border-border bg-background px-3 text-sm" required type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-medium">Start time<input className="h-10 rounded-md border border-border bg-background px-3 text-sm" type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-medium">End time<input className="h-10 rounded-md border border-border bg-background px-3 text-sm" type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} /></label>
        </div>
        <label className="grid gap-1 text-sm font-medium">Reason<textarea className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm" required value={form.reason} onChange={(event) => update("reason", event.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Optional note<textarea className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.parentNote} onChange={(event) => update("parentNote", event.target.value)} /></label>
        {message ? <div className={`rounded-md border p-3 text-sm ${message.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>{message.text}</div> : null}
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={submitting} type="submit">
          <Send aria-hidden={true} size={16} />
          {submitting ? "Submitting" : "Submit request"}
        </button>
      </form>
    </section>
  );
}

function LeaveRequestList({ requests }: { requests: LeaveRequest[] }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <h2 className="text-base font-semibold">Leave Request Timeline</h2>
      {requests.length === 0 ? <StatePanel text="No leave requests have been submitted for this child." compact /> : (
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{humanize(request.type)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(request.startDate)} to {formatDate(request.endDate)}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-3 text-sm leading-6">{request.reason}</p>
              {request.reviewerComment ? <p className="mt-2 rounded-md border border-border bg-surface p-2 text-sm text-muted-foreground">Reviewer: {request.reviewerComment}</p> : null}
              <div className="mt-3 space-y-2 border-l border-border pl-3">
                {(request.timeline ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Submitted {formatDateTime(request.createdAt)}</p> : request.timeline?.map((event) => (
                  <div key={event.id} className="text-sm">
                    <p className="font-medium">{humanize(event.action)}</p>
                    <p className="text-muted-foreground">{formatDateTime(event.createdAt)}{event.actor?.name ? ` by ${event.actor.name}` : ""}</p>
                    {event.note ? <p className="text-muted-foreground">{event.note}</p> : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "APPROVED" ? "border-success/30 bg-success/10 text-success" : status === "REJECTED" ? "border-error/30 bg-error/10 text-error" : "border-warning/30 bg-warning/10 text-warning";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${className}`}>{humanize(status)}</span>;
}

function StatePanel({ text, tone, compact, onRetry }: { text: string; tone?: "error"; compact?: boolean; onRetry?: () => void }) {
  return (
    <div className={`rounded-lg border ${tone === "error" ? "border-error/30 bg-error/10 text-error" : "border-border bg-background text-muted-foreground"} ${compact ? "mt-4 p-4" : "p-6"} text-sm`} role={tone === "error" ? "alert" : undefined}>
      {text}
      {onRetry ? <button className="ml-3 rounded-md border border-border bg-surface px-3 py-1 font-medium" onClick={onRetry} type="button">Retry</button> : null}
    </div>
  );
}

function buildSummaryCards(summary: ChildSummary | null, leaveCount: number) {
  return [
    { label: "Attendance", value: summary?.attendance?.attendanceRate == null ? "No data" : `${formatNumber(summary.attendance.attendanceRate)}%`, detail: `${formatNumber(summary?.attendance?.present)} present of ${formatNumber(summary?.attendance?.total)} records`, icon: CalendarCheck },
    { label: "Leave Requests", value: formatNumber(leaveCount), detail: `${formatNumber(summary?.leaveRequests?.pending)} pending review`, icon: Clock3 },
    { label: "Homework", value: formatNumber(summary?.homework?.open), detail: "Published assignments for this child class", icon: FileText },
    { label: "Exam Results", value: formatNumber(summary?.results?.total), detail: summary?.results?.averageScore == null ? "No published score summary" : `${formatNumber(summary.results.averageScore)}% average score`, icon: GraduationCap },
    { label: "Fees", value: formatNumber(summary?.fees?.pending), detail: `${formatNumber(summary?.fees?.paidPayments)} paid payment records`, icon: WalletCards },
    { label: "Notices", value: formatNumber(summary?.messages?.total), detail: "Teacher and parent portal communication records", icon: MessageSquareText },
    { label: "Teacher Messages", value: formatNumber(summary?.messages?.total), detail: "Messages scoped to this child and parent", icon: MessageSquareText },
    { label: "Library / Reading", value: summary?.library?.available ? "Ready" : "Setup", detail: summary?.library?.message ?? "Library reading data is not configured yet.", icon: Library }
  ];
}

function buildAttentionItems(summary: ChildSummary | null, requests: LeaveRequest[]) {
  const items: Array<{ label: string; detail: string; icon: IconType; tone?: "warning" | "success" }> = [];
  const pendingLeave = requests.find((request) => ["SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUESTED"].includes(request.status));
  if (pendingLeave) items.push({ label: "Pending leave request", detail: `${humanize(pendingLeave.type)} is ${humanize(pendingLeave.status).toLowerCase()}.`, icon: Clock3 });
  if (safeNumber(summary?.fees?.pending) > 0) items.push({ label: "Fee records need review", detail: `${formatNumber(summary?.fees?.pending)} pending or overdue fee records are visible.`, icon: WalletCards });
  if (safeNumber(summary?.homework?.open) > 0) items.push({ label: "Homework available", detail: `${formatNumber(summary?.homework?.open)} published homework records are visible.`, icon: FileText });
  if (safeNumber(summary?.results?.total) > 0) items.push({ label: "Results available", detail: `${formatNumber(summary?.results?.total)} result records are visible.`, icon: GraduationCap, tone: "success" });
  if (safeNumber(summary?.messages?.total) > 0) items.push({ label: "Teacher messages/notices", detail: `${formatNumber(summary?.messages?.total)} communication records are visible.`, icon: MessageSquareText });
  return items;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/parent/${path}`, { headers: { "content-type": "application/json" }, ...init });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? "Request failed.");
  return (payload as ApiOne<T>).data;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
