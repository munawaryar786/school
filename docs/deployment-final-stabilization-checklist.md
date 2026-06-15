# Deployment Final Stabilization Checklist

Status values: Pending, In Progress, Completed, Failed.

## Phase 27 Control Items

| Status | Task |
| --- | --- |
| In Progress | Create this checklist before modifying source, package, Prisma, Vercel, environment, or runtime files. |
| Pending | Do not stop after the first visible error. |
| Pending | Audit and permanently fix all build-time, module-resolution, workspace-package, Prisma, Vercel serverless, environment-variable, database, and runtime issues in one complete pass. |
| Pending | Do not ask for approval after each individual fix. |
| Pending | Do not declare completion until every required validation and runtime test that can be executed has been executed and recorded. |
| Pending | Stop and wait for final approval after Phase 27 is complete. |
| Pending | Do not start another feature phase. |

## Objective Checklist

| Status | Task |
| --- | --- |
| Pending | Make the monorepo installable from a clean clone. |
| Pending | Make the monorepo buildable with npm workspaces. |
| Pending | Verify Node.js 22 compatibility. |
| Pending | Verify Vercel Linux compatibility. |
| Pending | Verify Vercel serverless runtime compatibility. |
| Pending | Verify Neon PostgreSQL compatibility. |
| Pending | Remove or confirm absence of Windows-only dependencies. |
| Pending | Remove or confirm absence of runtime imports pointing to TypeScript source files. |
| Pending | Fix or confirm absence of broken workspace package entries. |
| Pending | Prepare frontend-to-backend communication. |
| Pending | Prepare client demo deployment readiness. |
| Pending | Preserve business features. |
| Pending | Preserve existing UI design. |
| Pending | Preserve functional modules. |
| Pending | Do not replace the existing project. |
| Pending | Do not create a new project. |

## Task 1 - Complete Repository Audit

| Status | Task |
| --- | --- |
| Pending | Inspect root package.json. |
| Pending | Inspect package-lock.json. |
| Pending | Inspect apps/api/package.json. |
| Pending | Inspect apps/api/tsconfig.json. |
| Pending | Inspect apps/api/src/server.ts. |
| Pending | Inspect apps/api/src/app.ts. |
| Pending | Inspect all API imports. |
| Pending | Inspect apps/web/package.json. |
| Pending | Inspect apps/web Next.js config files. |
| Pending | Inspect packages/shared/package.json. |
| Pending | Inspect packages/shared/tsconfig.json. |
| Pending | Inspect packages/shared/src. |
| Pending | Inspect packages/ui/package.json. |
| Pending | Inspect packages/ui/tsconfig.json. |
| Pending | Inspect packages/ui/src. |
| Pending | Inspect prisma/schema.prisma. |
| Pending | Inspect prisma/migrations. |
| Pending | Inspect Prisma seed files. |
| Pending | Inspect .env.example. |
| Pending | Inspect .env.production.example. |
| Pending | Inspect .gitignore. |
| Pending | Inspect all Vercel-related configuration files. |
| Pending | Search repository for embedded-postgres. |
| Pending | Search repository for @embedded-postgres. |
| Pending | Search repository for windows-x64. |
| Pending | Search repository for src/index.ts inside package main or exports. |
| Pending | Search repository for file: workspace dependencies. |
| Pending | Search repository for "type": "module". |
| Pending | Search repository for "type": "commonjs". |
| Pending | Search repository for moduleResolution. |
| Pending | Search repository for ESNext. |
| Pending | Search repository for NodeNext. |
| Pending | Search repository for CommonJS. |
| Pending | Search repository for module.exports. |
| Pending | Search repository for export default. |
| Pending | Search repository for DATABASE_URL. |
| Pending | Search repository for DIRECT_URL. |
| Pending | Search repository for NEXT_PUBLIC_API_URL. |
| Pending | Search repository for WEB_ORIGIN. |
| Pending | Search repository for PrismaClientKnownRequestError. |
| Pending | Search repository for @school-erp/shared. |
| Pending | Search repository for @school-erp/ui. |
| Pending | Identify configuration conflicts before changing source/config code. |

## Task 2 - Standardize Node And Module Architecture

