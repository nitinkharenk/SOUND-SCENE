import Link from "next/link";
import { CatalogBrowseControls } from "@/components/catalog-browse-controls";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { buildBrowseHref, getVisiblePages, normalizeParam } from "@/lib/browse";
import { songItems } from "@/lib/discovery";

const PAGE_SIZE = 12;

const songs = [...songItems].sort(
  (left, right) =>
    right.appearances.length - left.appearances.length || right.year - left.year,
);

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

function sortSongs(items: typeof songs, sort: SongSort) {
  const sorted = [...items];

  if (sort === "newest") {
    return sorted.sort((left, right) => right.year - left.year || right.title.localeCompare(left.title));
  }

  if (sort === "oldest") {
    return sorted.sort((left, right) => left.year - right.year || left.title.localeCompare(right.title));
  }

  if (sort === "title") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sorted.sort(
    (left, right) =>
      right.appearances.length - left.appearances.length || right.year - left.year,
  );
}

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

  const categories = [...new Set(songs.map((song) => song.category))].sort((a, b) =>
    a.localeCompare(b),
  );
  const formats = [...new Set(songs.map((song) => song.relatedType))].sort((a, b) =>
    a.localeCompare(b),
  );
  const artists = [...new Set(songs.map((song) => song.artist))].sort((a, b) =>
    a.localeCompare(b),
  );
  const years = [...new Set(songs.filter((song) => song.year > 0).map((song) => String(song.year)))].sort(
    (a, b) => Number(b) - Number(a),
  );

  const filteredSongs = sortSongs(
    songs.filter((song) => {
      const matchesQuery = query
        ? [
            song.title,
            song.artist,
            song.mood,
            song.relatedTitle,
            song.relatedType,
            song.category,
            song.year,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesCategory = category ? song.category === category : true;
      const matchesFormat = format ? song.relatedType === format : true;
      const matchesArtist = artist ? song.artist === artist : true;
      const matchesYear = year ? String(song.year) === year : true;

      return matchesQuery && matchesCategory && matchesFormat && matchesArtist && matchesYear;
    }),
    sort,
  );

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleSongs = filteredSongs.slice(pageStart, pageStart + PAGE_SIZE);
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
              `${filteredSongs.length} songs`,
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
            { param: "format", label: "Format", allLabel: "All formats", options: formats },
            { param: "artist", label: "Artist", allLabel: "All artists", options: artists },
            { param: "year", label: "Year", allLabel: "All years", options: years },
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
        <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleSongs.map((song) => (
            <Link key={song.slug} href={song.href} className="hover-card group block">
              <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                <img
                  src={song.image}
                  alt={song.title}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div className="pt-5">
                <span className="route-tag">{song.category}</span>
                <h2 className="hover-card-title card-heading mt-3 text-2xl font-semibold leading-tight text-black">
                  {song.title}
                </h2>
                <p className="mt-2 font-card text-base font-medium text-black/74">{song.artist}</p>
                <p className="mt-3 font-body text-sm font-normal text-black/58">
                  {song.appearances.length} appearances · {song.relatedTitle}
                </p>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
                  {song.mood}
                </p>
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
        </section>
      )}

      {filteredSongs.length > PAGE_SIZE ? (
        <section className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm font-normal text-[color:var(--muted)]">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredSongs.length)} of{" "}
            {filteredSongs.length} songs
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

            {visiblePages.map((page) => (
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
            ))}

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
