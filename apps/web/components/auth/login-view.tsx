"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type ApiResponse, type LoginInput, type LoginResult } from "@school-erp/shared";
import { homePathForRole } from "../../lib/role-routes";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      schoolId: ""
    }
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...values,
        schoolId: values.schoolId || undefined
      })
    });
    const payload = (await response.json()) as ApiResponse<LoginResult>;

    if (!response.ok || !payload.success) {
      setServerError(payload.success ? "Login failed." : payload.error.message);
      return;
    }

    const next = searchParams.get("next");
    router.replace(next || homePathForRole(payload.data.user.activeRole));
    router.refresh();
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden flex-col justify-between bg-[linear-gradient(135deg,hsl(217_91%_50%),hsl(174_72%_33%)_52%,hsl(328_78%_52%))] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/14 ring-1 ring-white/20">
            <Building2 aria-hidden="true" size={24} />
          </div>
          <span className="text-lg font-semibold">School ERP</span>
        </div>
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/72">Enterprise school operations</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-normal">
            Secure role-based access for every school team.
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 text-sm text-white/82">
            <div className="rounded-md border border-white/18 bg-white/10 p-4">Tenant-scoped data model</div>
            <div className="rounded-md border border-white/18 bg-white/10 p-4">JWT and RBAC foundation</div>
            <div className="rounded-md border border-white/18 bg-white/10 p-4">Accessible SaaS shell</div>
            <div className="rounded-md border border-white/18 bg-white/10 p-4">Audit-ready workflows</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 aria-hidden="true" size={22} />
              </div>
              <span className="text-lg font-semibold">School ERP</span>
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-normal">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use your school-issued credentials to open your assigned workspace.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <span className="relative block">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                  autoComplete="email"
                  {...register("email")}
                />
              </span>
              {errors.email ? <span className="mt-2 block text-sm text-danger">{errors.email.message}</span> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <span className="relative block">
                <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </span>
              {errors.password ? <span className="mt-2 block text-sm text-danger">{errors.password.message}</span> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">School ID</span>
              <span className="relative block">
                <Building2 aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Required when your account belongs to multiple schools"
                  {...register("schoolId")}
                />
              </span>
            </label>

            {serverError ? (
              <div className="rounded-md border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                {serverError}
              </div>
            ) : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in" : "Sign in"}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
