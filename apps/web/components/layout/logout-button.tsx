"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@school-erp/ui";

export function LogoutButton({ icon, compact }: { icon: React.ReactNode; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-65",
        compact ? "mt-2 h-9" : "mt-4 h-9"
      )}
      type="button"
      onClick={logout}
      disabled={loading}
    >
      {icon}
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
