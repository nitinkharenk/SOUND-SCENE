import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";

  const secret = process.env.ADMIN_SECRET;
  const submitted = String(formData.get("password") ?? "");

  if (!secret || submitted !== secret) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/admin");
}

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = Array.isArray(params.error) ? Boolean(params.error[0]) : Boolean(params.error);

  return (
    <div className="route-shell">
      <section className="mx-auto max-w-xl rounded-[1rem] border border-[color:var(--line)] bg-[color:var(--background)] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.08)] sm:p-8">
        <p className="route-kicker">Admin access</p>
        <h1 className="font-heading mt-3 text-4xl font-extrabold uppercase tracking-[0.01em] text-[color:var(--foreground)]">
          Sign In
        </h1>
        <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--muted)]">
          Use the single admin secret to open the SoundScene content dashboard.
        </p>

        {!process.env.ADMIN_SECRET ? (
          <p className="mt-4 rounded-[0.8rem] bg-accent-subtle px-4 py-3 font-body text-sm text-accent">
            ADMIN_SECRET is not set yet. Add it to your environment before using the admin panel.
          </p>
        ) : null}

        {hasError ? (
          <p className="mt-4 rounded-[0.8rem] bg-accent-subtle px-4 py-3 font-body text-sm text-accent">
            The password didn&apos;t match the admin secret.
          </p>
        ) : null}

        <form action={login} className="mt-6 space-y-4">
          <label className="block">
            <span className="font-body text-sm font-medium text-[color:var(--foreground)]">
              Admin password
            </span>
            <input
              name="password"
              type="password"
              className="focus-ring mt-2 w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 font-body text-base outline-none"
            />
          </label>
          <button type="submit" className="route-action route-action-primary focus-ring">
            Unlock Admin
          </button>
        </form>
      </section>
    </div>
  );
}
