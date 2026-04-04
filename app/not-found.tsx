import Link from "next/link";
import { NotFoundBackButton } from "@/components/not-found-back-button";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-48 w-48 -translate-x-1/2 rounded-full bg-[color:var(--color-accent-subtle)] blur-3xl" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-[color:var(--color-accent-subtle)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-[1rem] border border-[color:var(--line)] bg-[color:var(--background)] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.12)] sm:p-8">
          <div className="route-kicker">404 error</div>
          <div className="mt-4">
            <h1 className="font-heading flex flex-wrap items-end gap-x-4 gap-y-1 text-4xl font-extrabold uppercase leading-[1.25] tracking-[0.01em] sm:text-5xl">
              <span className="whitespace-nowrap text-[color:var(--foreground)]">Track</span>
              <span
                className="section-outline-word whitespace-nowrap"
                style={{
                  WebkitTextStroke: "1.8px var(--outlined-stroke)",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Not Found
              </span>
            </h1>
            <p className="mt-5 max-w-xl font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
              The soundtrack you&apos;re looking for might have moved, been removed, or never made
              it into our catalog. You can jump back into SoundScene from here.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/search" className="route-action route-action-primary focus-ring">
              Search SoundScene
            </Link>
            <NotFoundBackButton />
          </div>

          <div className="mt-8 route-surface">
            <div className="grid gap-4 py-5 sm:grid-cols-3">
              <Link href="/movies" className="route-row-link grid-cols-[1fr]">
                <div>
                  <p className="route-kicker text-[0.72rem]">Browse</p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    Movies
                  </h2>
                  <p className="mt-2 font-body text-sm font-normal text-[color:var(--muted)]">
                    Explore soundtrack-led movie pages.
                  </p>
                </div>
              </Link>

              <Link href="/series" className="route-row-link grid-cols-[1fr]">
                <div>
                  <p className="route-kicker text-[0.72rem]">Browse</p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    Series
                  </h2>
                  <p className="mt-2 font-body text-sm font-normal text-[color:var(--muted)]">
                    Jump back into episode-level guides.
                  </p>
                </div>
              </Link>

              <Link href="/charts" className="route-row-link grid-cols-[1fr]">
                <div>
                  <p className="route-kicker text-[0.72rem]">Browse</p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    Charts
                  </h2>
                  <p className="mt-2 font-body text-sm font-normal text-[color:var(--muted)]">
                    See what songs and titles are trending.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
