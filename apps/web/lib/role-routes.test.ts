import assert from "node:assert/strict";
import { ROLE_THEME, ROLES } from "@school-erp/shared";
import { backendModuleUrl, backendUrl } from "./api-routing.ts";
import { homePathForRole, roleHomePath } from "./role-routes.ts";
import { canAccessRoute, findProtectedPrefix, protectedPrefixes, routeAccess } from "./route-policy.ts";
import { administratorSchema } from "@school-erp/shared";
import { backendPatternFromTarget, backendRouteKey, superAdminBackendRoutes, superAdminUiRequests } from "./super-admin-routes.ts";

assert.equal(homePathForRole(ROLES.FINANCE_OFFICER), "/finance");
assert.equal(homePathForRole(ROLES.LIBRARIAN), "/library");
assert.equal(homePathForRole(ROLES.HR_OFFICER), "/hr");

assert.deepEqual(new Set(Object.keys(roleHomePath)), new Set(Object.values(ROLES)));
assert.equal(ROLE_THEME[ROLES.SUPER_ADMIN].accent, "violet");
assert.equal(ROLE_THEME[ROLES.PARENT].accent, "rose");
assert.equal(ROLE_THEME[ROLES.FINANCE_OFFICER].className, "theme-finance");
assert.equal(ROLE_THEME[ROLES.FINANCE_OFFICER].accent, "amber");
assert.equal(ROLE_THEME[ROLES.LIBRARIAN].className, "theme-library");
assert.equal(ROLE_THEME[ROLES.HR_OFFICER].className, "theme-hr");
assert.equal(ROLE_THEME[ROLES.HR_OFFICER].accent, "warm-neutral");

assert.equal(findProtectedPrefix("/finance/invoices"), "/finance");
assert.equal(findProtectedPrefix("/not-protected"), null);

assert.equal(canAccessRoute(ROLES.FINANCE_OFFICER, "/finance"), true);
assert.equal(canAccessRoute(ROLES.FINANCE_OFFICER, "/advanced-finance"), true);
assert.equal(canAccessRoute(ROLES.FINANCE_OFFICER, "/super-admin"), false);
assert.equal(canAccessRoute(ROLES.HR_OFFICER, "/hr"), true);
assert.equal(canAccessRoute(ROLES.LIBRARIAN, "/library"), true);
assert.equal(canAccessRoute(ROLES.STUDENT, "/parent"), false);

assert.deepEqual(protectedPrefixes, Object.keys(routeAccess));
for (const [path, roles] of Object.entries(routeAccess)) {
  assert.ok(path.startsWith("/"));
  assert.ok(roles.length > 0);
}

assert.equal(backendUrl("/health"), "http://localhost:4000/health");
assert.equal(backendUrl("health"), "http://localhost:4000/health");
assert.equal(backendModuleUrl("school-admin", ["dashboard"]), "http://localhost:4000/v1/school-admin/dashboard");
assert.equal(backendModuleUrl("finance", ["invoices"], "?page=1"), "http://localhost:4000/v1/finance/invoices?page=1");
assert.equal(backendModuleUrl("super-admin", ["schools", "school_1"]), "http://localhost:4000/v1/super-admin/schools/school_1");

assert.equal(backendModuleUrl("super-admin", ["dashboard"]), "http://localhost:4000/v1/super-admin/dashboard");
assert.equal(backendModuleUrl("super-admin", ["administrators"], "?page=1"), "http://localhost:4000/v1/super-admin/administrators?page=1");
assert.equal(backendModuleUrl("super-admin", ["administrators", "membership_1", "activate"]), "http://localhost:4000/v1/super-admin/administrators/membership_1/activate");

const adminPayload = administratorSchema.parse({
  schoolId: "school_1",
  name: "School Owner",
  email: "owner@school.edu",
  password: "Password123!",
  status: "ACTIVE"
});
assert.equal(adminPayload.schoolId, "school_1");
assert.equal(adminPayload.status, "ACTIVE");
assert.equal(administratorSchema.safeParse({ schoolId: "", name: "A", email: "bad" }).success, false);

const backendRoutes = new Set(superAdminBackendRoutes.map((route) => backendRouteKey(route.method, route.path)));
for (const request of superAdminUiRequests) {
  assert.ok(request.proxyPath.startsWith("/api/super-admin/"), `${request.action} must use the frontend proxy`);
  assert.ok(request.backendPath.startsWith("/v1/super-admin/"), `${request.action} must target backend /v1`);
  const backendPattern = backendPatternFromTarget(request.backendPath);
  assert.ok(backendRoutes.has(backendRouteKey(request.method, backendPattern)), `${request.action} points to missing backend route ${request.method} ${backendPattern}`);
}
