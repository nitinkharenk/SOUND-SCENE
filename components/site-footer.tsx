import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-heading text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
            SoundScene
          </p>
          <p className="max-w-xl font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            A cinematic discovery platform for finding songs used in movies and web series with
            scene-level notes, timestamps, and editorial curation.
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Browse
          </p>
          <Link
            href="/"
            className="block font-body text-sm font-medium transition hover:opacity-100"
            style={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Home
          </Link>
          <Link
            href="/"
            className="block font-body text-sm font-medium transition hover:opacity-100"
            style={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Smart Search
          </Link>
          <Link
            href="/series"
            className="block font-body text-sm font-medium transition hover:opacity-100"
            style={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Web Series
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Explore
          </p>
          <Link
            href="/movies"
            className="block font-body text-sm font-medium transition hover:opacity-100"
            style={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Movies
          </Link>
          <Link
            href="/series/episodes"
            className="block font-body text-sm font-medium transition hover:opacity-100"
            style={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Episodes
          </Link>
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Next.js + Tailwind + Motion + GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
