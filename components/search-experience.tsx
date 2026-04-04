"use client";

import { useEffect } from "react";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { useSearchStore } from "@/store/useSearchStore";

type SearchExperienceProps = {
  initialQuery?: string;
};

export function SearchExperience({ initialQuery = "" }: SearchExperienceProps) {
  const { query, activeFilters, setQuery, collapse } = useSearchStore();
  const effectiveQuery = query || initialQuery;

  useEffect(() => {
    collapse();
    setQuery(initialQuery);
  }, [collapse, initialQuery, setQuery]);

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Smart search"
            leadTitle="Search"
            outlineTitle="Everything"
            description="Query movies, series, songs, and artists from a single shareable search page."
          />
          <RouteMeta
            items={[
              effectiveQuery.trim() ? `Query: ${effectiveQuery.trim()}` : "Discovery search",
              effectiveQuery.trim() ? "Live debounced results" : "Shareable search URL",
              "Movies, series, songs, artists",
            ]}
          />
        </div>

        <div className="max-w-4xl">
          <SearchBar mode="page" />
        </div>
      </section>

      <SearchResults
        query={effectiveQuery}
        filters={activeFilters}
        variant="page"
        includeEditorial
      />
    </div>
  );
}
