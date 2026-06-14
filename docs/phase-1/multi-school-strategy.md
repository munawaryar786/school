# Multi-School Strategy

Project: School ERP Management System  
Phase: 1 - System Architecture

## Tenancy Decision

The baseline strategy is a shared PostgreSQL database with row-level tenant isolation through `schoolId`.

This approach supports the phased SaaS build without creating operational complexity too early, while still allowing future enterprise isolation if needed.

## Tenant Types

| Tenant Type | Description |
| --- | --- |
| Platform | Global context for Super Admin, subscriptions, system settings, school provisioning |
| School | Standard tenant context for all school-owned data |
| Public school site | Public CMS context resolved by slug, domain, or subdomain |

## Tenant Resolution

| Request Type | Tenant Source |
| --- | --- |
| Super Admin platform route | No school tenant required unless operating on a selected school |
| School portal route | Active school membership in session plus `X-School-Id` or route param |
| API route with `:schoolId` | Route param validated against membership/permission |
| Public CMS page | Domain, subdomain, or school slug |
| Mobile API | Active school context selected by authenticated user |

## User Membership Model

A user can belong to multiple schools with different roles.

Example:

| User | School | Role |
| --- | --- | --- |
| `user_1` | School A | Teacher |
| `user_1` | School B | Parent |
| `user_2` | Platform | Super Admin |

Each authenticated request must resolve exactly one active context:

| Context Field | Purpose |
| --- | --- |
| `userId` | Authenticated identity |
| `schoolId` | Active tenant for school-scoped requests |
| `membershipId` | Active role/membership |
| `role` | Active role in the tenant |
| `permissions` | Effective permission keys |

## Data Isolation Rules

| Rule | Requirement |
| --- | --- |
| School-owned data | Must include `schoolId`. |
| Platform data | Must omit `schoolId` or explicitly allow null only for global records. |
| Queries | Must include tenant scoping in repository/service layer. |
| Mutations | Must validate tenant ownership before writing. |
| Joins | Must ensure joined records share the same `schoolId`. |
| Exports | Must include tenant scope and audit log. |
| Files | Object keys must include school scope, such as `schools/{schoolId}/documents/{fileId}`. |
| Public CMS | Only published public records are accessible without auth. |

## Database Constraints

| Constraint Type | Requirement |
| --- | --- |
| Foreign keys | School-scoped child records reference their parent school-owned records. |
| Unique keys | Business uniqueness includes `schoolId`, such as `(schoolId, admissionNumber)`. |
| Indexes | `schoolId` included in indexes for list, filter, and report queries. |
| Soft delete | Unique indexes must account for `deletedAt` where supported. |

## API Enforcement

Tenant checks happen in layers:

1. Authentication middleware validates user/session.
2. Tenant middleware resolves active school context.
3. RBAC middleware checks permission.
4. Policy layer checks resource ownership and assigned/child/own scope.
5. Repository queries include `schoolId`.

## Super Admin Access

Super Admin can:

- Create and manage schools.
- Manage subscriptions.
- View platform-wide reports.
- Access tenant data only through explicit platform routes.
- Perform backup/restore operations.

Super Admin actions must:

- Produce audit logs.
- Require clear target school context when operating on school data.
- Avoid silent cross-school reads in school portal routes.

## Public Website CMS Tenancy

Public CMS content resolves school context by:

| Strategy | Use |
| --- | --- |
| Custom domain | Production school websites |
| Subdomain | SaaS-managed school websites |
| Slug path | Development and fallback |

Only records with public status can be loaded without authentication.

## Future Enterprise Isolation Option

If a school later requires stronger isolation, the architecture can support:

- Dedicated database per enterprise school.
- Dedicated schema per enterprise school.
- Separate storage bucket per enterprise school.

This is not the Phase 2 baseline because it would slow initial delivery and complicate migrations, reporting, and operations.

