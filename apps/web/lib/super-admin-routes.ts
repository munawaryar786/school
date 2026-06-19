export const superAdminBackendRoutes = [
  { method: "GET", path: "/dashboard" },
  { method: "GET", path: "/schools" },
  { method: "GET", path: "/schools/:id" },
  { method: "POST", path: "/schools" },
  { method: "PATCH", path: "/schools/:id" },
  { method: "DELETE", path: "/schools/:id" },
  { method: "POST", path: "/schools/:id/activate" },
  { method: "POST", path: "/schools/:id/suspend" },
  { method: "GET", path: "/campuses" },
  { method: "GET", path: "/campuses/:id" },
  { method: "POST", path: "/campuses" },
  { method: "PATCH", path: "/campuses/:id" },
  { method: "DELETE", path: "/campuses/:id" },
  { method: "GET", path: "/administrators" },
  { method: "GET", path: "/administrators/:id" },
  { method: "POST", path: "/administrators" },
  { method: "PATCH", path: "/administrators/:id" },
  { method: "DELETE", path: "/administrators/:id" },
  { method: "POST", path: "/administrators/:id/activate" }
] as const;

export const superAdminUiRequests = [
  { action: "Load dashboard", method: "GET", proxyPath: "/api/super-admin/dashboard", backendPath: "/v1/super-admin/dashboard" },
  { action: "List schools", method: "GET", proxyPath: "/api/super-admin/schools", backendPath: "/v1/super-admin/schools" },
  { action: "View school", method: "GET", proxyPath: "/api/super-admin/schools/:id", backendPath: "/v1/super-admin/schools/:id" },
  { action: "Create school", method: "POST", proxyPath: "/api/super-admin/schools", backendPath: "/v1/super-admin/schools" },
  { action: "Edit school", method: "PATCH", proxyPath: "/api/super-admin/schools/:id", backendPath: "/v1/super-admin/schools/:id" },
  { action: "Archive school", method: "DELETE", proxyPath: "/api/super-admin/schools/:id", backendPath: "/v1/super-admin/schools/:id" },
  { action: "Activate school", method: "POST", proxyPath: "/api/super-admin/schools/:id/activate", backendPath: "/v1/super-admin/schools/:id/activate" },
  { action: "Suspend school", method: "POST", proxyPath: "/api/super-admin/schools/:id/suspend", backendPath: "/v1/super-admin/schools/:id/suspend" },
  { action: "List campuses", method: "GET", proxyPath: "/api/super-admin/campuses", backendPath: "/v1/super-admin/campuses" },
  { action: "Create campus", method: "POST", proxyPath: "/api/super-admin/campuses", backendPath: "/v1/super-admin/campuses" },
  { action: "Edit campus", method: "PATCH", proxyPath: "/api/super-admin/campuses/:id", backendPath: "/v1/super-admin/campuses/:id" },
  { action: "Archive campus", method: "DELETE", proxyPath: "/api/super-admin/campuses/:id", backendPath: "/v1/super-admin/campuses/:id" },
  { action: "List administrators", method: "GET", proxyPath: "/api/super-admin/administrators", backendPath: "/v1/super-admin/administrators" },
  { action: "Create administrator", method: "POST", proxyPath: "/api/super-admin/administrators", backendPath: "/v1/super-admin/administrators" },
  { action: "Edit administrator", method: "PATCH", proxyPath: "/api/super-admin/administrators/:id", backendPath: "/v1/super-admin/administrators/:id" },
  { action: "Suspend administrator", method: "DELETE", proxyPath: "/api/super-admin/administrators/:id", backendPath: "/v1/super-admin/administrators/:id" },
  { action: "Activate administrator", method: "POST", proxyPath: "/api/super-admin/administrators/:id/activate", backendPath: "/v1/super-admin/administrators/:id/activate" }
] as const;

export function backendRouteKey(method: string, path: string) {
  return `${method.toUpperCase()} ${path}`;
}

export function backendPatternFromTarget(targetPath: string) {
  return targetPath.replace(/^\/v1\/super-admin/, "") || "/";
}
