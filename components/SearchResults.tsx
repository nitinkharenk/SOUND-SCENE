"use client";

import { useMemo } from "react";
import Link from "next/link";
import { searchCatalog, type CatalogEntry, type SongLibraryItem } from "@/lib/catalog";

interface SearchResultsProps {
  query: string;
  filters: string[];
}

function getFilteredContent(content: CatalogEntry[], filters: string[]) {
  if (filters.length === 0) {
    return content;
  }

  return content.filter((entry) => {
    if (entry.type === "movie") {
      return filters.includes("movies");
    }

    return filters.includes("tv");
  });
}

function getFilteredSongs(songs: SongLibraryItem[], filters: string[]) {
  if (filters.length === 0) {
    return songs;
  }

  return songs.filter(() => filters.includes("songs") || filters.includes("artists"));
}

export default function SearchResults({ query, filters }: SearchResultsProps) {
  const trimmedQuery = query.trim();
  const hasMinLength = trimmedQuery.length >= 3;
  const results = useMemo(
    () =>
      hasMinLength
        ? searchCatalog(trimmedQuery)
        : {
            content: [],
            songs: [],
          },
    [hasMinLength, trimmedQuery],
  );

  const contentResults = useMemo(
    () => getFilteredContent(results.content, filters),
    [filters, results.content],
  );
  const songResults = useMemo(
    () => getFilteredSongs(results.songs, filters),
    [filters, results.songs],
  );

  const showContent = filters.length === 0 || filters.includes("movies") || filters.includes("tv");
  const showSongs =
    filters.length === 0 || filters.includes("songs") || filters.includes("artists");
  const noMatches =
    (!showContent || contentResults.length === 0) && (!showSongs || songResults.length === 0);

  return (
    <div className="px-6 pt-4 text-foreground">
      {!hasMinLength ? (
        <p className="font-body text-sm text-[color:var(--muted)]">
          Type at least <span className="font-medium text-accent">3 characters</span> to search.
        </p>
      ) : null}

      {hasMinLength ? (
      <p className="font-body text-sm text-[color:var(--muted)]">
        Showing results for <span className="font-medium text-accent">"{trimmedQuery}"</span>
        {filters.length > 0 ? <span> in {filters.join(", ")}</span> : null}
      </p>
      ) : null}

      {hasMinLength && noMatches ? (
        <div className="py-8">
          <p className="font-body text-sm text-[color:var(--muted)]">
            No results yet. Try a different title, artist, or soundtrack keyword.
          </p>
        </div>
      ) : null}

      {hasMinLength && !noMatches ? (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr]">
          {showContent ? (
            <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/96">
              <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="route-kicker">Browse titles</p>
                  <h2 className="card-heading mt-2 text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.045em] text-foreground">
                    Title Matches
                  </h2>
                </div>
                <span className="route-kicker whitespace-nowrap">{contentResults.length} results</span>
              </div>
              <div className="space-y-2">
                {contentResults.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`}
                    className="grid gap-4 rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle sm:grid-cols-[108px_1fr]"
                  >
                    <div className="route-thumb aspect-[1.08/0.86]">
                      <img src={entry.poster} alt={entry.title} />
                    </div>
                    <div>
                      <p className="route-kicker text-[0.72rem]">
                        {entry.type} · {entry.year} · {entry.platform}
                      </p>
                      <h3 className="card-heading mt-2 text-[1.55rem] font-black leading-[1.04] tracking-[-0.045em] text-foreground">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-[0.96rem] leading-7 text-[color:var(--muted)]">
                        {entry.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {showSongs ? (
            <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/96">
              <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="route-kicker">Browse songs</p>
                  <h2 className="card-heading mt-2 text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.045em] text-foreground">
                    Song Matches
                  </h2>
                </div>
                <span className="route-kicker whitespace-nowrap">{songResults.length} results</span>
              </div>
              <div className="space-y-2">
                {songResults.map((song) => (
                  <Link
                    key={song.slug}
                    href={`/songs/${song.slug}`}
                    className="block rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle"
                  >
                    <div>
                      <p className="font-body text-[0.84rem] font-medium uppercase tracking-[0.14em] text-accent">
                        {song.artist}
                      </p>
                      <h3 className="card-heading mt-2 text-[1.55rem] font-black leading-[1.04] tracking-[-0.045em] text-foreground">
                        {song.title}
                      </h3>
                      <p className="mt-2 text-[0.96rem] leading-7 text-[color:var(--muted)]">{song.mood}</p>
                      <p className="mt-3 text-[0.78rem] font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        {song.appearances
                          .slice(0, 2)
                          .map((appearance) => appearance.contentTitle)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
