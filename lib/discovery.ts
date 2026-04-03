import {
  catalog,
  songLibrary,
  type CatalogEntry,
  type SeriesEntry,
  type SongLibraryItem,
} from "@/lib/catalog";

export const filters = [
  { id: "movies", label: "Movies" },
  { id: "series", label: "Web Series" },
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
  label: "Movie" | "Web Series";
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
  relatedType: "Movie" | "Web Series";
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

const catalogBySlug = new Map<string, CatalogEntry>(
  catalog.map((entry) => [entry.slug, entry]),
);

export const contentItems: DiscoveryContentItem[] = catalog.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  type: entry.type,
  year: entry.year,
  rating: entry.rating,
  poster: entry.poster,
  backdrop: entry.backdrop,
  href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
  label: entry.type === "movie" ? "Movie" : "Web Series",
  meta:
    entry.type === "movie"
      ? `${entry.runtime} · ${entry.platform}`
      : `${entry.seasonsCount} season${entry.seasonsCount > 1 ? "s" : ""} · ${entry.platform}`,
  genres: entry.genres,
  description: entry.description,
  runtime: entry.type === "movie" ? entry.runtime : undefined,
  seasonsCount: entry.type === "series" ? entry.seasonsCount : undefined,
}));

const categoryMap: Record<string, string> = {
  "Synthetic rush": "Synthwave",
  "Dark dance-pop": "Alt Pop",
  "Triumphant slow burn": "Synthwave",
  "Cocktail groove": "Neo Soul",
  "Tension soul": "Alt Pop",
  "Confident closer": "Indie Pop",
  "Warm lo-fi soul": "Ambient",
  "Tender ache": "Dream Pop",
  "Big emotional release": "Alt Pop",
  "Ambient dread": "Ambient",
  "Frozen crescendo": "Electronic",
  "Urgent shimmer": "Alt Pop",
  "Heroic tension": "Electronic",
  "Pulse-heavy noir": "Synthwave",
  "Slick and suspicious": "Alt Pop",
  "Chillwave clue drop": "Synthwave",
};

export const songItems: DiscoverySongItem[] = songLibrary.map((song) => {
  const appearance = song.appearances[0];
  const relatedEntry = appearance ? catalogBySlug.get(appearance.contentSlug) : null;

  return {
    ...song,
    href: `/songs/${song.slug}`,
    image: relatedEntry?.poster ?? relatedEntry?.backdrop ?? "",
    label: "Song" as const,
    relatedTitle: relatedEntry?.title ?? "Soundtrack feature",
    relatedType: appearance?.contentType === "movie" ? "Movie" : "Web Series",
    meta: `${song.artist} · ${song.mood}`,
    category: categoryMap[song.mood] ?? "Soundtrack",
    year: relatedEntry?.year ?? 0,
  };
});

export const popularCollections: Record<FilterId, DiscoveryItem[]> = {
  movies: [...contentItems]
    .filter((entry) => entry.type === "movie")
    .sort((left, right) => Number(right.rating) - Number(left.rating)),
  series: [...contentItems]
    .filter((entry) => entry.type === "series")
    .sort((left, right) => Number(right.rating) - Number(left.rating)),
  songs: [...songItems].sort(
    (left, right) =>
      right.appearances.length - left.appearances.length || right.year - left.year,
  ),
};

export const latestCollections: Record<FilterId, DiscoveryItem[]> = {
  movies: [...contentItems]
    .filter((entry) => entry.type === "movie")
    .sort(
      (left, right) =>
        right.year - left.year || Number(right.rating) - Number(left.rating),
    ),
  series: [...contentItems]
    .filter((entry) => entry.type === "series")
    .sort(
      (left, right) =>
        right.year - left.year || Number(right.rating) - Number(left.rating),
    ),
  songs: [...songItems].sort((left, right) => right.year - left.year),
};

export const trendingStories: TrendingSongItem[] = [...songItems]
  .sort(
    (left, right) =>
      right.appearances.length - left.appearances.length || right.year - left.year,
  )
  .slice(0, 4)
  .map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

export const weeklyEpisodes: WeeklyEpisodeItem[] = catalog
  .filter((entry): entry is SeriesEntry => entry.type === "series")
  .flatMap((entry) =>
    entry.seasons.flatMap((season) =>
      season.episodes.map((episode) => ({
        id: `${entry.slug}-${season.seasonNumber}-${episode.episodeNumber}`,
        href: `/series/${entry.slug}`,
        image: entry.backdrop,
        label: "Episode" as const,
        seriesTitle: entry.title,
        episodeTitle: episode.title,
        episodeCode: `S${season.seasonNumber} · E${episode.episodeNumber}`,
        summary: episode.summary,
        songsCount: episode.songs.length,
        leadSong: episode.songs[0]?.song.title ?? "Soundtrack update",
        year: entry.year,
      })),
    ),
  )
  .sort((left, right) => right.year - left.year || right.id.localeCompare(left.id));

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
