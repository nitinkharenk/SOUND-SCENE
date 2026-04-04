import Link from "next/link";
import { getCatalog } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

export default async function AdminSeriesPage() {
  const catalog = await getCatalog();
  const seriesItems = catalog.filter((entry) => entry.type === "series");

  return (
    <section className="route-surface py-5">
      <p className="route-kicker">Admin series</p>
      <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[0.01em] text-black">
        Series
      </h2>
      <p className="mt-3 font-body text-base text-[color:var(--muted)]">
        {pluralize(seriesItems.length, "series", "series")} currently in the catalog, including
        season and episode soundtrack mappings.
      </p>
      <div className="mt-6 space-y-3">
        {seriesItems.map((series) => (
          <Link key={series.slug} href={`/series/${series.slug}`} className="route-row-link grid-cols-[1fr]">
            <div>
              <p className="route-kicker text-[0.72rem]">{series.year} · {series.platform}</p>
              <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                {series.title}
              </h3>
              <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
                {pluralize(series.seasonsCount, "season")} ·{" "}
                {pluralize(
                  series.seasons.reduce((count, season) => count + season.episodes.length, 0),
                  "episode",
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
