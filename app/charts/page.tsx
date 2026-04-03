import Link from "next/link";
import { CatalogBrowseControls } from "@/components/catalog-browse-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { contentItems, songItems } from "@/lib/discovery";

const PAGE_SIZE = 12;

type ChartType = "Song" | "Movie" | "Series";

type ChartEntry = {
  slug: string;
  title: string;
  href: string;
  image: string;
  type: ChartType;
  category: string;
  year: number;
  primaryMetric: number;
  secondaryMetric: number;
  meta: string;
  subMeta: string;
};

const chartEntries: ChartEntry[] = [
  ...songItems.map((song) => ({
    slug: song.slug,
    title: song.title,
    href: song.href,
    image: song.image,
    type: "Song" as const,
    category: song.category,
    year: song.year,
    primaryMetric: song.appearances.length,
    secondaryMetric: song.year,
    meta: `${song.artist} · ${song.relatedTitle}`,
    subMeta: `${song.appearances.length} appearances`,
  })),
  ...contentItems
    .filter((item) => item.type === "movie")
    .map((movie) => ({
      slug: movie.slug,
      title: movie.title,
      href: movie.href,
      image: movie.poster,
      type: "Movie" as const,
      category: movie.genres[0] ?? movie.label,
      year: movie.year,
      primaryMetric: Number(movie.rating),
      secondaryMetric: movie.year,
      meta: `${movie.year} · Rating ${movie.rating}`,
      subMeta: movie.meta,
    })),
  ...contentItems
    .filter((item) => item.type === "series")
    .map((series) => ({
      slug: series.slug,
      title: series.title,
      href: series.href,
      image: series.poster,
      type: "Series" as const,
      category: series.genres[0] ?? series.label,
      year: series.year,
      primaryMetric: Number(series.rating),
      secondaryMetric: series.year,
      meta: `${series.year} · Rating ${series.rating}`,
      subMeta: series.meta,
    })),
];

type ChartsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    category?: string | string[];
    year?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type ChartSort = "rank" | "newest" | "oldest" | "title";

function sortCharts(items: ChartEntry[], sort: ChartSort) {
  const sorted = [...items];

  if (sort === "newest") {
    return sorted.sort((left, right) => right.year - left.year || right.primaryMetric - left.primaryMetric);
  }

  if (sort === "oldest") {
    return sorted.sort((left, right) => left.year - right.year || right.primaryMetric - left.primaryMetric);
  }

  if (sort === "title") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sorted.sort(
    (left, right) =>
      right.primaryMetric - left.primaryMetric || right.secondaryMetric - left.secondaryMetric,
  );
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  const type = normalizeParam(params.type).trim();
  const category = normalizeParam(params.category).trim();
  const year = normalizeParam(params.year).trim();
  const sortValue = normalizeParam(params.sort).trim() || "rank";
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const sort = (["rank", "newest", "oldest", "title"].includes(sortValue)
    ? sortValue
    : "rank") as ChartSort;

  const types = [...new Set(chartEntries.map((entry) => entry.type))];
  const categories = [...new Set(chartEntries.map((entry) => entry.category))].sort((a, b) =>
    a.localeCompare(b),
  );
  const years = [...new Set(chartEntries.filter((entry) => entry.year > 0).map((entry) => String(entry.year)))].sort(
    (a, b) => Number(b) - Number(a),
  );

  const filteredCharts = sortCharts(
    chartEntries.filter((entry) => {
      const matchesQuery = query
        ? [entry.title, entry.type, entry.category, entry.meta, entry.subMeta, entry.year]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesType = type ? entry.type === type : true;
      const matchesCategory = category ? entry.category === category : true;
      const matchesYear = year ? String(entry.year) === year : true;

      return matchesQuery && matchesType && matchesCategory && matchesYear;
    }),
    sort,
  );

  const totalPages = Math.max(1, Math.ceil(filteredCharts.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleCharts = filteredCharts.slice(pageStart, pageStart + PAGE_SIZE);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Platform rankings"
            leadTitle="SoundScene"
            outlineTitle="Charts"
            description="Search and filter the ranking pages without dumping every chartable song, movie, and series entry into one static view."
          />
          <RouteMeta
            items={[
              `${filteredCharts.length} ranked entries`,
              `Page ${currentPage} of ${totalPages}`,
              "Songs, movies, and series",
            ]}
          />
        </div>

        <CatalogBrowseControls
          activeLabel="Charts"
          searchLabel="Search chart entries by title, type, category, or ranking metadata"
          searchPlaceholder="Search chart titles, artists, categories, or years"
          filters={[
            { param: "type", label: "Type", allLabel: "All types", options: types },
            { param: "category", label: "Category", allLabel: "All categories", options: categories },
            { param: "year", label: "Year", allLabel: "All years", options: years },
          ]}
          sortOptions={[
            { value: "rank", label: "Top ranked" },
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "A-Z" },
          ]}
          defaultSort="rank"
        />
      </section>

      {visibleCharts.length > 0 ? (
        <section className="mt-12 route-surface">
          {visibleCharts.map((entry, index) => (
            <Link
              key={`${entry.type}-${entry.slug}`}
              href={entry.href}
              className="route-row-link sm:grid-cols-[64px_140px_1fr]"
            >
              <div className="font-heading text-4xl font-bold leading-none tracking-tight text-black/22">
                {String(pageStart + index + 1).padStart(2, "0")}
              </div>
              <div className="aspect-[1.18/0.76] overflow-hidden rounded-[0.38rem] bg-[#ede5da]">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="route-kicker text-[0.72rem]">
                  {entry.type} · {entry.category}
                </p>
                <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                  {entry.title}
                </h2>
                <p className="mt-2 font-body text-sm font-normal text-black/58">{entry.meta}</p>
                <p className="mt-2 font-body text-sm font-normal text-black/58">{entry.subMeta}</p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-12 rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 sm:p-8">
          <p className="route-kicker">No matches</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            No chart entries matched the current search and filter combination. Try a different
            type, category, year, or keyword.
          </p>
        </section>
      )}

      {filteredCharts.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredCharts.length)} of{" "}
            {filteredCharts.length} chart entries
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref(
                "/charts",
                {
                  q: query,
                  type,
                  category,
                  year,
                  sort,
                  page: Math.max(1, currentPage - 1),
                },
                { defaultSort: "rank" },
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
                  "/charts",
                  {
                    q: query,
                    type,
                    category,
                    year,
                    sort,
                    page,
                  },
                  { defaultSort: "rank" },
                )}
                className={page === currentPage ? "route-action route-action-primary" : "route-action"}
              >
                {page}
              </Link>
            ))}

            <Link
              href={buildBrowseHref(
                "/charts",
                {
                  q: query,
                  type,
                  category,
                  year,
                  sort,
                  page: Math.min(totalPages, currentPage + 1),
                },
                { defaultSort: "rank" },
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
