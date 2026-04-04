export type ContentType = "movie" | "series";

export type Song = {
  slug: string;
  title: string;
  artist: string;
  mood: string;
  artwork?: string;
  album?: string;
  youtubeLink: string;
  spotifyLink: string;
};

export type MovieSoundtrackItem = {
  order: number;
  sceneType: string;
  timestamp: string | null;
  sceneDescription: string;
  song: Song;
};

export type EpisodeSoundtrackItem = {
  order: number;
  sceneType: string;
  timestamp: string | null;
  sceneDescription: string;
  song: Song;
};

export type Episode = {
  episodeNumber: number;
  title: string;
  summary: string;
  songs: EpisodeSoundtrackItem[];
};

export type Season = {
  seasonNumber: number;
  episodes: Episode[];
};

export type MovieEntry = {
  slug: string;
  title: string;
  type: "movie";
  year: number;
  rating: string;
  runtime: string;
  platform: string;
  genres: string[];
  tagline: string;
  description: string;
  poster: string;
  backdrop: string;
  soundtrack: MovieSoundtrackItem[];
};

export type SeriesEntry = {
  slug: string;
  title: string;
  type: "series";
  year: number;
  rating: string;
  seasonsCount: number;
  platform: string;
  genres: string[];
  tagline: string;
  description: string;
  poster: string;
  backdrop: string;
  seasons: Season[];
};

export type CatalogEntry = MovieEntry | SeriesEntry;

export type FlattenedSceneItem = {
  contentSlug: string;
  contentTitle: string;
  contentType: ContentType;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle?: string;
  order: number;
  sceneType?: string;
  timestamp: string | null;
  sceneDescription: string;
  song: Song;
};

export type SongAppearance = {
  contentSlug: string;
  contentTitle: string;
  contentType: ContentType;
  sceneType: string;
  timestamp: string | null;
  sceneDescription: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle?: string;
};

export type SongLibraryItem = Song & {
  appearances: SongAppearance[];
};

export type Stats = {
  titles: number;
  songs: number;
  scenes: number;
  seriesEpisodes: number;
};
