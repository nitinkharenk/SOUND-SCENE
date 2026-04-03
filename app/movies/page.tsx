import Link from "next/link";
import { MovieCatalogControls } from "@/components/movie-catalog-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { contentItems } from "@/lib/discovery";

const PAGE_SIZE = 12;

const movies = [...contentItems]
  .filter((item) => item.type === "movie")
  .sort(
    (left, right) =>
      right.year - left.year || Number(right.rating) - Number(left.rating),
  );

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

function sortMovies(items: typeof movies, sort: MovieSort) {
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

  const genres = [...new Set(movies.flatMap((movie) => movie.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
  const platforms = [...new Set(movies.map((movie) => movie.meta.split(" · ").slice(1).join(" · ")))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const years = [...new Set(movies.map((movie) => String(movie.year)))].sort(
    (a, b) => Number(b) - Number(a),
  );

  const filteredMovies = sortMovies(
    movies.filter((movie) => {
      const matchesQuery = query
        ? [movie.title, movie.description, movie.meta, movie.year, ...movie.genres]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesGenre = genre ? movie.genres.includes(genre) : true;
      const matchesPlatform = platform ? movie.meta.includes(platform) : true;
      const matchesYear = year ? String(movie.year) === year : true;

      return matchesQuery && matchesGenre && matchesPlatform && matchesYear;
    }),
    sort,
  );

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleMovies = filteredMovies.slice(pageStart, pageStart + PAGE_SIZE);
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
              `${filteredMovies.length} results`,
              `Page ${currentPage} of ${totalPages}`,
              "Advanced movie filters",
            ]}
          />
        </div>

        <MovieCatalogControls genres={genres} platforms={platforms} years={years} />
      </section>

      {visibleMovies.length > 0 ? (
        <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleMovies.map((movie) => (
            <Link key={movie.slug} href={movie.href} className="hover-card group block">
              <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div className="pt-5">
                <span className="route-tag">{movie.genres[0] ?? movie.label}</span>
                <h2 className="hover-card-title card-heading mt-3 text-2xl font-semibold leading-tight text-black">
                  {movie.title}
                </h2>
                <p className="mt-2 font-body text-sm font-normal text-black/58">
                  {movie.year} · {movie.meta}
                </p>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
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
        </section>
      )}

      {filteredMovies.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredMovies.length)} of{" "}
            {filteredMovies.length} movies
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

            {visiblePages.map((page) => (
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
            ))}

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
