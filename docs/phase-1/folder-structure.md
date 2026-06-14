# Folder Structure

Project: School ERP Management System  
Phase: 1 - System Architecture

## Monorepo Layout

```text
school-erp/
  apps/
    web/
      app/
      components/
      features/
      lib/
      providers/
      styles/
      tests/
    api/
      src/
        config/
        db/
        modules/
        middleware/
        routes/
        services/
        jobs/
        utils/
        tests/
    worker/
      src/
        jobs/
        processors/
        services/
        tests/
  packages/
    shared/
      src/
        schemas/
        permissions/
        constants/
        types/
        api/
    ui/
      src/
        components/
        data-table/
        forms/
        layout/
        feedback/
    config/
      eslint/
      typescript/
      tailwind/
  prisma/
    schema.prisma
    migrations/
    seed/
  docs/
    phase-0/
    phase-1/
  scripts/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

The final package manager can be confirmed in Phase 2. The architecture assumes workspace support.

## API Module Pattern

Each backend domain module should follow this structure:

```text
apps/api/src/modules/students/
  students.routes.ts
  students.controller.ts
  students.service.ts
  students.repository.ts
  students.schemas.ts
  students.policy.ts
  students.audit.ts
  students.test.ts
```

| File | Responsibility |
| --- | --- |
| `routes` | Express route registration and middleware composition |
| `controller` | HTTP request/response translation |
| `service` | Business rules and transactions |
| `repository` | Prisma data access only |
| `schemas` | Zod validation schemas |
| `policy` | Permission and tenant-specific authorization |
| `audit` | Audit event construction |
| `test` | Module tests |

## Web Feature Pattern

Each frontend feature should follow this structure:

```text
apps/web/features/students/
  api/
    students.client.ts
    students.keys.ts
  components/
    student-form.tsx
    student-table.tsx
    student-status-badge.tsx
  hooks/
    use-students.ts
  pages/
    student-detail-view.tsx
    students-list-view.tsx
  schemas/
    student-form.schema.ts
  types.ts
```

| Folder | Responsibility |
| --- | --- |
| `api` | TanStack Query clients and query keys |
| `components` | Feature-specific presentational components |
| `hooks` | Data and workflow hooks |
| `pages` | Route-level feature views |
| `schemas` | React Hook Form/Zod schemas |
| `types` | Feature-specific TypeScript types |

## Next.js App Router Pattern

```text
apps/web/app/
  (public)/
    login/
    forgot-password/
  (protected)/
    layout.tsx
    super-admin/
    school-admin/
    teacher/
    student/
    parent/
  api-health/
  globals.css
  layout.tsx
```

Protected route groups must use auth and role-aware layout guards.

## Shared Package Responsibilities

| Package Area | Contents |
| --- | --- |
| `schemas` | Shared Zod request/response/form schemas |
| `permissions` | Permission keys and role defaults |
| `constants` | Role names, color tokens, status enums |
| `types` | Shared TypeScript DTOs |
| `api` | Response envelope and pagination types |

## UI Package Responsibilities

| Component Area | Contents |
| --- | --- |
| `layout` | App shell, sidebar, top bar, breadcrumbs |
| `data-table` | Search, filter, pagination, column actions, export trigger |
| `forms` | Form sections, field wrappers, validation summary |
| `feedback` | Loading, empty, error, success, toast patterns |
| `components` | Product-specific components built on Shadcn UI |

## Naming Conventions

| Item | Convention |
| --- | --- |
| Files | kebab-case |
| React components | PascalCase exports from kebab-case files |
| Permission keys | `domain.action` such as `students.create` |
| API routes | Plural nouns such as `/students` |
| Database models | Singular PascalCase Prisma models |
| Enum values | Upper snake case |

