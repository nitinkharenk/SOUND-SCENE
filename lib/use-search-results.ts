"use client";

import { useEffect, useState } from "react";
import type { CatalogEntry, SongLibraryItem } from "@/lib/catalog-types";
import type { ArtistSearchResult, SearchExperienceData } from "@/lib/feature-data";

export const SEARCH_MIN_QUERY = 3;
export const SEARCH_DEBOUNCE_MS = 300;

export type SearchResultsPayload = {
  movies: CatalogEntry[];
  series: CatalogEntry[];
  songs: SongLibraryItem[];
  artists: ArtistSearchResult[];
  suggestion?: string;
  editorialSuggestions?: SearchExperienceData["editorialSuggestions"];
};

const EMPTY_RESULTS: SearchResultsPayload = {
  movies: [],
  series: [],
  songs: [],
  artists: [],
};

export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}

export function useSearchResults(query: string, options?: { includeEditorial?: boolean }) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery);
  const includeEditorial = options?.includeEditorial ?? false;
  const hasMinLength = debouncedQuery.length >= SEARCH_MIN_QUERY;
  const shouldLoadEditorial = includeEditorial && debouncedQuery.length === 0;
  const [results, setResults] = useState<SearchResultsPayload>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    if (!hasMinLength && !shouldLoadEditorial) {
      setResults(EMPTY_RESULTS);
      setIsLoading(false);
      return () => abortController.abort();
    }

    async function loadResults() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (debouncedQuery) {
          params.set("q", debouncedQuery);
        }

        if (includeEditorial) {
          params.set("includeEditorial", "1");
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const payload = (await response.json()) as SearchResultsPayload;
        setResults(payload);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadResults();

    return () => abortController.abort();
  }, [debouncedQuery, hasMinLength, includeEditorial, shouldLoadEditorial]);

  return {
    debouncedQuery,
    hasMinLength,
    isLoading,
    results,
    trimmedQuery,
  };
}
