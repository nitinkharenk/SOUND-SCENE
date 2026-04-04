"use client";

import Link from "next/link";
import type { SongLibraryItem } from "@/lib/catalog-types";
import { pluralize } from "@/lib/text";
import {
  SEARCH_MIN_QUERY,
  type SearchResultsPayload,
  useSearchResults,
} from "@/lib/use-search-results";

interface SearchResultsProps {
  query: string;
  filters: string[];
  variant?: "inline" | "page";
  includeEditorial?: boolean;
}

function getFilteredSongs(songs: SongLibraryItem[], filters: string[]) {
  if (filters.length === 0) {
    return songs;
  }

  return songs.filter(() => filters.includes("songs"));
}

function SuggestionPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{
    href: string;
    title: string;
    meta: string;
  }>;
}) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/96">
      <p className="route-kicker">Editorial suggestions</p>
      <h2 className="card-heading mt-2 text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.045em] text-foreground">
        {title}
      </h2>
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.href}-${item.title}`}
            href={item.href}
            className="block rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle"
          >
            <h3 className="card-heading text-xl font-semibold leading-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-sm text-[color:var(--muted)]">{item.meta}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getEditorialPanels(results: SearchResultsPayload) {
  if (!results.editorialSuggestions) {
    return [];
  }

  return [
    {
      title: "Popular Movies",
      items: results.editorialSuggestions.movies.map((item) => ({
        href: `/movies/${item.slug}`,
        title: item.title,
        meta: `${item.year} · ${item.platform}`,
      })),
    },
    {
      title: "Popular Songs",
      items: results.editorialSuggestions.songs.map((item) => ({
        href: `/songs/${item.slug}`,
        title: item.title,
        meta: `${item.artist} · ${item.mood}`,
      })),
    },
    {
      title: "Featured Artists",
      items: results.editorialSuggestions.artists.map((item) => ({
        href: `/artists/${item.slug}`,
        title: item.name,
        meta: `${pluralize(item.songsCount, "song")} · ${pluralize(item.soundtrackCount, "soundtrack")}`,
      })),
    },
  ].filter((panel) => panel.items.length > 0);
}

export default function SearchResults({
  query,
  filters,
  variant = "inline",
  includeEditorial = false,
}: SearchResultsProps) {
  const {
    results,
    isLoading,
    hasMinLength,
    trimmedQuery,
  } = useSearchResults(query, { includeEditorial });

  const movieResults =
    filters.length === 0 || filters.includes("movies") ? results.movies : [];
  const seriesResults =
    filters.length === 0 || filters.includes("tv") ? results.series : [];
  const songResults = getFilteredSongs(results.songs, filters);
  const artistResults =
    filters.length === 0 || filters.includes("artists") ? results.artists : [];
  const showTitles = filters.length === 0 || filters.includes("movies") || filters.includes("tv");
  const showSongs = filters.length === 0 || filters.includes("songs");
  const showArtists = filters.length === 0 || filters.includes("artists");
  const noMatches =
    (!showTitles || movieResults.length + seriesResults.length === 0) &&
    (!showSongs || songResults.length === 0) &&
    (!showArtists || artistResults.length === 0);
  const editorialPanels = getEditorialPanels(results);
  const showEditorialSuggestions =
    includeEditorial &&
    editorialPanels.length > 0 &&
    ((!trimmedQuery && !hasMinLength) || (hasMinLength && !isLoading && noMatches));
  const rootClassName =
    variant === "page" ? "mt-10 text-foreground" : "px-6 pt-4 text-foreground";

  return (
    <div className={rootClassName}>
      {!hasMinLength && trimmedQuery.length > 0 ? (
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

      {hasMinLength && results.suggestion ? (
        <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
          Did you mean{" "}
          <Link
            href={`/search?q=${encodeURIComponent(results.suggestion)}`}
            className="font-medium text-accent"
          >
            {results.suggestion}
          </Link>
          ?
        </p>
      ) : null}

      {hasMinLength && isLoading ? (
        <div className="py-8">
          <p className="font-body text-sm text-[color:var(--muted)]">Searching catalog...</p>
        </div>
      ) : null}

      {hasMinLength && !isLoading && noMatches ? (
        <div className="py-8">
          <p className="font-body text-sm text-[color:var(--muted)]">
            No results yet. Try a different title, artist, or soundtrack keyword.
          </p>
        </div>
      ) : null}

      {showEditorialSuggestions ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {editorialPanels.map((panel) => (
            <SuggestionPanel key={panel.title} title={panel.title} items={panel.items} />
          ))}
        </div>
      ) : null}

      {hasMinLength && !isLoading && !noMatches ? (
        <div className="mt-6 space-y-6">
          {showTitles ? (
            <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/96">
              <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="route-kicker">Browse titles</p>
                  <h2 className="card-heading mt-2 text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.045em] text-foreground">
                    Title Matches
                  </h2>
                </div>
                <span className="route-kicker whitespace-nowrap">
                  {pluralize(movieResults.length + seriesResults.length, "result")}
                </span>
              </div>
              <div className="space-y-5">
                {movieResults.length > 0 ? (
                  <div>
                    <p className="route-kicker mb-3">Movies</p>
                    <div className="space-y-2">
                      {movieResults.map((entry) => (
                        <Link
                          key={entry.slug}
                          href={`/movies/${entry.slug}`}
                          className="grid gap-4 rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle sm:grid-cols-[108px_1fr]"
                        >
                          <div className="route-thumb aspect-[1.08/0.86]">
                            <img src={entry.poster} alt={entry.title} />
                          </div>
                          <div>
                            <p className="route-kicker text-[0.72rem]">
                              {entry.year} · {entry.platform}
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
                  </div>
                ) : null}

                {seriesResults.length > 0 ? (
                  <div>
                    <p className="route-kicker mb-3">Series</p>
                    <div className="space-y-2">
                      {seriesResults.map((entry) => (
                        <Link
                          key={entry.slug}
                          href={`/series/${entry.slug}`}
                          className="grid gap-4 rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle sm:grid-cols-[108px_1fr]"
                        >
                          <div className="route-thumb aspect-[1.08/0.86]">
                            <img src={entry.poster} alt={entry.title} />
                          </div>
                          <div>
                            <p className="route-kicker text-[0.72rem]">
                              {entry.year} · {entry.platform}
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
                  </div>
                ) : null}
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
                <span className="route-kicker whitespace-nowrap">
                  {pluralize(songResults.length, "result")}
                </span>
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
                        {song.appearances.length > 0
                          ? song.appearances
                              .slice(0, 2)
                              .map((appearance) => appearance.contentTitle)
                              .join(" · ")
                          : song.album ?? "No mapped appearances yet"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {showArtists ? (
            <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/96">
              <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="route-kicker">Browse artists</p>
                  <h2 className="card-heading mt-2 text-[1.55rem] font-semibold leading-[1.04] tracking-[-0.045em] text-foreground">
                    Artist Matches
                  </h2>
                </div>
                <span className="route-kicker whitespace-nowrap">
                  {pluralize(artistResults.length, "result")}
                </span>
              </div>
              <div className="space-y-2">
                {artistResults.map((artist) => (
                  <Link
                    key={artist.slug}
                    href={`/artists/${artist.slug}`}
                    className="block rounded-[0.72rem] border border-transparent bg-transparent p-3 transition-colors duration-200 hover:bg-accent-subtle"
                  >
                    <div>
                      <p className="font-body text-[0.84rem] font-medium uppercase tracking-[0.14em] text-accent">
                        Artist
                      </p>
                      <h3 className="card-heading mt-2 text-[1.55rem] font-black leading-[1.04] tracking-[-0.045em] text-foreground">
                        {artist.name}
                      </h3>
                      <p className="mt-2 text-[0.96rem] leading-7 text-[color:var(--muted)]">
                        {pluralize(artist.songsCount, "song")} ·{" "}
                        {pluralize(artist.soundtrackCount, "soundtrack")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {variant === "inline" && hasMinLength && !isLoading ? (
        <div className="mt-5 flex justify-end border-t border-black/8 pt-4 dark:border-white/10">
          <Link
            href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
            className="route-action route-action-primary focus-ring"
          >
            Press Enter or see all results for &quot;{trimmedQuery}&quot;
          </Link>
        </div>
      ) : null}
    </div>
  );
}
