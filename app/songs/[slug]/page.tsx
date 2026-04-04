import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMeta, RouteTagList, SplitHeading } from "@/components/route-heading";
import {
  getRelatedSongs,
  getSongBySlug,
  getStaticSongParams,
} from "@/lib/content-store";
import { getSongCategory } from "@/lib/song-presentation";
import { pluralize, slugifyLabel } from "@/lib/text";

type SongDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getStaticSongParams();
}

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  const relatedSongs = await getRelatedSongs(song.slug);
  const primaryAppearance = song.appearances[0];
  const songCategory = getSongCategory(song.mood);

  return (
    <div className="route-shell">
      <section className="grid gap-12 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="route-intro">
          <SplitHeading
            kicker="Song detail"
            leadTitle={song.title}
            outlineTitle="Track"
            mode="detail"
            description={song.mood}
          />
          <RouteMeta items={[song.artist, pluralize(song.appearances.length, "appearance")]} />
          <div className="mt-6">
            <RouteTagList
              items={[
                {
                  label: songCategory,
                  href: `/songs?category=${encodeURIComponent(songCategory)}`,
                },
              ]}
              tone="accent"
            />
          </div>
          {primaryAppearance ? (
            <div className="mt-6 rounded-[0.9rem] border border-[color:var(--line)] bg-accent-subtle p-4">
              <p className="route-kicker">Heard in</p>
              <p className="mt-2 font-body text-base leading-relaxed text-[color:var(--foreground)]">
                {primaryAppearance.contentTitle}
                {primaryAppearance.seasonNumber && primaryAppearance.episodeNumber
                  ? ` · S${primaryAppearance.seasonNumber}E${primaryAppearance.episodeNumber}`
                  : ""}
                {" · "}
                Scene: {primaryAppearance.sceneType}
                {primaryAppearance.timestamp ? `, ${primaryAppearance.timestamp}` : ""}
              </p>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/artists/${slugifyLabel(song.artist)}`} className="route-action focus-ring">
              View Artist Profile
            </Link>
          </div>
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
                key={`${appearance.contentSlug}-${appearance.timestamp ?? "untimed"}-${appearance.sceneType}`}
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
                    {appearance.timestamp ?? appearance.sceneType}
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
                  {pluralize(relatedSong.appearances.length, "appearance")}
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
