import { redirect } from "next/navigation";
import { AppShell } from "../../components/layout/app-shell";
import { getSession } from "../../lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell role={session.role} name={session.name}>
      {children}
    </AppShell>
  );
}

