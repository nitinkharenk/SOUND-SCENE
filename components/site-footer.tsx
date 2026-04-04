import Link from "next/link";
import { ShortcutsHintButton } from "@/components/shortcuts-hint-button";

const browseLinks = [
  { href: "/", label: "Home" },
  { href: "/charts", label: "Charts" },
  { href: "/songs", label: "Songs" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
] as const;

const exploreLinks = [
  { href: "/series/episodes", label: "Episodes" },
  { href: "/discover", label: "Discover" },
  { href: "/scenes", label: "Scene Types" },
  { href: "/search", label: "Search" },
] as const;

export function SiteFooter() {
  return (
    <footer
      className="mt-20 border-t"
      style={{
        borderColor: "var(--line)",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >

      {/* ── Main footer grid ── */}
      <div className="mx-auto max-w-[1360px] px-4 pt-14 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_0.6fr_1fr] lg:gap-12">
          {/* Brand column */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: "var(--color-accent)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--background)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="font-heading text-xl font-extrabold uppercase tracking-[0.01em]">
                SoundScene
              </span>
            </div>

            <p
              className="max-w-xs font-body text-sm leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Music discovery built for film and series fans. Real soundtracks,
              editorial curation, and scene-level context — all in one catalog.
            </p>

            <div className="flex gap-4">
              {/* Stat badges */}
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "var(--color-accent-subtle)" }}
              >
                <p
                  className="font-card text-2xl font-semibold tracking-normal"
                  style={{ color: "var(--color-accent)" }}
                >
                  200+
                </p>
                <p
                  className="mt-0.5 font-body text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  Titles indexed
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--foreground) 5%, transparent)",
                }}
              >
                <p className="font-card text-2xl font-semibold tracking-normal">
                  Live
                </p>
                <p
                  className="mt-0.5 font-body text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  Catalog data
                </p>
              </div>
            </div>
          </div>

          {/* Browse column */}
          <nav>
            <p className="route-kicker">Browse</p>
            <ul className="mt-4 space-y-2.5">
              {browseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 font-card text-[0.95rem] font-medium tracking-normal transition-colors duration-200"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="inline-block h-px w-0 transition-all duration-200 group-hover:w-3"
                      style={{ background: "var(--color-accent)" }}
                    />
                    <span className="transition-colors duration-200 group-hover:text-accent-hover">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore column */}
          <nav>
            <p className="route-kicker">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 font-card text-[0.95rem] font-medium tracking-normal transition-colors duration-200"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="inline-block h-px w-0 transition-all duration-200 group-hover:w-3"
                      style={{ background: "var(--color-accent)" }}
                    />
                    <span className="transition-colors duration-200 group-hover:text-accent-hover">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick actions column */}
          <div className="space-y-4">
            <p className="route-kicker">Quick Access</p>

            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: "var(--line)",
                background: "var(--card)",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--color-accent-subtle)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-card text-sm font-semibold tracking-normal">
                      Fast Routes
                    </p>
                    <p
                      className="mt-1 font-body text-xs leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      Jump from titles to tracks without leaving the page.
                    </p>
                  </div>
                </div>

                <div
                  className="h-px w-full"
                  style={{ background: "var(--line)" }}
                />

                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "color-mix(in srgb, var(--foreground) 6%, transparent)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M6 8h.01M10 8h.01M14 8h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-card text-sm font-semibold tracking-normal">
                      Keyboard Shortcuts
                    </p>
                    <div className="mt-1.5">
                      <ShortcutsHintButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--line)" }}
        >
          <p
            className="font-body text-xs"
            style={{ color: "var(--muted)" }}
          >
            &copy; {new Date().getFullYear()} SoundScene. Soundtrack discovery,
            focused and scene-aware.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {["Live catalog", "Editorial browse", "Search-first"].map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 font-body text-[0.68rem] font-medium uppercase tracking-[0.12em]"
                style={{
                  background:
                    "color-mix(in srgb, var(--foreground) 5%, transparent)",
                  color: "var(--muted)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
