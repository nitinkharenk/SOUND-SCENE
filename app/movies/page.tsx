import Link from "next/link";
import { MovieCatalogControls } from "@/components/movie-catalog-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { getCatalogCards, getCatalogCardCount, getTitleFilterOptions } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

const PAGE_SIZE = 12;

type MoviesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    genre?: string | string[];
    platform?: string | string[];
    year?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type MovieSort = "newest" | "oldest" | "rating" | "title";

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  const genre = normalizeParam(params.genre).trim();
  const platform = normalizeParam(params.platform).trim();
  const year = normalizeParam(params.year).trim();
  const sortValue = normalizeParam(params.sort).trim() || "newest";
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const sort = (["newest", "oldest", "rating", "title"].includes(sortValue)
    ? sortValue
    : "newest") as MovieSort;

  const filterParams = {
    type: "movie" as const,
    query: query || undefined,
    genre: genre || undefined,
    platform: platform || undefined,
    year: year ? Number(year) : undefined,
  };

  const [totalCount, filterOptions, visibleMovies] = await Promise.all([
    getCatalogCardCount(filterParams),
    getTitleFilterOptions("movie"),
    getCatalogCards({
      ...filterParams,
      limit: PAGE_SIZE,
      skip: (Math.max(1, requestedPage) - 1) * PAGE_SIZE,
      sort,
    }),
  ]);

  const { genres, platforms, years } = filterOptions;

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
            outlineTitle="Movies"
            description="Search and filter the movie soundtrack catalog without loading every title onto the page at once."
          />
          <RouteMeta
            items={[
              pluralize(totalCount, "result"),
              `Page ${currentPage} of ${totalPages}`,
              "Advanced movie filters",
            ]}
          />
        </div>

        <MovieCatalogControls genres={genres} platforms={platforms} years={years} />
      </section>

      {visibleMovies.length > 0 ? (
        <section className="mt-12 route-surface">
          {visibleMovies.map((movie, index) => (
            <Link
              key={movie.slug}
              href={`/movies/${movie.slug}`}
              className="route-row-link sm:grid-cols-[72px_180px_1fr]"
            >
              <div className="font-heading text-4xl font-bold leading-none tracking-tight text-black/22">
                {String(pageStart + index + 1).padStart(2, "0")}
              </div>
              <div className="aspect-[1.08/0.86] overflow-hidden rounded-[0.42rem] bg-[#ede5da]">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div className="flex min-h-full flex-col">
                <p className="route-kicker text-[0.72rem]">
                  {movie.genres[0] ?? "Movie"} · {movie.year}
                  {movie.type === "movie" && movie.runtime ? ` · ${movie.runtime} · ${movie.platform}` : ""}
                </p>
                <h2 className="card-heading clamp-2 mt-2 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
                  {movie.title}
                </h2>
                <p className="clamp-1 mt-2 font-body text-sm font-normal text-black/58">
                  Rating {movie.rating} · {movie.type === "movie" ? movie.runtime : "Feature film"}
                </p>
                <p className="clamp-2 mt-3 min-h-[3.15rem] font-body text-base font-normal leading-relaxed text-black/64">
                  {movie.description}
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-12 rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 sm:p-8">
          <p className="route-kicker">No matches</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            No movies matched the current search and filter combination. Try another genre,
            platform, year, or keyword.
          </p>
          <div className="mt-5">
            <Link href="/movies" className="route-action route-action-primary">
              Clear all movie filters
            </Link>
          </div>
        </section>
      )}

      {totalCount > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, totalCount)} of{" "}
            {pluralize(totalCount, "movie")}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref(
                "/movies",
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

            {visiblePages.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 font-body text-sm text-[color:var(--muted)]">
                  ...
                </span>
              ) : (
                <Link
                  key={page}
                  href={buildBrowseHref(
                    "/movies",
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
              ),
            )}

            <Link
              href={buildBrowseHref(
                "/movies",
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
