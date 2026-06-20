"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Award,
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  Globe2,
  GraduationCap,
  Home,
  Library,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  Users,
  X
} from "lucide-react";
import { ROLE_THEME, ROLES, type Role } from "@school-erp/shared";
import { cn } from "@school-erp/ui";
import { LogoutButton } from "./logout-button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
};

type ThemePreference = "light" | "dark" | "system";

const navByRole: Record<Role, NavItem[]> = {
  [ROLES.SUPER_ADMIN]: [
    { label: "Platform Dashboard", href: "/super-admin", icon: Home },
    { label: "Schools", href: "/super-admin", icon: GraduationCap },
    { label: "Audit", href: "/super-admin", icon: ShieldCheck },
    { label: "Security", href: "/security", icon: ShieldCheck },
    { label: "Production", href: "/production-readiness", icon: Rocket },
    { label: "Settings", href: "/super-admin", icon: Settings }
  ],
  [ROLES.SCHOOL_ADMIN]: [
    { label: "Dashboard", href: "/school-admin", icon: Home },
    { label: "Admissions", href: "/admissions", icon: ClipboardList },
    { label: "Academic", href: "/academic", icon: BookOpenCheck },
    { label: "Attendance", href: "/attendance", icon: CalendarDays },
    { label: "Examination", href: "/examination", icon: GraduationCap },
    { label: "LMS", href: "/lms", icon: BookOpenCheck },
    { label: "Finance", href: "/finance", icon: CreditCard },
    { label: "Advanced Finance", href: "/advanced-finance", icon: FileSpreadsheet },
    { label: "HR", href: "/hr", icon: BriefcaseBusiness },
    { label: "Library", href: "/library", icon: Library },
    { label: "Communication", href: "/communication", icon: Megaphone },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Documents", href: "/documents", icon: Archive },
    { label: "Certificates", href: "/certificates", icon: Award },
    { label: "Meetings", href: "/meetings", icon: CalendarDays },
    { label: "Website CMS", href: "/cms", icon: Globe2 },
    { label: "Mobile API", href: "/mobile", icon: Smartphone },
    { label: "Security", href: "/security", icon: ShieldCheck },
    { label: "Production", href: "/production-readiness", icon: Rocket },
    { label: "People", href: "/school-admin", icon: Users }
  ],
  [ROLES.TEACHER]: [
    { label: "Dashboard", href: "/teacher", icon: Home },
    { label: "Classes", href: "/teacher", icon: BookOpenCheck },
    { label: "Attendance", href: "/teacher", icon: CalendarDays },
    { label: "Examination", href: "/examination", icon: GraduationCap },
    { label: "LMS", href: "/lms", icon: BookOpenCheck },
    { label: "Communication", href: "/communication", icon: Megaphone },
    { label: "Meetings", href: "/meetings", icon: CalendarDays }
  ],
  [ROLES.STUDENT]: [
    { label: "Dashboard", href: "/student", icon: Home },
    { label: "Assignments", href: "/student", icon: BookOpenCheck },
    { label: "LMS", href: "/lms", icon: BookOpenCheck },
    { label: "Results", href: "/student", icon: GraduationCap }
  ],
  [ROLES.PARENT]: [
    { label: "Dashboard", href: "/parent", icon: Home },
    { label: "Children", href: "/parent", icon: Users },
    { label: "Fees", href: "/parent", icon: CreditCard }
  ],
  [ROLES.STAFF]: [
    { label: "Dashboard", href: "/school-admin", icon: Home },
    { label: "Admissions", href: "/admissions", icon: ClipboardList },
    { label: "Academic", href: "/academic", icon: BookOpenCheck },
    { label: "Attendance", href: "/attendance", icon: CalendarDays },
    { label: "Examination", href: "/examination", icon: GraduationCap },
    { label: "LMS", href: "/lms", icon: BookOpenCheck },
    { label: "Communication", href: "/communication", icon: Megaphone },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Documents", href: "/documents", icon: Archive },
    { label: "Certificates", href: "/certificates", icon: Award },
    { label: "Meetings", href: "/meetings", icon: CalendarDays },
    { label: "Website CMS", href: "/cms", icon: Globe2 },
    { label: "Mobile API", href: "/mobile", icon: Smartphone }
  ],
  [ROLES.FINANCE_OFFICER]: [
    { label: "Finance", href: "/finance", icon: CreditCard },
    { label: "Advanced Finance", href: "/advanced-finance", icon: FileSpreadsheet },
    { label: "Reports", href: "/reports", icon: BarChart3 }
  ],
  [ROLES.LIBRARIAN]: [{ label: "Library", href: "/library", icon: Library }],
  [ROLES.HR_OFFICER]: [
    { label: "HR", href: "/hr", icon: BriefcaseBusiness },
    { label: "Attendance", href: "/attendance", icon: CalendarDays },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Documents", href: "/documents", icon: Archive }
  ]
};

