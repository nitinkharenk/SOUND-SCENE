import Link from "next/link";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getDiscoverGenreData, getDiscoverGenreSlugs } from "@/lib/feature-data";
import { pluralize } from "@/lib/text";

export default async function DiscoverIndexPage() {
  const slugs = await getDiscoverGenreSlugs();
  const genres = (
    await Promise.all(slugs.map((slug) => getDiscoverGenreData(slug)))
  ).filter((genre): genre is NonNullable<typeof genre> => Boolean(genre));

  return (
    <div className="route-shell">
      <section className="route-intro">
        <SplitHeading
          kicker="Mood discovery"
          leadTitle="Discover"
          outlineTitle="Genres"
          description="Editorial landing pages for the moods and tones that show up across the SoundScene catalog."
        />
        <RouteMeta
          items={[
            pluralize(genres.length, "landing page"),
            "Curated mood hubs",
            "Songs and titles",
          ]}
        />
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {genres.map((genre) => (
          <Link
            key={genre.slug}
            href={`/discover/${genre.slug}`}
            className="hover-card group flex h-full flex-col"
          >
            <div className="route-surface flex flex-1 flex-col py-5">
              <p className="route-kicker">Mood page</p>
              <h2 className="card-heading clamp-2 mt-2 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
                {genre.name}
              </h2>
              <p className="clamp-3 mt-3 min-h-[4.8rem] font-body text-base leading-relaxed text-[color:var(--muted)]">
                {genre.description}
              </p>
              <p className="mt-auto pt-4 font-body text-sm text-black/58">
                {pluralize(genre.songs.length, "song")} · {pluralize(genre.titles.length, "title")}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
