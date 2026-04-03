"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchCatalog } from "@/lib/catalog";
import { SplitHeading } from "@/components/route-heading";

type SearchExperienceProps = {
  initialQuery?: string;
};

export function SearchExperience({
  initialQuery = "",
}: SearchExperienceProps) {
  const [query, setQuery] = useState<string>(initialQuery);
  const results = useMemo(() => searchCatalog(query), [query]);

  return (
    <div className="space-y-12">
      <section className="route-intro">
        <SplitHeading
          kicker="Smart search"
          leadTitle="Search"
          outlineTitle="Everything"
          description="Look up movies, web series, songs, and artists in one clean index."
        />
        <form action="/" method="GET" className="max-w-4xl">
          <label htmlFor="catalog-search" className="sr-only">
            Search by movie, series, song, artist, or vibe
          </label>
          <div className="relative mx-auto w-full max-w-2xl rounded-xl border-[1.5px] border-accent bg-white px-4 py-2.5 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-accent-subtle dark:border-white/10 dark:bg-zinc-900 sm:px-5 sm:py-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[1rem] text-accent" aria-hidden="true">
                ⌕
              </span>
              <input
                id="catalog-search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try 'Neon Skyline', 'Velvet Signal', or 'mystery'"
                className="w-full border-none bg-transparent px-0 py-0 font-body text-base font-medium text-foreground outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>
        </form>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <SplitHeading
              kicker="Browse titles"
              leadTitle="Title"
              outlineTitle="Matches"
              compact
            />
            <span className="route-kicker whitespace-nowrap">
              {results.content.length} results
            </span>
          </div>
          {/* Keep Syne section headings at least 12px larger than nearby Cabinet result titles. */}
          <div className="route-surface">
            {results.content.map((entry) => (
              <Link
                key={entry.slug}
                href={`/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`}
                className="route-row-link sm:grid-cols-[108px_1fr]"
              >
                <div className="route-thumb aspect-[1.08/0.86]">
                  <img src={entry.poster} alt={entry.title} />
                </div>
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {entry.type} · {entry.year} · {entry.platform}
                  </p>
                  <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-foreground">
                    {entry.title}
                  </h3>
                  <p className="mt-2 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
                    {entry.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <SplitHeading
              kicker="Browse songs"
              leadTitle="Song"
              outlineTitle="Matches"
              compact
            />
            <span className="route-kicker whitespace-nowrap">
              {results.songs.length} results
            </span>
          </div>
          {/* Keep Syne section headings at least 12px larger than nearby Cabinet result titles. */}
          <div className="route-surface">
            {results.songs.map((song) => (
              <Link key={song.slug} href={`/songs/${song.slug}`} className="route-row-link">
                <div>
                  <p className="font-card text-base font-medium text-[#4f856d]">
                    {song.artist}
                  </p>
                  <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-foreground">
                    {song.title}
                  </h3>
                  <p className="mt-2 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
                    {song.mood}
                  </p>
                  <p className="mt-3 font-body text-sm font-normal text-[color:var(--muted)]">
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
      </div>
    </div>
  );
}