| Status | Task |
| --- | --- |
| Pending | Use Node.js 22-compatible configuration. |
| Pending | Choose one Vercel-safe API module strategy. |
| Pending | Make apps/api/package.json consistent with the chosen module strategy. |
| Pending | Make apps/api/tsconfig.json consistent with the chosen module strategy. |
| Pending | Make apps/api/src/server.ts consistent with the chosen module strategy. |
| Pending | Make apps/api/src/app.ts consistent with the chosen module strategy. |
| Pending | Make all API internal imports consistent with the chosen module strategy. |
| Pending | Make workspace package imports consistent with the chosen module strategy. |
| Pending | If CommonJS is selected, ensure package type is commonjs or omitted appropriately. |
| Pending | If CommonJS is selected, ensure TypeScript module output is CommonJS. |
| Pending | If CommonJS is selected, ensure module resolution is compatible. |
| Pending | If CommonJS is selected, ensure Express app is exported in a Vercel-compatible way. |
| Pending | If CommonJS is selected, ensure extensionless local imports work at runtime. |
| Pending | If ESM is selected, ensure every relative runtime import uses valid .js extensions. |
| Pending | If ESM is selected, ensure all package exports are ESM-compatible. |
| Pending | If ESM is selected, ensure no extensionless runtime imports remain. |
| Pending | Do not leave a partially converted module system. |

## Task 3 - Fix All Workspace Packages

| Status | Task |
| --- | --- |
| Pending | Audit @school-erp/shared runtime package entries. |
| Pending | Audit @school-erp/ui runtime package entries. |
| Pending | Ensure no runtime package entry points to src/index.ts. |
| Pending | Ensure no runtime package entry points to any TypeScript source file. |
| Pending | Ensure no runtime package entry points to a missing file. |
| Pending | Create real build output for every runtime workspace package. |
| Pending | Compile workspace TypeScript to JavaScript. |
| Pending | Generate workspace declaration files. |
| Pending | Set valid workspace package main fields. |
| Pending | Set valid workspace package types fields. |
| Pending | Set valid workspace package exports fields. |
| Pending | Ensure dist files exist before API or web build. |
| Pending | Ensure workspace packages work on Linux and Windows. |
| Pending | Ensure Vercel includes workspace package output. |
| Pending | Ensure workspace package noEmit is false for compilation. |

## Task 4 - Fix Monorepo Build Order

| Status | Task |
| --- | --- |
| Pending | Implement deterministic root build order: internal shared packages first. |
| Pending | Implement deterministic root build order: Prisma Client generation second. |
| Pending | Implement deterministic root build order: API typecheck/build third. |
| Pending | Implement deterministic root build order: web production build fourth. |
| Pending | Ensure npm run build works from repository root. |
| Pending | Ensure root build does not rely on previously generated local files. |
| Pending | Ensure npm run build --workspace @school-erp/shared works. |
| Pending | Ensure npm run build --workspace @school-erp/ui works. |
| Pending | Ensure npm run build --workspace @school-erp/api works. |
| Pending | Ensure npm run build --workspace @school-erp/web works. |
| Pending | Ensure no recursive build loops exist between root and workspace scripts. |

## Task 5 - Prisma And Neon Stabilization

| Status | Task |
| --- | --- |
| Pending | Ensure Prisma CLI and @prisma/client versions are compatible. |
| Pending | Ensure Prisma Client is generated during clean deployment. |
| Pending | Ensure generated Prisma files do not need to be committed. |
| Pending | Ensure API build does not run before Prisma Client generation. |
| Pending | Ensure Prisma schema loads from the correct monorepo path. |
| Pending | Ensure Vercel build can access prisma/schema.prisma. |
| Pending | Ensure Prisma model, enum, and namespace types are available during TypeScript build. |
| Pending | Document local migration connection as Neon owner role direct/non-pooled URL without -pooler hostname. |
| Pending | Document Vercel runtime connection as Neon owner role pooled URL with -pooler hostname. |
| Pending | Do not hardcode database credentials. |
| Pending | Do not commit real secrets. |
| Pending | If schema does not use directUrl, do not require DIRECT_URL. |
| Pending | Validate npm run prisma:generate. |
| Pending | Validate npm run prisma:migrate without destructive production migration behavior. |
| Pending | Validate npm run prisma:seed without committing secrets. |
| Pending | Do not run destructive development migrations against production. |

## Task 6 - Vercel Express Serverless Compatibility

| Status | Task |
| --- | --- |
| Pending | Audit the API entrypoint completely. |
| Pending | Ensure Express app is exported as a serverless-compatible handler/application. |
| Pending | Ensure app.listen only runs locally. |
| Pending | Ensure Vercel does not start a persistent HTTP listener. |
| Pending | Ensure /health responds successfully. |
| Pending | Ensure root request does not crash. |
| Pending | Ensure favicon requests do not crash the server. |
| Pending | Ensure all imported runtime modules exist in the deployment bundle. |
| Pending | Create or update safe API entrypoint according to Vercel Express deployment model if required. |
| Pending | Do not recreate invalid root vercel.json unless absolutely required. |
| Pending | If Vercel config is required, explain why. |
| Pending | If Vercel config is required, scope it to the correct project. |
| Pending | If Vercel config is required, do not reference missing Vercel secrets. |
| Pending | If Vercel config is required, do not use unsupported Node.js runtimes. |
| Pending | If Vercel config is required, do not combine frontend and backend incorrectly. |

