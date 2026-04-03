import Link from "next/link";
import { notFound } from "next/navigation";
import { SoundtrackList } from "@/components/soundtrack-list";
import { RouteMeta, RouteTagList, SplitHeading } from "@/components/route-heading";
import { getContentBySlug, getStaticSeriesParams } from "@/lib/catalog";

type SeriesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getStaticSeriesParams();
}

function EpisodeCard({
  seasonNumber,
  episodeNumber,
  title,
  summary,
  songs,
}: {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  summary: string;
  songs: Array<{
    order: number;
    timestamp: string;
    sceneDescription: string;
    song: {
      slug: string;
      title: string;
      artist: string;
      mood: string;
      youtubeLink: string;
      spotifyLink: string;
    };
  }>;
}) {
  return (
    <section className="route-divider pt-6 first:border-t-0 first:pt-0">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="route-kicker">
            Season {seasonNumber} · Episode {episodeNumber}
          </p>
          <h4 className="card-heading mt-2 text-[1.7rem] font-semibold leading-[1.04] text-black">
            {title}
          </h4>
        </div>
        <div className="route-tag-list">
          <span className="route-tag">{songs.length} cues</span>
          <span className="route-tag">{songs[0]?.song.title ?? "Soundtrack update"}</span>
        </div>
      </div>

      <p className="mb-6 max-w-3xl font-body text-base font-normal leading-relaxed text-black/62">
        {summary}
      </p>

      <SoundtrackList
        items={songs.map((song) => ({
          ...song,
          seasonNumber,
          episodeNumber,
          episodeTitle: title,
        }))}
        showEpisode
        variant="bulletin"
      />
    </section>
  );
}

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { slug } = await params;
  const series = getContentBySlug("series", slug);

  if (!series) {
    notFound();
  }

  const flattenedSongs = series.seasons.flatMap((season) =>
    season.episodes.flatMap((episode) =>
      episode.songs.map((song) => ({
        ...song,
        seasonNumber: season.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
      })),
    ),
  );

  const totalEpisodes = series.seasons.reduce(
    (count, season) => count + season.episodes.length,
    0,
  );

  return (
    <div className="route-shell">
      <section className="route-intro lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-12">
        <div>
          <SplitHeading
            kicker="Series soundtrack guide"
            leadTitle={series.title}
            outlineTitle="Episodes"
            description={series.description}
          />
          <RouteMeta
            items={[
              series.year,
              `${series.seasonsCount} seasons`,
              `${totalEpisodes} episodes`,
              series.platform,
              `Rating ${series.rating}`,
            ]}
          />
          <div className="mt-6">
            <RouteTagList items={series.genres} tone="accent" />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/series" className="route-action focus-ring">
              All Series
            </Link>
            <Link href="/series/episodes" className="route-action route-action-primary focus-ring">
              All Episodes
            </Link>
          </div>
        </div>

        <div className="space-y-5 lg:mt-3">
          <div className="route-thumb aspect-[1.24/0.88]">
            <img src={series.backdrop} alt={series.title} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[0.7rem] border border-black/8 bg-accent-subtle px-4 py-4">
              <p className="route-kicker">Seasons</p>
              <p className="mt-2 font-card text-3xl font-semibold text-black">
                {series.seasonsCount}
              </p>
            </div>
            <div className="rounded-[0.7rem] border border-black/8 bg-accent-subtle px-4 py-4">
              <p className="route-kicker">Episodes</p>
              <p className="mt-2 font-card text-3xl font-semibold text-black">
                {totalEpisodes}
              </p>
            </div>
            <div className="rounded-[0.7rem] border border-black/8 bg-accent-subtle px-4 py-4">
              <p className="route-kicker">Song Cues</p>
              <p className="mt-2 font-card text-3xl font-semibold text-black">
                {flattenedSongs.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-12 xl:grid-cols-[1.24fr_0.76fr]">
        <div>
          <div className="mb-7">
            <SplitHeading
              kicker="Episode-level breakdown"
              leadTitle="Season"
              outlineTitle="Map"
              compact
            />
          </div>

          <div className="space-y-12">
            {series.seasons.map((season) => (
              <section key={season.seasonNumber}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="route-kicker">Season {season.seasonNumber}</p>
                    <h3 className="card-heading mt-2 text-3xl font-semibold leading-tight text-black">
                      {season.episodes.length} mapped episodes
                    </h3>
                  </div>
                  <p className="font-body text-sm font-normal text-black/54">
                    {season.episodes.reduce((count, episode) => count + episode.songs.length, 0)} total cues
                  </p>
                </div>

                <div className="grid gap-8 xl:grid-cols-2">
                  {season.episodes.map((episode) => (
                    <EpisodeCard
                      key={`${season.seasonNumber}-${episode.episodeNumber}`}
                      seasonNumber={season.seasonNumber}
                      episodeNumber={episode.episodeNumber}
                      title={episode.title}
                      summary={episode.summary}
                      songs={episode.songs}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="space-y-10">
          <section>
            <div className="mb-6">
              <SplitHeading
                kicker="Season navigator"
                leadTitle="Jump To"
                outlineTitle="Seasons"
                compact
              />
            </div>
            <div className="route-surface px-1 py-5">
              <div className="route-tag-list">
                {series.seasons.map((season) => (
                  <span key={season.seasonNumber} className="route-tag">
                    Season {season.seasonNumber}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6">
              <SplitHeading
                kicker="Full index"
                leadTitle="Series-Wide"
                outlineTitle="Playlist"
                compact
              />
            </div>
            <SoundtrackList items={flattenedSongs} showEpisode variant="bulletin" />
          </section>
        </aside>
      </section>
    </div>
  );
}
