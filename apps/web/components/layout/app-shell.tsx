import Link from "next/link";
import { Archive, Award, BarChart3, BookOpenCheck, BriefcaseBusiness, CalendarDays, ClipboardList, CreditCard, FileSpreadsheet, Globe2, GraduationCap, Home, Library, LogOut, Megaphone, Rocket, Settings, ShieldCheck, Smartphone, Users } from "lucide-react";
import { ROLE_THEME, ROLES, type Role } from "@school-erp/shared";
import { cn } from "@school-erp/ui";
import { LogoutButton } from "./logout-button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

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
    { label: "Fees", href: "/parent", icon: GraduationCap }
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

export function AppShell({
  role,
  name,
  children
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const theme = ROLE_THEME[role];
  const nav = navByRole[role];

  return (
    <div className={cn("min-h-screen", theme.className)}>
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-border bg-surface px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold">School ERP</p>
              <p className="text-xs text-muted-foreground">{theme.name}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1" aria-label={`${theme.name} navigation`}>
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  href={item.href}
                >
                  <Icon aria-hidden={true} size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-md border border-border bg-background p-4">
            <p className="text-sm font-medium">{name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Signed in with {theme.name} access</p>
            <LogoutButton icon={<LogOut aria-hidden="true" size={16} />} />
          </div>
        </aside>

        <main className="min-w-0 px-5 py-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
