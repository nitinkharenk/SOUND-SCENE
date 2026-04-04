import Link from "next/link";
import { CatalogBrowseControls } from "@/components/catalog-browse-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { getSongCards, getSongCardCount, getSongFilterOptions } from "@/lib/content-store";
import { getSongCategory, resolveSongArtwork } from "@/lib/song-presentation";
import { pluralize } from "@/lib/text";

const PAGE_SIZE = 12;

type SongsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    format?: string | string[];
    artist?: string | string[];
    year?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type SongSort = "appearances" | "newest" | "oldest" | "title";

export default async function SongsPage({ searchParams }: SongsPageProps) {
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  const category = normalizeParam(params.category).trim();
  const format = normalizeParam(params.format).trim();
  const artist = normalizeParam(params.artist).trim();
  const year = normalizeParam(params.year).trim();
  const sortValue = normalizeParam(params.sort).trim() || "appearances";
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const sort = (["appearances", "newest", "oldest", "title"].includes(sortValue)
    ? sortValue
    : "appearances") as SongSort;

  const filterParams = {
    query: query || undefined,
    category: category || undefined,
    artist: artist || undefined,
    year: year ? Number(year) : undefined,
  };

  const [totalCount, filterOptions, visibleSongs] = await Promise.all([
    getSongCardCount(filterParams),
    getSongFilterOptions(),
    getSongCards({
      ...filterParams,
      limit: PAGE_SIZE,
      skip: (Math.max(1, requestedPage) - 1) * PAGE_SIZE,
      appearanceLimit: 1,
      sort,
    }),
  ]);

  const { categories, artists } = filterOptions;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Browse catalog"
            leadTitle="All"
            outlineTitle="Songs"
            description="Search the soundtrack library by song, artist, format, category, and year instead of loading the full music catalog in one pass."
          />
          <RouteMeta
            items={[
              pluralize(totalCount, "song"),
              `Page ${currentPage} of ${totalPages}`,
              "Scene-linked soundtrack library",
            ]}
          />
        </div>

        <CatalogBrowseControls
          activeLabel="Songs"
          searchLabel="Search songs by title, artist, category, title match, or year"
          searchPlaceholder="Search songs, artists, moods, titles, or years"
          filters={[
            { param: "category", label: "Category", allLabel: "All categories", options: categories },
            { param: "artist", label: "Artist", allLabel: "All artists", options: artists },
          ]}
          sortOptions={[
            { value: "appearances", label: "Most appearances" },
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "A-Z" },
          ]}
          defaultSort="appearances"
        />
      </section>

      {visibleSongs.length > 0 ? (
        <section className="mt-12 route-surface">
          {visibleSongs.map((song, index) => (
            <Link
              key={song.slug}
              href={`/songs/${song.slug}`}
              className="route-row-link sm:grid-cols-[72px_180px_1fr]"
            >
              <div className="font-heading text-4xl font-bold leading-none tracking-tight text-black/22">
                {String(pageStart + index + 1).padStart(2, "0")}
              </div>
              <div className="aspect-[1.08/0.86] overflow-hidden rounded-[0.42rem] bg-[#ede5da]">
                <img
                  src={resolveSongArtwork({ artwork: song.artwork, category: getSongCategory(song.mood), mood: song.mood })}
                  alt={song.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div className="flex min-h-full flex-col">
                <p className="route-kicker text-[0.72rem]">
                  {getSongCategory(song.mood)}
                </p>
                <h2 className="card-heading clamp-2 mt-2 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
                  {song.title}
                </h2>
                <p className="clamp-1 mt-2 font-card text-base font-medium text-black/74">{song.artist}</p>
                <p className="clamp-1 mt-2 font-body text-sm font-normal text-black/58">
                  {pluralize(song.appearances.length, "appearance")}
                </p>
                <p className="clamp-2 mt-3 min-h-[3.15rem] font-body text-base font-normal leading-relaxed text-black/64">
                  {song.mood}
                </p>
                {song.appearances[0] ? (
                  <p className="clamp-2 mt-auto pt-3 font-body text-sm font-normal text-black/58">
                    First mapped cue: {song.appearances[0].contentTitle}
                    {song.appearances[0].seasonNumber && song.appearances[0].episodeNumber
                      ? ` · S${song.appearances[0].seasonNumber}E${song.appearances[0].episodeNumber}`
                      : ""}
                    {song.appearances[0].timestamp
                      ? ` · ${song.appearances[0].timestamp}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-12 rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 sm:p-8">
          <p className="route-kicker">No matches</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            No songs matched the current search and filter combination. Try another category,
            artist, format, year, or keyword.
          </p>
          <div className="mt-5">
            <Link href="/songs" className="route-action route-action-primary">
              Clear all song filters
            </Link>
          </div>
        </section>
      )}

      {totalCount > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, totalCount)} of{" "}
            {pluralize(totalCount, "song")}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref(
                "/songs",
                {
                  q: query,
                  category,
                  format,
                  artist,
                  year,
                  sort,
                  page: Math.max(1, currentPage - 1),
                },
                { defaultSort: "appearances" },
              )}
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
                  href={buildBrowseHref(
                    "/songs",
                    {
                      q: query,
                      category,
                      format,
                      artist,
                      year,
                      sort,
                      page,
                    },
                    { defaultSort: "appearances" },
                  )}
                  className={page === currentPage ? "route-action route-action-primary" : "route-action"}
                >
                  {page}
                </Link>
              ),
            )}

            <Link
              href={buildBrowseHref(
                "/songs",
                {
                  q: query,
                  category,
                  format,
                  artist,
                  year,
                  sort,
                  page: Math.min(totalPages, currentPage + 1),
                },
                { defaultSort: "appearances" },
              )}
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
