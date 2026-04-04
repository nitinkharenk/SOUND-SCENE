import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMeta, SplitHeading, RouteTagList } from "@/components/route-heading";
import { getDiscoverGenreData, getDiscoverGenreSlugs } from "@/lib/feature-data";
import { pluralize } from "@/lib/text";

type DiscoverGenrePageProps = {
  params: Promise<{
    genre: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const genres = await getDiscoverGenreSlugs();
    return genres.map((genre: string) => ({ genre }));
  } catch {
    return [];
  }
}

export default async function DiscoverGenrePage({ params }: DiscoverGenrePageProps) {
  const { genre } = await params;
  const page = await getDiscoverGenreData(genre);

  if (!page) {
    notFound();
  }

  return (
    <div className="route-shell">
      <section className="route-intro lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div>
          <SplitHeading
            kicker="Mood discovery"
            leadTitle={page.name}
            outlineTitle="Sound"
            mode="detail"
            description={page.description}
          />
          <RouteMeta
            items={[
              pluralize(page.songs.length, "song"),
              pluralize(page.titles.length, "title"),
              "Editorial mood landing",
            ]}
          />
          <div className="mt-6">
            <RouteTagList items={[page.name, "Discovery", "Editorial"]} tone="accent" />
          </div>
        </div>

        {page.featuredSong ? (
          <div className="route-surface py-5">
            <p className="route-kicker">Featured song</p>
            <Link href={`/songs/${page.featuredSong.slug}`}>
              <h2 className="card-heading mt-2 text-3xl font-semibold leading-tight text-black transition-colors duration-200 hover:text-accent-hover">
                {page.featuredSong.title}
              </h2>
            </Link>
            <p className="mt-2 font-card text-base font-medium text-black/74">
              {page.featuredSong.artist}
            </p>
            <p className="mt-3 font-body text-base leading-relaxed text-[color:var(--muted)]">
              {page.featuredSong.mood}
            </p>
            {page.featuredTitle ? (
              <p className="mt-4 font-body text-sm text-[color:var(--muted)]">
                Featured in {page.featuredTitle.title} ({page.featuredTitle.year})
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="route-surface py-5">
          <p className="route-kicker">Top songs</p>
          <div className="mt-4 space-y-3">
            {page.songs.slice(0, 12).map((song) => (
              <Link key={song.slug} href={`/songs/${song.slug}`} className="route-row-link grid-cols-[1fr]">
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {song.artist} · {pluralize(song.appearances.length, "appearance")}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {song.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="route-surface py-5">
          <p className="route-kicker">Featured titles</p>
          <div className="mt-4 space-y-3">
            {page.titles.slice(0, 10).map((title) => (
              <Link
                key={title.slug}
                href={`/${title.type === "movie" ? "movies" : "series"}/${title.slug}`}
                className="route-row-link grid-cols-[1fr]"
              >
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {title.type === "movie" ? "Movie" : "Series"} · {title.year}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {title.title}
                  </h2>
                  <p className="mt-3 font-body text-base leading-relaxed text-[color:var(--muted)]">
                    {title.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
