import Link from "next/link";
import { CatalogBrowseControls } from "@/components/catalog-browse-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { contentItems } from "@/lib/discovery";

const PAGE_SIZE = 12;

const seriesItems = [...contentItems]
  .filter((item) => item.type === "series")
  .sort(
    (left, right) =>
      right.year - left.year || Number(right.rating) - Number(left.rating),
  );

type SeriesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    genre?: string | string[];
    platform?: string | string[];
    year?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type SeriesSort = "newest" | "oldest" | "rating" | "title";

function sortSeries(items: typeof seriesItems, sort: SeriesSort) {
  const sorted = [...items];

  if (sort === "oldest") {
    return sorted.sort(
      (left, right) =>
        left.year - right.year || Number(right.rating) - Number(left.rating),
    );
  }

  if (sort === "rating") {
    return sorted.sort(
      (left, right) =>
        Number(right.rating) - Number(left.rating) || right.year - left.year,
    );
  }

  if (sort === "title") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sorted.sort(
    (left, right) =>
      right.year - left.year || Number(right.rating) - Number(left.rating),
  );
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  const genre = normalizeParam(params.genre).trim();
  const platform = normalizeParam(params.platform).trim();
  const year = normalizeParam(params.year).trim();
  const sortValue = normalizeParam(params.sort).trim() || "newest";
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const sort = (["newest", "oldest", "rating", "title"].includes(sortValue)
    ? sortValue
    : "newest") as SeriesSort;

  const genres = [...new Set(seriesItems.flatMap((series) => series.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
  const platforms = [...new Set(seriesItems.map((series) => series.meta.split(" · ").slice(1).join(" · ")))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const years = [...new Set(seriesItems.map((series) => String(series.year)))].sort(
    (a, b) => Number(b) - Number(a),
  );

  const filteredSeries = sortSeries(
    seriesItems.filter((series) => {
      const matchesQuery = query
        ? [series.title, series.description, series.meta, series.year, ...series.genres]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesGenre = genre ? series.genres.includes(genre) : true;
      const matchesPlatform = platform ? series.meta.includes(platform) : true;
      const matchesYear = year ? String(series.year) === year : true;

      return matchesQuery && matchesGenre && matchesPlatform && matchesYear;
    }),
    sort,
  );

  const totalPages = Math.max(1, Math.ceil(filteredSeries.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleSeries = filteredSeries.slice(pageStart, pageStart + PAGE_SIZE);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Browse catalog"
            leadTitle="All"
            outlineTitle="Series"
            description="Search and filter episode-mapped series guides without loading the full catalog into the page at once."
          />
          <RouteMeta
            items={[
              `${filteredSeries.length} entries`,
              `Page ${currentPage} of ${totalPages}`,
              "Episode mapped",
            ]}
          />
        </div>

        <CatalogBrowseControls
          activeLabel="Series"
          searchLabel="Search series by title, platform, genre, or year"
          searchPlaceholder="Search series titles, genres, platforms, or years"
          filters={[
            { param: "genre", label: "Genre", allLabel: "All genres", options: genres },
            { param: "platform", label: "Platform", allLabel: "All platforms", options: platforms },
            { param: "year", label: "Year", allLabel: "All years", options: years },
          ]}
          sortOptions={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "rating", label: "Top rated" },
            { value: "title", label: "A-Z" },
          ]}
        />
      </section>

      {visibleSeries.length > 0 ? (
        <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleSeries.map((series) => (
            <Link key={series.slug} href={series.href} className="hover-card group block">
              <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                <img
                  src={series.poster}
                  alt={series.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div className="pt-5">
                <span className="route-tag">{series.genres[0] ?? series.label}</span>
                <h2 className="hover-card-title card-heading mt-3 text-2xl font-semibold leading-tight text-black">
                  {series.title}
                </h2>
                <p className="mt-2 font-body text-sm font-normal text-black/58">
                  {series.year} · {series.meta}
                </p>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
                  {series.description}
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-12 rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 sm:p-8">
          <p className="route-kicker">No matches</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            No series matched the current search and filter combination. Try another genre,
            platform, year, or keyword.
          </p>
        </section>
      )}

      {filteredSeries.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredSeries.length)} of{" "}
            {filteredSeries.length} series
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref(
                "/series",
                {
                  q: query,
                  genre,
                  platform,
                  year,
                  sort,
                  page: Math.max(1, currentPage - 1),
                },
                { defaultSort: "newest" },
              )}
              aria-disabled={currentPage === 1}
              className={`route-action ${currentPage === 1 ? "pointer-events-none opacity-45" : ""}`}
            >
              Previous
            </Link>

            {visiblePages.map((page) => (
              <Link
                key={page}
                href={buildBrowseHref(
                  "/series",
                  {
                    q: query,
                    genre,
                    platform,
                    year,
                    sort,
                    page,
                  },
                  { defaultSort: "newest" },
                )}
                className={page === currentPage ? "route-action route-action-primary" : "route-action"}
              >
                {page}
              </Link>
            ))}

            <Link
              href={buildBrowseHref(
                "/series",
                {
                  q: query,
                  genre,
                  platform,
                  year,
                  sort,
                  page: Math.min(totalPages, currentPage + 1),
                },
                { defaultSort: "newest" },
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
