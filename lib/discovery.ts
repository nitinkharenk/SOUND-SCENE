import {
  getCatalogCards,
  getHomeEpisodeCards,
  getSongCards,
  type CatalogEntry,
  type SongLibraryItem,
} from "@/lib/content-store";
import { getSongCategory, resolveSongArtwork } from "@/lib/song-presentation";
import {
  type DiscoveryContentItem,
  type DiscoveryItem,
  type DiscoverySongItem,
  type FilterId,
  type TrendingSongItem,
  type WeeklyEpisodeItem,
} from "@/lib/discovery-types";
import { pluralize } from "@/lib/text";

export type {
  DiscoveryContentItem,
  DiscoveryItem,
  DiscoverySongItem,
  FilterId,
  TrendingSongItem,
  WeeklyEpisodeItem,
} from "@/lib/discovery-types";
export {
  filters,
  getBrowseHrefForFilter,
  getBrowseLabelForFilter,
  isSongItem,
} from "@/lib/discovery-types";

export async function getDiscoveryData(options?: {
  contentLimit?: number;
  songLimit?: number;
}): Promise<{
  contentItems: DiscoveryContentItem[];
  songItems: DiscoverySongItem[];
}> {
  const contentLimit = options?.contentLimit ?? 50;
  const songLimit = options?.songLimit ?? 50;

  const [catalog, songLibrary] = await Promise.all([
    getCatalogCards({ limit: contentLimit }),
    getSongCards({ limit: songLimit, appearanceLimit: 1 }),
  ]);

  const catalogBySlug = new Map<string, CatalogEntry>(
    catalog.map((entry) => [entry.slug, entry]),
  );

  const contentItems: DiscoveryContentItem[] = catalog.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    type: entry.type,
    year: entry.year,
    rating: entry.rating,
    poster: entry.poster,
    backdrop: entry.backdrop,
    href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
    label: entry.type === "movie" ? "Movie" : "Series",
    meta:
      entry.type === "movie"
        ? `${entry.runtime} · ${entry.platform}`
        : `${pluralize(entry.seasonsCount, "season")} · ${entry.platform}`,
    genres: entry.genres,
    description: entry.description,
    runtime: entry.type === "movie" ? entry.runtime : undefined,
    seasonsCount: entry.type === "series" ? entry.seasonsCount : undefined,
  }));

  const songItems: DiscoverySongItem[] = songLibrary.map((song) => {
    const appearance = song.appearances[0];
    const relatedEntry = appearance ? catalogBySlug.get(appearance.contentSlug) : null;
    const category = getSongCategory(song.mood);

    return {
      ...song,
      href: `/songs/${song.slug}`,
      image: resolveSongArtwork({
        artwork: song.artwork,
        category,
        mood: song.mood,
      }),
      label: "Song",
      relatedTitle: relatedEntry?.title ?? song.album ?? "Soundtrack library",
      relatedType: relatedEntry
        ? relatedEntry.type === "movie"
          ? "Movie"
          : "Series"
        : "Track",
      meta: `${song.artist} · ${song.mood}`,
      category,
      year: relatedEntry?.year ?? 0,
    };
  });

  return {
    contentItems,
    songItems,
  };
}

export async function getHomeDiscoveryData(): Promise<{
  popularCollections: Record<FilterId, DiscoveryItem[]>;
  latestCollections: Record<FilterId, DiscoveryItem[]>;
  trendingStories: TrendingSongItem[];
  weeklyEpisodes: WeeklyEpisodeItem[];
}> {
  const [{ contentItems, songItems }, homeEpisodes] = await Promise.all([
    getDiscoveryData(),
    getHomeEpisodeCards(60),
  ]);

  const popularCollections: Record<FilterId, DiscoveryItem[]> = {
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

  const latestCollections: Record<FilterId, DiscoveryItem[]> = {
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

  const trendingStories: TrendingSongItem[] = [...songItems]
    .sort(
      (left, right) =>
        right.appearances.length - left.appearances.length || right.year - left.year,
    )
    .slice(0, 4)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const weeklyEpisodes: WeeklyEpisodeItem[] = homeEpisodes.map((episode) => ({
    id: `${episode.seriesSlug}-${episode.seasonNumber}-${episode.episodeNumber}-${episode.id}`,
    href: `/series/${episode.seriesSlug}`,
    image: episode.image,
    label: "Episode" as const,
    seriesTitle: episode.seriesTitle,
    episodeTitle: episode.episodeTitle,
    episodeCode: `S${episode.seasonNumber} · E${episode.episodeNumber}`,
    summary: episode.summary,
    songsCount: episode.songsCount,
    leadSong: episode.leadSong,
    year: episode.seriesYear,
  }));

  return {
    popularCollections,
    latestCollections,
    trendingStories,
    weeklyEpisodes,
  };
}

export async function getNavData(): Promise<{
  trendingContent: CatalogEntry[];
  movieHighlights: CatalogEntry[];
  seriesHighlights: CatalogEntry[];
  popularSongs: SongLibraryItem[];
}> {
  const [catalog, popularSongs] = await Promise.all([
    getCatalogCards({ limit: 12 }),
    getSongCards({ limit: 5, appearanceLimit: 1 }),
  ]);

  const movies = catalog.filter((e) => e.type === "movie");
  const series = catalog.filter((e) => e.type === "series");

  return {
    trendingContent: catalog.slice(0, 4),
    movieHighlights: movies.slice(0, 6),
    seriesHighlights: series.slice(0, 6),
    popularSongs,
  };
}
