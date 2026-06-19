export type SuperAdminMetricKey =
  | "totalSchools"
  | "activeSchools"
  | "suspendedSchools"
  | "archivedSchools"
  | "totalCampuses"
  | "totalAdministrators"
  | "activeAdministrators"
  | "suspendedAdministrators"
  | "totalUsers"
  | "totalStudents"
  | "totalStaff";

export type SuperAdminMetricMap = Record<SuperAdminMetricKey, number>;

export type SuperAdminDashboardActivity = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  schoolName: string | null;
  createdAt: string;
};

export type SuperAdminChartRow = {
  status?: string;
  role?: string;
  count: number | null | undefined;
};

export type SuperAdminDashboardData = {
  metrics?: Partial<Record<SuperAdminMetricKey, number | null | undefined>> | null;
  schoolsByStatus?: Array<{ status: string; count: number | null | undefined }> | null;
  usersByRole?: Array<{ role: string; count: number | null | undefined }> | null;
  recentAdministratorActivity?: SuperAdminDashboardActivity[] | null;
  lastUpdatedAt?: string | null;
};

const metricDefaults: SuperAdminMetricMap = {
  totalSchools: 0,
  activeSchools: 0,
  suspendedSchools: 0,
  archivedSchools: 0,
  totalCampuses: 0,
  totalAdministrators: 0,
  activeAdministrators: 0,
  suspendedAdministrators: 0,
  totalUsers: 0,
  totalStudents: 0,
  totalStaff: 0
};

export function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "0";
}

export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeDashboardData(data: SuperAdminDashboardData | null | undefined): {
  metrics: SuperAdminMetricMap;
  schoolsByStatus: Array<{ status: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  recentAdministratorActivity: SuperAdminDashboardActivity[];
  lastUpdatedAt: string | null;
} {
  const inputMetrics = data?.metrics ?? {};
  const metrics = Object.fromEntries(
    Object.entries(metricDefaults).map(([key, fallback]) => {
      const value = inputMetrics[key as SuperAdminMetricKey];
      return [key, typeof value === "number" && Number.isFinite(value) ? value : fallback];
    })
  ) as SuperAdminMetricMap;

  return {
    metrics,
    schoolsByStatus: ensureArray(data?.schoolsByStatus).map((item) => ({
      status: item.status,
      count: typeof item.count === "number" && Number.isFinite(item.count) ? item.count : 0
    })),
    usersByRole: ensureArray(data?.usersByRole).map((item) => ({
      role: item.role,
      count: typeof item.count === "number" && Number.isFinite(item.count) ? item.count : 0
    })),
    recentAdministratorActivity: ensureArray(data?.recentAdministratorActivity),
    lastUpdatedAt: data?.lastUpdatedAt ?? null
  };
}