## Task 7 - Frontend API Connection

| Status | Task |
| --- | --- |
| Pending | Audit how the frontend builds API URLs. |
| Pending | Determine whether frontend routes already append /api/v1. |
| Pending | Determine whether frontend routes already append endpoint paths. |
| Pending | Prevent duplicate /api/v1/api/v1 paths. |
| Pending | Prevent double slashes in API URLs. |
| Pending | Use NEXT_PUBLIC_API_URL as the frontend API variable. |
| Pending | Ensure final value is compatible with existing frontend proxy implementation. |
| Pending | Use frontend domain https://school-com-mauve.vercel.app in documentation. |
| Pending | Use backend domain https://school-api-gules.vercel.app in documentation. |
| Pending | Ensure backend CORS origin uses WEB_ORIGIN=https://school-com-mauve.vercel.app. |
| Pending | Do not expose backend secrets through NEXT_PUBLIC variables. |

## Task 8 - Environment Variable Audit

| Status | Task |
| --- | --- |
| Pending | Produce exact required environment-variable list for school-api. |
| Pending | Produce exact required environment-variable list for school-com. |
| Pending | Produce exact required environment-variable list for local development. |
| Pending | Validate environment-variable schemas and minimum lengths. |
| Pending | Ensure API variable DATABASE_URL is documented only where required. |
| Pending | Ensure API variable JWT_ACCESS_SECRET is documented only where required. |
| Pending | Ensure API variable JWT_REFRESH_SECRET is documented only where required. |
| Pending | Ensure API variable ACCESS_TOKEN_EXPIRES_IN is documented only where required. |
| Pending | Ensure API variable REFRESH_TOKEN_EXPIRES_IN is documented only where required. |
| Pending | Ensure API variable WEB_ORIGIN is documented only where required. |
| Pending | Ensure API variable NODE_ENV is documented only where required. |
| Pending | Ensure frontend variable NEXT_PUBLIC_API_URL is documented only where required. |
| Pending | Remove variables from the wrong Vercel project documentation. |
| Pending | Ensure NEXT_PUBLIC_API_URL is not required in school-api. |
| Pending | Ensure database and JWT secrets are not placed in school-com documentation. |
| Pending | Ensure DIRECT_URL does not remain if unused by Prisma schema. |
| Pending | Update only example environment files with safe placeholders. |
| Pending | Ensure no real Neon passwords are placed in source, docs, commits, logs, or reports. |
| Pending | Ensure no real JWT secrets are placed in source, docs, commits, logs, or reports. |

## Task 9 - Clean Installation Test

| Status | Task |
| --- | --- |
| Pending | Stop all running Node processes before clean install test. |
| Pending | Remove all node_modules folders. |
| Pending | Remove generated dist folders. |
| Pending | Keep or regenerate package-lock.json correctly. |
| Pending | Run npm ci --no-audit --no-fund. |
| Pending | Run npm ls embedded-postgres. |
| Pending | Run npm ls @embedded-postgres/windows-x64. |
| Pending | Confirm both embedded PostgreSQL package checks return empty. |
| Pending | Confirm package-lock.json has no embedded-postgres references. |
| Pending | Do not rely on an old node_modules folder. |

## Task 10 - Required Validation Commands

| Status | Task |
| --- | --- |
| Pending | Run and record node --version. |
| Pending | Run and record npm --version. |
| Pending | Run and record npm ci --no-audit --no-fund. |
| Pending | Run and record npm run prisma:generate. |
| Pending | Run and record npm run build --workspace @school-erp/shared. |
| Pending | Run and record npm run build --workspace @school-erp/ui. |
| Pending | Run and record npm run build --workspace @school-erp/api. |
| Pending | Run and record npm run build --workspace @school-erp/web. |
| Pending | Run and record npm run typecheck --workspaces --if-present. |
| Pending | Run and record npm run test --workspaces --if-present. |
| Pending | Run and record npm run build. |
| Pending | Do not mark a command passed unless it exits with code 0. |
| Pending | Fix every error found by validation commands. |

## Task 11 - Local Runtime Smoke Test

| Status | Task |
| --- | --- |
| Pending | Start the API locally using the production-compatible entrypoint. |
| Pending | Verify GET /health returns HTTP 200. |
| Pending | Verify GET / does not crash. |
| Pending | Verify invalid route returns controlled 404. |
| Pending | Verify environment validation works. |
| Pending | Verify Prisma Client initializes. |
| Pending | Verify shared package loads correctly. |
| Pending | Verify no ERR_MODULE_NOT_FOUND occurs. |
| Pending | Verify no TypeScript source file is required directly at runtime. |
| Pending | Start the frontend. |
| Pending | Verify login page loads. |
| Pending | Verify frontend can reach backend. |
| Pending | Verify no duplicate API path occurs. |
| Pending | Verify browser console has no critical API URL errors. |

