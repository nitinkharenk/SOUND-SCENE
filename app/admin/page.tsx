import Link from "next/link";
import {
  getCatalog,
  getSceneLibrary,
  getSongLibrary,
  getStats,
} from "@/lib/content-store";
import { pluralize } from "@/lib/text";

export default async function AdminOverviewPage() {
  const [stats, catalog, songs, scenes] = await Promise.all([
    getStats(),
    getCatalog(),
    getSongLibrary(),
    getSceneLibrary(),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Titles", stats.titles],
          ["Songs", stats.songs],
          ["Scenes", stats.scenes],
          ["Series Episodes", stats.seriesEpisodes],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[0.9rem] border border-[color:var(--line)] bg-accent-subtle px-5 py-5">
            <p className="route-kicker">{label}</p>
            <p className="mt-2 font-card text-3xl font-semibold text-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="route-surface py-5">
          <p className="route-kicker">Recently added titles</p>
          <div className="mt-4 space-y-3">
            {catalog.slice(0, 6).map((entry) => (
              <Link
                key={entry.slug}
                href={`/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`}
                className="route-row-link grid-cols-[1fr]"
              >
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {entry.type === "movie" ? "Movie" : "Series"} · {entry.year}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {entry.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="route-surface py-5">
          <p className="route-kicker">Quick add targets</p>
          <div className="mt-4 grid gap-3">
            {[
              ["/admin/movies", "Movies", pluralize(catalog.filter((entry) => entry.type === "movie").length, "entry")],
              ["/admin/series", "Series", pluralize(catalog.filter((entry) => entry.type === "series").length, "entry")],
              ["/admin/songs", "Songs", pluralize(songs.length, "entry")],
              ["/admin/cues", "Cues", pluralize(scenes.length, "mapped cue")],
            ].map(([href, label, meta]) => (
              <Link key={href} href={href} className="route-row-link grid-cols-[1fr]">
                <div>
                  <p className="route-kicker text-[0.72rem]">Management hub</p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {label}
                  </h2>
                  <p className="mt-2 font-body text-sm text-[color:var(--muted)]">{meta}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
