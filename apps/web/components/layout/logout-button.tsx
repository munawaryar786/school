"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ icon }: { icon: React.ReactNode }) {
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
      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-65"
      type="button"
      onClick={logout}
      disabled={loading}
    >
      {icon}
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}

