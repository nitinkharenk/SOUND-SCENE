import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function logout() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const secret = process.env.ADMIN_SECRET;
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(secret && cookieStore.get("admin_token")?.value === secret);

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="route-shell">
      <header className="route-surface py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="route-kicker">Admin panel</p>
            <h1 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[0.01em] text-black">
              SoundScene Control Room
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              ["/admin", "Overview"],
              ["/admin/movies", "Movies"],
              ["/admin/series", "Series"],
              ["/admin/songs", "Songs"],
              ["/admin/cues", "Cues"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="route-action focus-ring">
                {label}
              </Link>
            ))}
            <form action={logout}>
              <button type="submit" className="route-action route-action-primary focus-ring">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mt-10">{children}</div>
    </div>
  );
}
