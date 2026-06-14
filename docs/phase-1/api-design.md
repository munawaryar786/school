# API Design

Project: School ERP Management System  
Phase: 1 - System Architecture

## API Style

- REST API built with Express.js and TypeScript.
- JSON request/response body by default.
- Zod validation for request body, params, query, and shared frontend form schemas.
- JWT access token plus refresh/session strategy.
- RBAC middleware on every protected route.
- Tenant context middleware for every school-scoped route.
- Versioned route prefix: `/api/v1`.

## Standard Response Envelope

Successful single-resource response:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_..."
  }
}
```

Successful paginated response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": []
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

## HTTP Status Conventions

| Status | Use |
| --- | --- |
| 200 | Successful read/update/action |
| 201 | Resource created |
| 202 | Async job accepted |
| 204 | Successful delete with no body |
| 400 | Invalid request |
| 401 | Missing/invalid authentication |
| 403 | Authenticated but not authorized |
| 404 | Resource not found or hidden by tenant scope |
| 409 | Conflict or duplicate business rule |
| 422 | Semantic validation failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Authentication Routes

| Method | Route | Purpose | Access |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Authenticate user | Public |
| POST | `/api/v1/auth/logout` | Revoke active session | Authenticated |
| POST | `/api/v1/auth/refresh` | Refresh access token | Refresh token/session |
| GET | `/api/v1/auth/me` | Current user, memberships, permissions | Authenticated |
| POST | `/api/v1/auth/forgot-password` | Start password reset | Public |
| POST | `/api/v1/auth/reset-password` | Complete password reset | Public token |
| POST | `/api/v1/auth/2fa/enroll` | Enroll 2FA method | Authenticated |
| POST | `/api/v1/auth/2fa/verify` | Verify 2FA challenge | Authenticated/challenge |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA | Authenticated |

## Route Structure

| Area | Route Prefix | Scope |
| --- | --- | --- |
| Platform | `/api/v1/platform/*` | Super Admin platform operations |
| School context | `/api/v1/schools/:schoolId/*` | Tenant-scoped operations |
| Current school convenience | `/api/v1/current-school/*` | Active tenant context from header/session |
| Public CMS | `/api/v1/public/:schoolSlug/*` | Public content only |
| Mobile | `/api/v1/mobile/*` | Future mobile APIs |

## Tenant Context

Every school-scoped request must provide one active tenant context using one of:

| Source | Use |
| --- | --- |
| Route param `:schoolId` | Admin and explicit school routes |
| Header `X-School-Id` | Current-school API calls from authenticated users |
| Public domain/subdomain | CMS public pages |

The API must reject requests where:

- `schoolId` is missing for school-scoped resources.
- User is not a member of the school.
- User role lacks the required permission.
- Route `schoolId` conflicts with active session or header context.

## CRUD Pattern

Standard resource routes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/resources` | List with search, filters, sort, pagination |
| POST | `/resources` | Create |
| GET | `/resources/:id` | Read detail |
| PATCH | `/resources/:id` | Update |
| DELETE | `/resources/:id` | Soft delete or delete where allowed |
| POST | `/resources/export` | Start export job |

## Query Conventions

| Query | Example | Use |
| --- | --- | --- |
| `page` | `page=1` | Pagination page |
| `pageSize` | `pageSize=25` | Pagination size |
| `search` | `search=ali` | Full-text or configured fields |
| `sort` | `sort=name:asc` | Sorting |
| `filter[...]` | `filter[status]=active` | Filter fields |
| `from` / `to` | `from=2026-01-01&to=2026-12-31` | Date range |

## File Upload Pattern

| Step | Route | Purpose |
| --- | --- | --- |
| 1 | `POST /api/v1/schools/:schoolId/files/presign` | Request signed upload URL |
| 2 | Client uploads to S3-compatible storage | Direct binary upload |
| 3 | `POST /api/v1/schools/:schoolId/files/complete` | Persist file metadata and attach to resource |

File uploads require:

- Content type allowlist.
- Size limits by category.
- Virus scanning workflow before trusted use.
- Signed download URLs for private files.
- Audit log for sensitive document access.

## Export and Report Pattern

| Step | Route | Purpose |
| --- | --- | --- |
| 1 | `POST /api/v1/schools/:schoolId/reports/:type` | Create report/export job |
| 2 | Worker generates PDF/Excel | Async processing |
| 3 | `GET /api/v1/schools/:schoolId/jobs/:jobId` | Poll status |
| 4 | `GET /api/v1/schools/:schoolId/files/:fileId/download` | Download generated file |

## Error Codes

| Code | Meaning |
| --- | --- |
| `VALIDATION_ERROR` | Request failed schema validation |
| `AUTHENTICATION_REQUIRED` | User must sign in |
| `TOKEN_EXPIRED` | Access token expired |
| `TWO_FACTOR_REQUIRED` | 2FA challenge required |
| `FORBIDDEN` | Missing permission |
| `TENANT_REQUIRED` | Missing school context |
| `TENANT_FORBIDDEN` | User cannot access tenant |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Unique or business conflict |
| `RATE_LIMITED` | Too many requests |
| `EXPORT_FAILED` | Report/export failed |
| `UPLOAD_REJECTED` | File rejected by policy |

## API Security Requirements

- HTTPS only in production.
- JWT access tokens are short-lived.
- Refresh tokens/sessions are revocable and stored securely.
- Passwords use strong one-way hashing.
- Rate limits apply to auth, public CMS, uploads, exports, and sensitive mutations.
- All mutation routes use authorization middleware.
- All school-scoped routes enforce tenant context.
- Request IDs are generated and logged.
- Sensitive fields are redacted from logs.