export function AppShell({ role, name, children }: { role: Role; name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = ROLE_THEME[role];
  const nav = navByRole[role];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  const pageTitle = breadcrumbs.at(-1) ?? "Dashboard";

  useEffect(() => {
    const stored = window.localStorage.getItem("erp-theme") as ThemePreference | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemePreference(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("erp-theme", themePreference);
  }, [themePreference]);

  return (
    <div className={cn("min-h-screen bg-background text-foreground", theme.className, themePreference === "dark" ? "theme-dark" : themePreference === "system" ? "theme-system" : "theme-light")}>
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-popover" href="#main-content">
        Skip to main content
      </a>

      <div className={cn("min-h-screen lg:grid", sidebarCollapsed ? "lg:grid-cols-[84px_1fr]" : "lg:grid-cols-[292px_1fr]")}>
        <Sidebar roleName={theme.name} name={name} nav={nav} pathname={pathname} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />

        <div className="min-w-0 lg:h-screen lg:overflow-y-auto">
          <Topbar
            pageTitle={pageTitle}
            roleName={theme.name}
            name={name}
            breadcrumbs={breadcrumbs}
            themePreference={themePreference}
            setThemePreference={setThemePreference}
            onOpenMobile={() => setMobileOpen(true)}
          />

          <main id="main-content" className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-12">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} roleName={theme.name} name={name} nav={nav} pathname={pathname} />
    </div>
  );
}

function Sidebar({ roleName, name, nav, pathname, collapsed, onToggle }: { roleName: string; name: string; nav: NavItem[]; pathname: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-slate-800 bg-slate-950 px-4 py-4 text-slate-100 lg:flex lg:flex-col">
      <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap aria-hidden="true" size={22} />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" title="School ERP">School ERP</p>
            <p className="truncate text-xs text-slate-400" title={roleName}>{roleName}</p>
          </div>
        ) : null}
      </div>

      <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={onToggle} type="button">
        {collapsed ? <PanelLeftOpen aria-hidden={true} size={17} /> : <PanelLeftClose aria-hidden={true} size={17} />}
        {!collapsed ? "Collapse" : <span className="sr-only">Expand sidebar</span>}
      </button>

      <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1" aria-label={`${roleName} navigation`}>
        {nav.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} darkSurface />
        ))}
      </nav>

      {!collapsed ? <ProfilePanel name={name} roleName={roleName} /> : null}
    </aside>
  );
}

