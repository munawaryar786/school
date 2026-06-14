import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-danger/10 text-danger">
          <ShieldAlert aria-hidden="true" size={24} />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal">Access restricted</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your current role cannot open this area. Use the correct account or return to your assigned workspace.
        </p>
        <Link
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          href="/"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}

