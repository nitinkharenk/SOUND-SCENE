import Link from "next/link";
import { CatalogBrowseControls } from "@/components/catalog-browse-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import {
  getDiscoveryData,
  isSongItem,
  type DiscoveryItem,
} from "@/lib/discovery";
import { pluralize } from "@/lib/text";

const PAGE_SIZE = 12;

type NewReleasesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    year?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type ReleaseSort = "newest" | "oldest" | "title";

type ReleaseEntry = DiscoveryItem & {
  releaseType: "Movie" | "Series" | "Song";
};

function sortReleases(items: ReleaseEntry[], sort: ReleaseSort) {
  const sorted = [...items];

  if (sort === "oldest") {
    return sorted.sort((left, right) => left.year - right.year || left.title.localeCompare(right.title));
  }

  if (sort === "title") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sorted.sort((left, right) => right.year - left.year || left.title.localeCompare(right.title));
}

export default async function NewReleasesPage({ searchParams }: NewReleasesPageProps) {
  const { contentItems, songItems } = await getDiscoveryData();
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  const type = normalizeParam(params.type).trim();
  const year = normalizeParam(params.year).trim();
  const sortValue = normalizeParam(params.sort).trim() || "newest";
  const requestedPage = Number.parseInt(normalizeParam(params.page) || "1", 10);
  const sort = (["newest", "oldest", "title"].includes(sortValue)
    ? sortValue
    : "newest") as ReleaseSort;

  const releaseItems: ReleaseEntry[] = [
    ...contentItems.map((item) => ({
      ...item,
      releaseType: (item.type === "movie" ? "Movie" : "Series") as "Movie" | "Series",
    })),
    ...songItems.map((item) => ({
      ...item,
      releaseType: "Song" as const,
    })),
  ];

  const releaseEntries = sortReleases(
    releaseItems.filter((item) => {
      const matchesQuery = query
        ? [
            item.title,
            item.year,
            isSongItem(item) ? item.artist : item.description,
            isSongItem(item) ? item.relatedTitle : item.meta,
            ...(isSongItem(item) ? [item.category] : item.genres),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesType = type ? item.releaseType === type : true;
      const matchesYear = year ? String(item.year) === year : true;

      return matchesQuery && matchesType && matchesYear;
    }),
    sort,
  );

  const years = [
    ...new Set(releaseEntries.filter((item) => item.year > 0).map((item) => String(item.year))),
  ].sort((a, b) => Number(b) - Number(a));
  const totalPages = Math.max(1, Math.ceil(releaseEntries.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleEntries = releaseEntries.slice(pageStart, pageStart + PAGE_SIZE);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Fresh drops"
            leadTitle="New"
            outlineTitle="Releases"
            description="Browse the newest soundtrack-linked movies, series, and songs from one dedicated release feed."
          />
          <RouteMeta
            items={[
              pluralize(releaseEntries.length, "release"),
              `Page ${currentPage} of ${totalPages}`,
              "Movies, series, and songs",
            ]}
          />
        </div>

        <CatalogBrowseControls
          activeLabel="New Releases"
          searchLabel="Search releases by title, artist, type, or year"
          searchPlaceholder="Search releases, artists, titles, or years"
          filters={[
            {
              param: "type",
              label: "Type",
              allLabel: "All release types",
              options: ["Movie", "Series", "Song"],
            },
            {
              param: "year",
              label: "Year",
              allLabel: "All years",
              options: years,
            },
          ]}
          sortOptions={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "A-Z" },
          ]}
        />
      </section>

      {visibleEntries.length > 0 ? (
        <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleEntries.map((item) => {
            const href = item.href;
            const image = isSongItem(item) ? item.image : item.poster;
            const label = isSongItem(item) ? item.category : item.genres[0] ?? item.label;
            const secondary = isSongItem(item)
              ? `${item.artist} · ${item.relatedTitle}`
              : `${item.year} · ${item.meta}`;
            const description = isSongItem(item) ? item.mood : item.description;

            return (
              <Link
                key={`${item.releaseType}-${item.slug}`}
                href={href}
                className="hover-card group flex h-full flex-col"
              >
                <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                  <img
                    src={image}
                    alt={item.title}
                    className="hover-card-media h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="route-tag">{label}</span>
                    <span className="route-tag">{item.releaseType}</span>
                  </div>
                  <h2 className="hover-card-title card-heading clamp-2 mt-3 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
                    {item.title}
                  </h2>
                  <p className="clamp-2 mt-2 min-h-[2.6rem] font-body text-sm font-normal text-black/58">
                    {secondary}
                  </p>
                  <p className="clamp-2 mt-auto min-h-[3.15rem] pt-3 font-body text-base font-normal leading-relaxed text-black/64">
                    {description}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="mt-12 rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 sm:p-8">
          <p className="route-kicker">No matches</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            No releases matched the current search and filter combination. Try another type,
            year, or keyword.
          </p>
          <div className="mt-5">
            <Link href="/new-releases" className="route-action route-action-primary">
              Clear all release filters
            </Link>
          </div>
        </section>
      )}

      {releaseEntries.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, releaseEntries.length)} of{" "}
            {pluralize(releaseEntries.length, "release")}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildBrowseHref(
                "/new-releases",
                {
                  q: query,
                  type,
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
                    "/new-releases",
                    {
                      q: query,
                      type,
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
                "/new-releases",
                {
                  q: query,
                  type,
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
