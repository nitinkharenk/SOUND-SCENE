import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesSceneMap } from "@/components/series-scene-map";
import { TimestampLookup } from "@/components/timestamp-lookup";
import { RouteMeta, RouteTagList, SplitHeading } from "@/components/route-heading";
import { getSeriesBySlug, getStaticSeriesParams } from "@/lib/content-store";
import { hasParseableTimestamp, pluralize } from "@/lib/text";

type SeriesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  try {
    return await getStaticSeriesParams();
  } catch {
    return [];
  }
}

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

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
  const totalCues = flattenedSongs.length;
  const hasTimestampLookup = flattenedSongs.some((item) => hasParseableTimestamp(item.timestamp));

  return (
    <div className="route-shell">
      <section className="route-intro lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-12">
        <div>
          <SplitHeading
            kicker="Series soundtrack guide"
            leadTitle={series.title}
            outlineTitle="Episodes"
            mode="detail"
            description={series.description}
          />
          <RouteMeta
            items={[
              series.year,
              pluralize(series.seasonsCount, "season"),
              pluralize(totalEpisodes, "episode"),
              series.platform,
              `Rating ${series.rating}`,
            ]}
          />
          <div className="mt-6">
            <RouteTagList
              items={series.genres.map((genre) => ({
                label: genre,
                href: `/series?genre=${encodeURIComponent(genre)}`,
              }))}
              tone="accent"
            />
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
                {totalCues}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 space-y-14">
        {hasTimestampLookup ? (
          <section>
            <TimestampLookup contentTitle={series.title} items={flattenedSongs} />
          </section>
        ) : null}

        <section>
          <SeriesSceneMap seasons={series.seasons} />
        </section>
      </section>
    </div>
  );
}