## Task 12 - Deployment-Readiness Audit

| Status | Task |
| --- | --- |
| Pending | Verify likely Vercel deployment output before declaring completion. |
| Pending | Confirm final repository does not depend on local PostgreSQL. |
| Pending | Confirm final repository does not depend on Windows executables. |
| Pending | Confirm final repository does not depend on generated files missing in CI. |
| Pending | Confirm final repository does not depend on unbuilt workspace TypeScript packages. |
| Pending | Confirm final repository does not depend on local-only module resolution. |
| Pending | Confirm final repository does not depend on manually generated Prisma Client from an old installation. |
| Pending | Confirm final repository does not depend on old Vercel deployment cache. |
| Pending | Confirm latest Git commit contains every fix or document that no commit was created. |
| Pending | Do not redeploy an old commit. |

## Strict Rules

| Status | Task |
| --- | --- |
| Pending | Do not fix only the first visible error. |
| Pending | Continue until all related deployment problems are eliminated or marked not verified/failed with reason. |
| Pending | Do not create a replacement project. |
| Pending | Preserve all ERP features. |
| Pending | Preserve all portals and modules. |
| Pending | Do not redesign the UI. |
| Pending | Do not remove working business logic. |
| Pending | Do not hide TypeScript errors with any. |
| Pending | Do not hide TypeScript errors with @ts-ignore. |
| Pending | Do not hide TypeScript errors by disabling strict mode. |
| Pending | Do not hide TypeScript errors by disabling build checks. |
| Pending | Do not make the build succeed by skipping validation. |
| Pending | Do not commit secrets. |
| Pending | Do not claim Vercel runtime success based only on local build success. |
| Pending | Do not stop until the complete checklist is finished. |
| Pending | Do not ask for approval during individual fixes. |
| Pending | Ask for approval only after the full stabilization phase is complete. |
| Pending | If any test cannot be executed, clearly mark it as NOT VERIFIED. |
| Pending | Do not fabricate test results. |
| Pending | Do not generate documentation only; apply actual code fixes. |

## Required Final Deliverables

| Status | Task |
| --- | --- |
| In Progress | Create docs/deployment-final-stabilization-checklist.md. |
| Pending | Create docs/deployment-root-cause-report.md. |
| Pending | Create docs/deployment-files-changed.md. |
| Pending | Create docs/deployment-test-results.md. |
| Pending | Create docs/vercel-environment-variables-final.md. |
| Pending | Create docs/neon-database-setup-final.md. |
| Pending | Create docs/client-demo-deployment-readiness.md. |

## Final Response Requirements

| Status | Task |
| --- | --- |
| Pending | Include root causes found. |
| Pending | Include every file changed with exact path. |
| Pending | Include every command executed. |
| Pending | Include passed tests. |
| Pending | Include failed tests. |
| Pending | Include remaining limitations. |
| Pending | Include exact Vercel settings for school-api. |
| Pending | Include exact Vercel settings for school-com. |
| Pending | Include exact Neon URL type required locally and on Vercel. |
| Pending | Include latest Git commit hash. |
| Pending | Include final status for clean install. |
| Pending | Include final status for root build. |
| Pending | Include final status for API build. |
| Pending | Include final status for web build. |
| Pending | Include final status for Prisma generation. |
| Pending | Include final status for shared package runtime. |
| Pending | Include final status for local /health. |
| Pending | Include final status for Vercel readiness. |
| Pending | Include final status for client demo readiness. |

## Final Acceptance Criteria

| Status | Task |
| --- | --- |
| Pending | npm ci succeeds from a clean installation. |
| Pending | No embedded PostgreSQL package exists. |
| Pending | All internal workspace packages have valid runtime entries. |
| Pending | No package main/exports points to TypeScript source. |
| Pending | Prisma Client generates automatically. |
| Pending | API TypeScript build succeeds. |
| Pending | Frontend production build succeeds. |
| Pending | Root monorepo build succeeds. |
| Pending | Tests and typechecks succeed. |
| Pending | API starts locally. |
| Pending | /health returns HTTP 200 locally. |
| Pending | No ERR_MODULE_NOT_FOUND remains. |
| Pending | Frontend API URL is correct. |
| Pending | Vercel environment variables are documented exactly. |
| Pending | Git contains all required fixes or this is explicitly marked not committed. |
| Pending | No secret is committed. |
