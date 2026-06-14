import { CheckCircle2, Database, KeyRound, LayoutDashboard, Route, ShieldCheck } from "lucide-react";
import type { Role } from "@school-erp/shared";
import { ROLE_THEME } from "@school-erp/shared";

const foundationItems = [
  { label: "Authentication", detail: "JWT login and logout routes are wired", icon: KeyRound },
  { label: "RBAC", detail: "Role permissions protect API and route access", icon: ShieldCheck },
  { label: "PostgreSQL", detail: "Prisma schema defines users, roles, schools, sessions, audit logs", icon: Database },
  { label: "Layouts", detail: "Protected role shell with accessible navigation", icon: LayoutDashboard },
  { label: "Route protection", detail: "Middleware redirects unauthenticated and mismatched roles", icon: Route }
];

export function FoundationDashboard({ role }: { role: Role }) {
  const theme = ROLE_THEME[role];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">{theme.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Foundation dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Phase 2 foundation services are connected here: authentication, route protection, RBAC, theme tokens,
          layouts, shared validation, and Prisma-backed identity models.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {foundationItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden="true" size={20} />
              </div>
              <h2 className="mt-4 text-base font-semibold">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle2 aria-hidden="true" size={14} />
                Ready
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

