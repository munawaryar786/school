# Phase 29 Slice 2 Super Admin Route Matrix

Status labels: `working`, `missing`, `wrong method`, `wrong prefix`, `unauthorized`, `failing`.

Browser routes must call the frontend proxy under `/api/super-admin/*`. The proxy must target backend `/v1/super-admin/*`. Do not introduce backend `/api/v1`.

| UI action | Frontend route/proxy path | Backend target path | Backend route handler | Status before stabilization edits |
| --- | --- | --- | --- | --- |
| Load Super Admin dashboard metrics | `GET /api/super-admin/dashboard` | `GET /v1/super-admin/dashboard` | `router.get("/dashboard")` | working in source; preview can show `Route not found` if backend deployment lacks Slice 2 route |
| List schools | `GET /api/super-admin/schools?page=&pageSize=&search=&status=&sortBy=&sortDirection=` | `GET /v1/super-admin/schools` | `router.get("/schools")` | working |
| View school | `GET /api/super-admin/schools/:id` | `GET /v1/super-admin/schools/:id` | `router.get("/schools/:id")` | working in source; UI currently uses row data instead of fetching detail |
| Create school | `POST /api/super-admin/schools` | `POST /v1/super-admin/schools` | `router.post("/schools")` | working from preview finding |
| Edit school | `PATCH /api/super-admin/schools/:id` | `PATCH /v1/super-admin/schools/:id` | `router.patch("/schools/:id")` | working in source |
| Activate school | `POST /api/super-admin/schools/:id/activate` | `POST /v1/super-admin/schools/:id/activate` | `router.post("/schools/:id/activate")` | working in source; preview can show `Route not found` if backend deployment lacks Slice 2 route |
| Suspend school | `POST /api/super-admin/schools/:id/suspend` | `POST /v1/super-admin/schools/:id/suspend` | `router.post("/schools/:id/suspend")` | working in source; preview can show `Route not found` if backend deployment lacks Slice 2 route |
| Archive school | `DELETE /api/super-admin/schools/:id` | `DELETE /v1/super-admin/schools/:id` | `router.delete("/schools/:id")` | working |
| List campuses | `GET /api/super-admin/campuses?page=&pageSize=&search=&status=&sortBy=&sortDirection=` | `GET /v1/super-admin/campuses` | `router.get("/campuses")` | working in source; preview can show `Route not found` if backend deployment lacks Slice 2 route |
| View campus | `GET /api/super-admin/campuses/:id` | `GET /v1/super-admin/campuses/:id` | `router.get("/campuses/:id")` | working in source |
| Create campus | `POST /api/super-admin/campuses` | `POST /v1/super-admin/campuses` | `router.post("/campuses")` | working in source; requires `Campus` migration/client |
| Edit campus | `PATCH /api/super-admin/campuses/:id` | `PATCH /v1/super-admin/campuses/:id` | `router.patch("/campuses/:id")` | working in source; requires `Campus` migration/client |
| Archive campus | `DELETE /api/super-admin/campuses/:id` | `DELETE /v1/super-admin/campuses/:id` | `router.delete("/campuses/:id")` | working in source; requires `Campus` migration/client |
| List school administrators | `GET /api/super-admin/administrators?page=&pageSize=&search=&status=&sortBy=&sortDirection=` | `GET /v1/super-admin/administrators` | `router.get("/administrators")` | working |
| View school administrator | `GET /api/super-admin/administrators/:id` | `GET /v1/super-admin/administrators/:id` | `router.get("/administrators/:id")` | working in source; UI currently uses row data instead of fetching detail |
| Create school administrator | `POST /api/super-admin/administrators` | `POST /v1/super-admin/administrators` | `router.post("/administrators")` | failing in UI because the form requires a raw `schoolId`; backend route exists |
| Edit school administrator | `PATCH /api/super-admin/administrators/:id` | `PATCH /v1/super-admin/administrators/:id` | `router.patch("/administrators/:id")` | working in source; UI needs school selector and clearer errors |
| Activate school administrator | `POST /api/super-admin/administrators/:id/activate` | `POST /v1/super-admin/administrators/:id/activate` | `router.post("/administrators/:id/activate")` | working in source; preview can show `Route not found` if backend deployment lacks Slice 2 route |
| Suspend school administrator | `DELETE /api/super-admin/administrators/:id` | `DELETE /v1/super-admin/administrators/:id` | `router.delete("/administrators/:id")` | working |
| Export schools | `GET /api/super-admin/schools?format=csv...` | `GET /v1/super-admin/schools?format=csv...` | `router.get("/schools")` | working |
| Export campuses | `GET /api/super-admin/campuses?format=csv...` | `GET /v1/super-admin/campuses?format=csv...` | `router.get("/campuses")` | working in source; requires backend deployment with Slice 2 |
| Export administrators | `GET /api/super-admin/administrators?format=csv...` | `GET /v1/super-admin/administrators?format=csv...` | `router.get("/administrators")` | working |

## Root Cause Summary

The preview `Route not found` messages are caused by frontend calls to Slice 2 Super Admin paths such as `/api/super-admin/dashboard`, `/api/super-admin/campuses`, `/api/super-admin/schools/:id/activate`, and `/api/super-admin/administrators/:id/activate` while the backend deployment serving `/v1/super-admin/*` does not yet have matching handlers or generated Prisma Client support for `Campus`.

Administrator creation has a separate UI workflow failure: the frontend asks the user to type a raw `schoolId`. The backend route exists, validates, checks `administrators.manage`, writes `User` and `SchoolMembership`, and audits, but the UI can easily submit an empty or wrong school id. Stabilization should replace the raw text field with a real school selector backed by `GET /api/super-admin/schools`.

## Stabilization Result

- Frontend route parity is now covered by `apps/web/lib/super-admin-routes.ts` and `apps/web/lib/role-routes.test.ts`.
- Administrator and campus forms now use a real school selector backed by `GET /api/super-admin/schools?page=1&pageSize=100&sortBy=name&sortDirection=asc`.
- Super Admin dashboard, school lifecycle actions, campus routes, and administrator activate/suspend routes have matching frontend proxy paths and backend `/v1/super-admin/*` route declarations in source.
- Preview can still show `Route not found` until the API deployment includes these Slice 2 handlers and Prisma Client is generated after the `Campus` migration.
