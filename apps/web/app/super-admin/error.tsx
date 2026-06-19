"use client";

export default function SuperAdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-panel">
        <h1 className="text-xl font-semibold">Super Admin dashboard could not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Retry the dashboard request. If the issue continues, check the Super Admin API response.</p>
        <button className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={reset} type="button">
          Retry
        </button>
      </section>
    </main>
  );
}
