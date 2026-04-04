import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getArtistProfileBySlug, getArtistProfiles } from "@/lib/feature-data";
import { pluralize } from "@/lib/text";

type ArtistPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const artists = await getArtistProfiles();
  return artists.map((artist) => ({ slug: artist.slug }));
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtistProfileBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <div className="route-shell">
      <section className="route-intro lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <SplitHeading
            kicker="Artist profile"
            leadTitle={artist.name}
            outlineTitle="Soundtracks"
            mode="detail"
            description="Every mapped movie and series appearance for this artist, grouped into one soundtrack profile."
          />
          <RouteMeta
            items={[
              pluralize(artist.songs.length, "song"),
              pluralize(artist.soundtrackCount, "soundtrack"),
              pluralize(artist.appearancesCount, "appearance"),
            ]}
          />
        </div>

        <div className="route-surface py-5">
          <p className="route-kicker">Appears in</p>
          <div className="mt-4 space-y-3">
            {artist.titles.slice(0, 6).map((title) => (
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        {artist.songs.map((song) => (
          <div key={song.slug} className="route-surface py-5">
            <p className="route-kicker">
              {pluralize(song.appearances.length, "appearance")}
            </p>
            <Link href={`/songs/${song.slug}`}>
              <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black transition-colors duration-200 hover:text-accent-hover">
                {song.title}
              </h2>
            </Link>
            <p className="mt-2 font-body text-base text-[color:var(--muted)]">{song.mood}</p>
            <div className="mt-5 space-y-3">
              {song.appearances.slice(0, 4).map((appearance) => (
                <Link
                  key={`${song.slug}-${appearance.contentSlug}-${appearance.timestamp ?? "untimed"}-${appearance.sceneType}`}
                  href={`/${appearance.contentType === "movie" ? "movies" : "series"}/${appearance.contentSlug}`}
                  className="route-row-link grid-cols-[1fr]"
                >
                  <div>
                    <p className="route-kicker text-[0.72rem]">
                      {appearance.contentTitle}
                      {appearance.seasonNumber && appearance.episodeNumber
                        ? ` · S${appearance.seasonNumber}E${appearance.episodeNumber}`
                        : ""}
                    </p>
                    <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
                      {appearance.timestamp
                        ? `${appearance.timestamp} · ${appearance.sceneType}`
                        : appearance.sceneType}
                    </p>
                    <p className="mt-3 font-body text-base leading-relaxed text-black/68">
                      {appearance.sceneDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
