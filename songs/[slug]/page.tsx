import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getRelatedSongs, getSongBySlug, getStaticSongParams } from "@/lib/catalog";

type SongDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getStaticSongParams();
}

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const { slug } = await params;
  const song = getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  const relatedSongs = getRelatedSongs(song.slug);

  return (
    <div className="route-shell">
      <section className="grid gap-12 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="route-intro">
          <SplitHeading
            kicker="Song detail"
            leadTitle={song.title}
            outlineTitle="Track"
            description={song.mood}
          />
          <RouteMeta items={[song.artist, `${song.appearances.length} appearances`]} />
          <div className="flex flex-wrap gap-2">
            <a
              href={song.youtubeLink}
              target="_blank"
              rel="noreferrer"
              className="route-action route-action-primary"
            >
              Watch on YouTube
            </a>
            <a
              href={song.spotifyLink}
              target="_blank"
              rel="noreferrer"
              className="route-action"
            >
              Open Spotify
            </a>
          </div>
        </div>

        <div>
          <div className="mb-6">
            <SplitHeading
              kicker="Scene appearances"
              leadTitle="Where It"
              outlineTitle="Hits"
              compact
            />
          </div>
          {/* Keep Syne section headings at least 12px larger than nearby Cabinet timestamp titles. */}
          <div className="route-surface">
            {song.appearances.map((appearance) => (
              <Link
                key={`${appearance.contentSlug}-${appearance.timestamp}`}
                href={`/${
                  appearance.contentType === "movie" ? "movies" : "series"
                }/${appearance.contentSlug}`}
                className="route-row-link"
              >
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {appearance.contentTitle}
                    {appearance.seasonNumber && appearance.episodeNumber
                      ? ` · S${appearance.seasonNumber}E${appearance.episodeNumber}`
                      : ""}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {appearance.timestamp}
                  </h2>
                  <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/62">
                    {appearance.sceneDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6">
          <SplitHeading
            kicker="Related songs"
            leadTitle="Keep"
            outlineTitle="Listening"
            compact
          />
        </div>

        {/* Keep Syne section headings at least 12px larger than nearby Cabinet related-song titles. */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {relatedSongs.map((relatedSong) => (
            <Link
              key={relatedSong.slug}
              href={`/songs/${relatedSong.slug}`}
              className="hover-card group block"
            >
              <div className="route-surface py-5">
                <p className="route-kicker text-[0.72rem]">
                  {relatedSong.appearances.length} appearances
                </p>
                <h3 className="hover-card-title card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                  {relatedSong.title}
                </h3>
                <p className="mt-2 font-card text-base font-medium text-[#4f856d]">
                  {relatedSong.artist}
                </p>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/62">
                  {relatedSong.mood}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
