export type CountRow = { label: string; count: number | null | undefined };
export type StatusRow = { status: string; count: number | null | undefined; amount?: number | null | undefined };
export type ActivityRow = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: string;
};

export type SchoolAdminDashboardData = {
  school?: { id: string; name: string; slug?: string | null; status?: string | null } | null;
  metrics?: Partial<Record<"campuses" | "teachers" | "students" | "parents" | "classes" | "sections" | "subjects" | "admissions" | "attendance" | "libraryBooks" | "fees" | "exams" | "timetable" | "lmsProgress", number | null | undefined>> | null;
  studentsByClass?: CountRow[] | null;
  admissionsByStatus?: StatusRow[] | null;
  attendanceByStatus?: StatusRow[] | null;
  feeStatusSummary?: StatusRow[] | null;
  examStatusSummary?: StatusRow[] | null;
  libraryStatusSummary?: StatusRow[] | null;
  lmsProgressSummary?: StatusRow[] | null;
  recentActivity?: ActivityRow[] | null;
  lastUpdatedAt?: string | null;
};

const metricDefaults = {
  campuses: 0,
  teachers: 0,
  students: 0,
  parents: 0,
  classes: 0,
  sections: 0,
  subjects: 0,
  admissions: 0,
  attendance: 0,
  libraryBooks: 0,
  fees: 0,
  exams: 0,
  timetable: 0,
  lmsProgress: 0
};

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeSchoolAdminDashboard(data: SchoolAdminDashboardData | null | undefined) {
  const inputMetrics = data?.metrics ?? {};
  const metrics = Object.fromEntries(
    Object.entries(metricDefaults).map(([key, fallback]) => {
      const value = inputMetrics[key as keyof typeof metricDefaults];
      return [key, safeNumber(value) || fallback];
    })
  ) as typeof metricDefaults;

  const normalizeCountRows = (rows: CountRow[] | null | undefined) => ensureArray(rows).map((item) => ({ label: item.label, count: safeNumber(item.count) }));
  const normalizeStatusRows = (rows: StatusRow[] | null | undefined) => ensureArray(rows).map((item) => ({ status: item.status, count: safeNumber(item.count), amount: safeNumber(item.amount) }));

  return {
    school: data?.school ?? null,
    metrics,
    studentsByClass: normalizeCountRows(data?.studentsByClass),
    admissionsByStatus: normalizeStatusRows(data?.admissionsByStatus),
    attendanceByStatus: normalizeStatusRows(data?.attendanceByStatus),
    feeStatusSummary: normalizeStatusRows(data?.feeStatusSummary),
    examStatusSummary: normalizeStatusRows(data?.examStatusSummary),
    libraryStatusSummary: normalizeStatusRows(data?.libraryStatusSummary),
    lmsProgressSummary: normalizeStatusRows(data?.lmsProgressSummary),
    recentActivity: ensureArray(data?.recentActivity),
    lastUpdatedAt: data?.lastUpdatedAt ?? null
  };
}