function Topbar({ pageTitle, roleName, name, breadcrumbs, themePreference, setThemePreference, onOpenMobile }: { pageTitle: string; roleName: string; name: string; breadcrumbs: string[]; themePreference: ThemePreference; setThemePreference: (value: ThemePreference) => void; onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden" onClick={onOpenMobile} type="button" aria-label="Open navigation">
          <Menu aria-hidden={true} size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <nav className="hidden text-xs text-muted-foreground md:block" aria-label="Breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`}>
                {index > 0 ? <span className="px-2">/</span> : null}
                <span className={index === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>{crumb}</span>
              </span>
            ))}
          </nav>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <h1 className="truncate text-base font-semibold sm:text-lg" title={pageTitle}>{pageTitle}</h1>
            <span className="hidden rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary sm:inline-flex">{roleName}</span>
          </div>
        </div>

        <label className="relative hidden min-w-[220px] flex-1 md:max-w-sm lg:block">
          <span className="sr-only">School search</span>
          <Search aria-hidden={true} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <input className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm" placeholder="Search school records" />
        </label>

        <div className="hidden h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          Assigned school
        </div>

        <ThemeToggle value={themePreference} onChange={setThemePreference} />

        <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="button" aria-label="Notifications placeholder" title="Notifications appear here when provider data exists">
          <Bell aria-hidden={true} size={18} />
        </button>

        <div className="hidden min-w-0 items-center gap-3 rounded-md border border-border bg-background px-3 py-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">{initials(name)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={name}>{name}</p>
            <p className="truncate text-xs text-muted-foreground">School profile</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }) {
  const next = value === "light" ? "dark" : value === "dark" ? "system" : "light";
  const Icon = value === "dark" ? Moon : value === "light" ? Sun : Check;
  return (
    <button className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => onChange(next)} type="button" aria-label={`Theme: ${value}. Switch theme`}>
      <Icon aria-hidden={true} size={17} />
      <span className="hidden sm:inline">{value}</span>
    </button>
  );
}

function MobileNav({ open, onClose, roleName, name, nav, pathname }: { open: boolean; onClose: () => void; roleName: string; name: string; nav: NavItem[]; pathname: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button className="absolute inset-0 bg-foreground/30" onClick={onClose} type="button" aria-label="Close navigation" />
      <div className="relative flex h-full w-[min(88vw,360px)] flex-col border-r border-border bg-surface p-4 shadow-popover">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap aria-hidden={true} size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">School ERP</p>
              <p className="truncate text-xs text-muted-foreground" title={roleName}>{roleName}</p>
            </div>
          </div>
          <button className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={onClose} type="button" aria-label="Close navigation">
            <X aria-hidden={true} size={19} />
          </button>
        </div>

        <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label={`${roleName} mobile navigation`}>
          {nav.map((item) => (
            <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} onClick={onClose} />
          ))}
        </nav>

        <div className="shrink-0 pt-4">
          <ProfilePanel name={name} roleName={roleName} mobile />
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, active, collapsed, onClick, darkSurface }: { item: NavItem; active: boolean; collapsed?: boolean; onClick?: () => void; darkSurface?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        darkSurface
          ? active
            ? "bg-primary text-primary-foreground shadow-panel"
            : "text-slate-300 hover:bg-slate-900 hover:text-white"
          : active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
      <Icon aria-hidden={true} size={18} />
      {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
    </Link>
  );
}

function ProfilePanel({ name, roleName, mobile }: { name: string; roleName: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("shrink-0 rounded-md border p-3 shadow-panel", mobile ? "border-border bg-background" : "mt-4 border-slate-800 bg-slate-900")}>
      <button
        className={cn("flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", mobile ? "hover:bg-muted" : "hover:bg-slate-800")}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">{initials(name)}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-medium", mobile ? "text-foreground" : "text-slate-100")} title={name}>{name}</span>
          <span className={cn("block truncate text-xs", mobile ? "text-muted-foreground" : "text-slate-400")} title={roleName}>{roleName}</span>
        </span>
        <ChevronDown aria-hidden={true} className={cn("shrink-0 transition", open && "rotate-180")} size={16} />
      </button>
      {open ? (
        <div className={cn("mt-3 rounded-md border p-2", mobile ? "border-border bg-surface" : "border-slate-800 bg-slate-950")}>
          <p className={cn("px-2 py-1 text-xs", mobile ? "text-muted-foreground" : "text-slate-400")}>Signed in with {roleName} access</p>
          <LogoutButton icon={<LogOut aria-hidden="true" size={16} />} compact />
        </div>
      ) : null}
    </div>
  );
}

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return ["Dashboard"];
  return parts.map((part) =>
    part
      .split("-")
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(" ")
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
