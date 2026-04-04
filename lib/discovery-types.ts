import type { CatalogEntry, SongLibraryItem } from "@/lib/catalog-types";

export const filters = [
  { id: "movies", label: "Movies" },
  { id: "series", label: "Series" },
  { id: "songs", label: "Songs" },
] as const;

export type FilterId = (typeof filters)[number]["id"];

export type DiscoveryContentItem = {
  slug: string;
  title: string;
  type: CatalogEntry["type"];
  year: number;
  rating: string;
  poster: string;
  backdrop: string;
  href: string;
  label: "Movie" | "Series";
  meta: string;
  genres: string[];
  description: string;
  runtime?: string;
  seasonsCount?: number;
};

export type DiscoverySongItem = SongLibraryItem & {
  href: string;
  image: string;
  label: "Song";
  relatedTitle: string;
  relatedType: "Movie" | "Series" | "Track";
  meta: string;
  category: string;
  year: number;
};

export type DiscoveryItem = DiscoveryContentItem | DiscoverySongItem;
export type TrendingSongItem = DiscoverySongItem & { rank: number };

export type WeeklyEpisodeItem = {
  id: string;
  href: string;
  image: string;
  label: "Episode";
  seriesTitle: string;
  episodeTitle: string;
  episodeCode: string;
  summary: string;
  songsCount: number;
  leadSong: string;
  year: number;
};

export function isSongItem(item: DiscoveryItem): item is DiscoverySongItem {
  return "appearances" in item;
}

export function getBrowseHrefForFilter(filterId: FilterId): string {
  if (filterId === "movies") {
    return "/movies";
  }

  if (filterId === "series") {
    return "/series";
  }

  return "/songs";
}

export function getBrowseLabelForFilter(filterId: FilterId): string {
  if (filterId === "movies") {
    return "movies";
  }

  if (filterId === "series") {
    return "series";
  }

  return "songs";
}
