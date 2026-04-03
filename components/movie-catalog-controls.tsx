"use client";

import { CatalogBrowseControls } from "@/components/catalog-browse-controls";

type MovieCatalogControlsProps = {
  genres: string[];
  platforms: string[];
  years: string[];
};

export function MovieCatalogControls({
  genres,
  platforms,
  years,
}: MovieCatalogControlsProps) {
  return (
    <CatalogBrowseControls
      activeLabel="Movies"
      searchLabel="Search movies by title, genre, year, or soundtrack details"
      searchPlaceholder="Search titles, soundtrack moods, genres, or years"
      filters={[
        { param: "genre", label: "Genre", allLabel: "All genres", options: genres },
        { param: "platform", label: "Platform", allLabel: "All platforms", options: platforms },
        { param: "year", label: "Year", allLabel: "All years", options: years },
      ]}
      sortOptions={[
        { value: "newest", label: "Newest" },
        { value: "oldest", label: "Oldest" },
        { value: "rating", label: "Top rated" },
        { value: "title", label: "A-Z" },
      ]}
    />
  );
}
