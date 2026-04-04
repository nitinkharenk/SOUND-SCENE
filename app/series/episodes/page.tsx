import Link from "next/link";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { getHomeEpisodeCards } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

const PAGE_SIZE = 12;

type SeriesEpisodesPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function SeriesEpisodesPage({
  searchParams,
}: SeriesEpisodesPageProps) {
  const rawEpisodes = await getHomeEpisodeCards(200);
  const weeklyEpisodes = rawEpisodes.map((episode) => ({
    id: `${episode.seriesSlug}-${episode.seasonNumber}-${episode.episodeNumber}-${episode.id}`,
    href: `/series/${episode.seriesSlug}`,
    image: episode.image,
    label: "Episode" as const,
    seriesTitle: episode.seriesTitle,
    episodeTitle: episode.episodeTitle,
    episodeCode: `S${episode.seasonNumber} · E${episode.episodeNumber}`,
    summary: episode.summary,
    songsCount: episode.songsCount,
    leadSong: episode.leadSong,
    year: episode.seriesYear,
  }));
  const params = await searchParams;
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const totalPages = Math.max(1, Math.ceil(weeklyEpisodes.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleEpisodes = weeklyEpisodes.slice(pageStart, pageStart + PAGE_SIZE);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Browse series"
            leadTitle="Series"
            outlineTitle="Episodes"
            description="Every mapped episode currently available in the SoundScene series catalog, with lead songs and series links."
          />
          <RouteMeta
            items={[
              pluralize(weeklyEpisodes.length, "episode"),
              `Page ${currentPage} of ${totalPages}`,
              "Scene mapped",
            ]}
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="route-surface">
          {visibleEpisodes.map((episode) => (
            <Link
              key={episode.id}
              href={episode.href}
              className="route-row-link sm:grid-cols-[180px_1fr]"
            >
              <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.38rem] bg-[#ede5da]">
                <img
                  src={episode.image}
                  alt={episode.seriesTitle}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  {episode.episodeCode} · {episode.seriesTitle}
                </p>
                <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                  {episode.episodeTitle}
                </h2>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
                  {episode.summary}
                </p>
                <p className="mt-3 font-body text-sm font-normal text-black/58">
                  {pluralize(episode.songsCount, "soundtrack cue")} · Lead song: {episode.leadSong}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {weeklyEpisodes.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, weeklyEpisodes.length)} of{" "}
            {pluralize(weeklyEpisodes.length, "episode")}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref("/series/episodes", { page: Math.max(1, currentPage - 1) })}
              aria-disabled={currentPage === 1}
              className={`route-action ${currentPage === 1 ? "pointer-events-none opacity-45" : ""}`}
            >
              Previous
            </Link>

            {visiblePages.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 font-body text-sm text-[color:var(--muted)]">
                  ...
                </span>
              ) : (
                <Link
                  key={page}
                  href={buildBrowseHref("/series/episodes", { page })}
                  className={page === currentPage ? "route-action route-action-primary" : "route-action"}
                >
                  {page}
                </Link>
              ),
            )}

            <Link
              href={buildBrowseHref("/series/episodes", { page: Math.min(totalPages, currentPage + 1) })}
              aria-disabled={currentPage === totalPages}
              className={`route-action ${
                currentPage === totalPages ? "pointer-events-none opacity-45" : ""
              }`}
            >
              Next
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
