import { cache } from "react";
import { Prisma, TitleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  formatRuntime,
  spotifySearchUrl,
  youtubeSearchUrl,
} from "@/lib/text";
import type {
  CatalogEntry,
  ContentType,
  FlattenedSceneItem,
  MovieEntry,
  MovieSoundtrackItem,
  SeriesEntry,
  Song,
  SongAppearance,
  SongLibraryItem,
  Stats,
} from "@/lib/catalog-types";

export type {
  CatalogEntry,
  ContentType,
  Episode,
  EpisodeSoundtrackItem,
  FlattenedSceneItem,
  MovieEntry,
  MovieSoundtrackItem,
  Season,
  SeriesEntry,
  Song,
  SongAppearance,
  SongLibraryItem,
  Stats,
} from "@/lib/catalog-types";

const fullTitleInclude = Prisma.validator<Prisma.TitleInclude>()({
  genres: {
    include: {
      genre: true,
    },
  },
  seasons: {
    include: {
      episodes: {
        include: {
          appearances: {
            include: {
              song: true,
              episode: {
                include: {
                  season: true,
                },
              },
            },
          },
        },
      },
    },
  },
  appearances: {
    include: {
      song: true,
      episode: {
        include: {
          season: true,
        },
      },
    },
  },
});

const movieDetailInclude = Prisma.validator<Prisma.TitleInclude>()({
  genres: {
    include: {
      genre: true,
    },
  },
  appearances: {
    include: {
      song: true,
      episode: {
        include: {
          season: true,
        },
      },
    },
  },
});

const seriesDetailInclude = Prisma.validator<Prisma.TitleInclude>()({
  genres: {
    include: {
      genre: true,
    },
  },
  seasons: {
    include: {
      episodes: {
        include: {
          appearances: {
            include: {
              song: true,
              episode: {
                include: {
                  season: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

const titleCardSelect = Prisma.validator<Prisma.TitleSelect>()({
  slug: true,
  title: true,
  type: true,
  year: true,
  rating: true,
  runtime: true,
  platform: true,
  tagline: true,
  description: true,
  poster: true,
  backdrop: true,
  genres: {
    include: {
      genre: true,
    },
  },
  _count: {
    select: {
      seasons: true,
    },
  },
});

type DbSong = Prisma.SongGetPayload<{}>;
type DbAppearance = Prisma.SongAppearanceGetPayload<{
  include: {
    song: true;
    episode: {
      include: {
        season: true;
      };
    };
  };
}>;

type DbTitle = Prisma.TitleGetPayload<{
  include: typeof fullTitleInclude;
}>;

type DbMovieDetail = Prisma.TitleGetPayload<{
  include: typeof movieDetailInclude;
}>;

type DbSeriesDetail = Prisma.TitleGetPayload<{
  include: typeof seriesDetailInclude;
}>;

type DbSongAppearance = Prisma.SongAppearanceGetPayload<{
  include: {
    title: true;
    episode: {
      include: {
        season: true;
      };
    };
  };
}>;

type DbSongWithAppearances = Prisma.SongGetPayload<{
  include: {
    appearances: {
      include: {
        title: true;
        episode: {
          include: {
            season: true;
          };
        };
      };
    };
  };
}>;

type DbTitleCard = Prisma.TitleGetPayload<{
  select: typeof titleCardSelect;
}>;

type CatalogSnapshot = {
  catalog: CatalogEntry[];
  sceneLibrary: FlattenedSceneItem[];
  songLibrary: SongLibraryItem[];
  stats: Stats;
};

type DbHomeEpisode = Prisma.EpisodeGetPayload<{
  select: {
    id: true;
    episodeNumber: true;
    title: true;
    summary: true;
    season: {
      select: {
        seasonNumber: true;
        title: {
          select: {
            slug: true;
            title: true;
            year: true;
            backdrop: true;
          };
        };
      };
    };
    appearances: {
      select: {
        song: {
          select: {
            title: true;
          };
        };
      };
      orderBy: {
        order: "asc";
      };
      take: 1;
    };
    _count: {
      select: {
        appearances: true;
      };
    };
  };
}>;

function mapSong(song: Pick<
  DbSong,
  "slug" | "title" | "artist" | "mood" | "artwork" | "album" | "youtubeLink" | "spotifyLink"
>): Song {
  return {
    slug: song.slug,
    title: song.title,
    artist: song.artist,
    mood: song.mood,
    artwork: song.artwork ?? undefined,
    album: song.album ?? undefined,
    youtubeLink:
      song.youtubeLink?.trim() || youtubeSearchUrl(song.title, song.artist),
    spotifyLink:
      song.spotifyLink?.trim() || spotifySearchUrl(song.title, song.artist),
  };
}

function mapMovieAppearance(item: DbAppearance): MovieSoundtrackItem {
  return {
    order: item.order,
    sceneType: item.sceneType,
    timestamp: item.timestamp,
    sceneDescription: item.sceneDescription,
    song: mapSong(item.song),
  };
}

function mapMovieEntry(entry: DbMovieDetail | DbTitle): MovieEntry {
  return {
    slug: entry.slug,
    title: entry.title,
    type: "movie",
    year: entry.year,
    rating: entry.rating,
    runtime: formatRuntime(entry.runtime ?? ""),
    platform: entry.platform,
    genres: entry.genres.map((item) => item.genre.name),
    tagline: entry.tagline,
    description: entry.description,
    poster: entry.poster,
    backdrop: entry.backdrop || entry.poster,
    soundtrack: entry.appearances
      .filter((item) => !item.episodeId)
      .sort((left, right) => left.order - right.order)
      .map(mapMovieAppearance),
  };
}

function mapSeriesEntry(entry: DbSeriesDetail | DbTitle): SeriesEntry {
  const seasons = entry.seasons
    .sort((left, right) => left.seasonNumber - right.seasonNumber)
    .map((season) => ({
      seasonNumber: season.seasonNumber,
      episodes: season.episodes
        .sort((left, right) => left.episodeNumber - right.episodeNumber)
        .map((episode) => ({
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          summary: episode.summary,
          songs: episode.appearances
            .sort((left, right) => left.order - right.order)
            .map((item) => ({
              order: item.order,
              sceneType: item.sceneType,
              timestamp: item.timestamp,
              sceneDescription: item.sceneDescription,
              song: mapSong(item.song),
            })),
        })),
    }));

  return {
    slug: entry.slug,
    title: entry.title,
    type: "series",
    year: entry.year,
    rating: entry.rating,
    seasonsCount: seasons.length,
    platform: entry.platform,
    genres: entry.genres.map((item) => item.genre.name),
    tagline: entry.tagline,
    description: entry.description,
    poster: entry.poster,
    backdrop: entry.backdrop || entry.poster,
    seasons,
  };
}

function mapTitle(entry: DbTitle): CatalogEntry {
  return entry.type === TitleType.movie ? mapMovieEntry(entry) : mapSeriesEntry(entry);
}

function mapTitleCard(entry: DbTitleCard): CatalogEntry {
  const base = {
    slug: entry.slug,
    title: entry.title,
    year: entry.year,
    rating: entry.rating,
    platform: entry.platform,
    genres: entry.genres.map((item) => item.genre.name),
    tagline: entry.tagline,
    description: entry.description,
    poster: entry.poster,
    backdrop: entry.backdrop || entry.poster,
  };

  if (entry.type === TitleType.movie) {
    return {
      ...base,
      type: "movie",
      runtime: formatRuntime(entry.runtime ?? ""),
      soundtrack: [],
    };
  }

  return {
    ...base,
    type: "series",
    seasonsCount: entry._count.seasons,
    seasons: [],
  };
}

function compareSongAppearances(left: DbSongAppearance, right: DbSongAppearance) {
  return (
    right.title.year - left.title.year ||
    left.title.title.localeCompare(right.title.title) ||
    (left.episode?.season.seasonNumber ?? 0) - (right.episode?.season.seasonNumber ?? 0) ||
    (left.episode?.episodeNumber ?? 0) - (right.episode?.episodeNumber ?? 0) ||
    left.order - right.order
  );
}

function mapSongAppearance(item: DbSongAppearance): SongAppearance {
  return {
    contentSlug: item.title.slug,
    contentTitle: item.title.title,
    contentType: item.title.type === TitleType.movie ? "movie" : "series",
    sceneType: item.sceneType,
    timestamp: item.timestamp,
    sceneDescription: item.sceneDescription,
    seasonNumber: item.episode?.season.seasonNumber ?? null,
    episodeNumber: item.episode?.episodeNumber ?? null,
    episodeTitle: item.episode?.title ?? undefined,
  };
}

function mapSongLibraryItem(
  song: DbSongWithAppearances,
  options?: {
    appearanceLimit?: number;
  },
): SongLibraryItem {
  const appearances = [...song.appearances]
    .sort(compareSongAppearances)
    .map(mapSongAppearance);

  return {
    ...mapSong(song),
    appearances:
      typeof options?.appearanceLimit === "number"
        ? appearances.slice(0, options.appearanceLimit)
        : appearances,
  };
}

function flattenAppearances(catalog: CatalogEntry[]): FlattenedSceneItem[] {
  return catalog.flatMap<FlattenedSceneItem>((entry) => {
    if (entry.type === "movie") {
      return entry.soundtrack.map((item) => ({
        contentSlug: entry.slug,
        contentTitle: entry.title,
        contentType: entry.type,
        seasonNumber: null,
        episodeNumber: null,
        order: item.order,
        sceneType: item.sceneType,
        timestamp: item.timestamp,
        sceneDescription: item.sceneDescription,
        song: item.song,
      }));
    }

    return entry.seasons.flatMap((season) =>
      season.episodes.flatMap((episode) =>
        episode.songs.map((item) => ({
          contentSlug: entry.slug,
          contentTitle: entry.title,
          contentType: entry.type,
          seasonNumber: season.seasonNumber,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.title,
          order: item.order,
          sceneType: item.sceneType,
          timestamp: item.timestamp,
          sceneDescription: item.sceneDescription,
          song: item.song,
        })),
      ),
    );
  });
}

function buildSongLibrary(sceneLibrary: FlattenedSceneItem[], allSongs: Song[]): SongLibraryItem[] {
  const seeded = new Map<string, SongLibraryItem>(
    allSongs.map((song) => [
      song.slug,
      {
        ...song,
        appearances: [],
      },
    ]),
  );

  for (const item of sceneLibrary) {
    const existing = seeded.get(item.song.slug) ?? {
      ...item.song,
      appearances: [],
    };

    const appearance: SongAppearance = {
      contentSlug: item.contentSlug,
      contentTitle: item.contentTitle,
      contentType: item.contentType,
      sceneType: item.sceneType ?? "Episode scene",
      timestamp: item.timestamp,
      sceneDescription: item.sceneDescription,
      seasonNumber: item.seasonNumber,
      episodeNumber: item.episodeNumber,
      episodeTitle: item.episodeTitle,
    };

    existing.appearances.push(appearance);
    seeded.set(item.song.slug, existing);
  }

  return Array.from(seeded.values()).sort((left, right) => {
    return (
      right.appearances.length - left.appearances.length ||
      left.title.localeCompare(right.title)
    );
  });
}

async function loadTitlesFromDb(): Promise<DbTitle[]> {
  return prisma.title.findMany({
    orderBy: [{ year: "desc" }, { title: "asc" }],
    include: fullTitleInclude,
  });
}

async function loadSongsFromDb(): Promise<Song[]> {
  const songs = await prisma.song.findMany({
    orderBy: [{ title: "asc" }, { artist: "asc" }],
  });

  return songs.map(mapSong);
}

export const getCatalogSnapshot = cache(async (): Promise<CatalogSnapshot> => {
  const [titles, allSongs] = await Promise.all([loadTitlesFromDb(), loadSongsFromDb()]);
  const catalog = titles.map(mapTitle);
  const sceneLibrary = flattenAppearances(catalog);
  const songLibrary = buildSongLibrary(sceneLibrary, allSongs);

  const stats: Stats = {
    titles: catalog.length,
    songs: songLibrary.length,
    scenes: sceneLibrary.length,
    seriesEpisodes: catalog
      .filter((entry): entry is SeriesEntry => entry.type === "series")
      .reduce((total, entry) => {
        return (
          total +
          entry.seasons.reduce((seasonTotal, season) => seasonTotal + season.episodes.length, 0)
        );
      }, 0),
  };

  return {
    catalog,
    sceneLibrary,
    songLibrary,
    stats,
  };
});

export async function getCatalog(): Promise<CatalogEntry[]> {
  return (await getCatalogSnapshot()).catalog;
}

export async function getSceneLibrary(): Promise<FlattenedSceneItem[]> {
  return (await getCatalogSnapshot()).sceneLibrary;
}

export async function getSongLibrary(): Promise<SongLibraryItem[]> {
  return (await getCatalogSnapshot()).songLibrary;
}

export async function getStats(): Promise<Stats> {
  return (await getCatalogSnapshot()).stats;
}

export async function getStaticMovieParams(): Promise<Array<{ slug: string }>> {
  return prisma.title.findMany({
    where: { type: TitleType.movie },
    select: { slug: true },
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });
}

export async function getStaticSeriesParams(): Promise<Array<{ slug: string }>> {
  return prisma.title.findMany({
    where: { type: TitleType.series },
    select: { slug: true },
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });
}

export async function getStaticSongParams(): Promise<Array<{ slug: string }>> {
  return prisma.song.findMany({
    select: { slug: true },
    orderBy: [{ title: "asc" }, { artist: "asc" }],
  });
}

function titleSearchRelevance(entry: { title: string; description: string; platform: string; genres: string[] }, query: string): number {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (entry.genres.some((g) => g.toLowerCase().includes(q))) return 3;
  if (entry.platform.toLowerCase().includes(q)) return 4;
  if (entry.description.toLowerCase().includes(q)) return 5;
  return 6;
}

function songSearchRelevance(entry: { title: string; artist: string; mood: string; album?: string }, query: string): number {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (entry.artist.toLowerCase().includes(q)) return 3;
  if (entry.mood.toLowerCase().includes(q)) return 4;
  if (entry.album?.toLowerCase().includes(q)) return 5;
  return 6;
}

function buildTitleSearchWhere(query?: string): Prisma.TitleWhereInput | undefined {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return undefined;
  }

  return {
    OR: [
      {
        title: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        platform: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        genres: {
          some: {
            genre: {
              name: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ],
  };
}

function buildSongSearchWhere(query?: string): Prisma.SongWhereInput | undefined {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return undefined;
  }

  return {
    OR: [
      {
        title: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        artist: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        mood: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        album: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
    ],
  };
}

export const getCatalogCards = cache(async (options: {
  type?: ContentType;
  limit: number;
  skip?: number;
  query?: string;
  genre?: string;
  platform?: string;
  year?: number;
  sort?: "newest" | "oldest" | "rating" | "title";
}): Promise<CatalogEntry[]> => {
  const typeFilter = options.type
    ? { type: options.type === "movie" ? TitleType.movie : TitleType.series }
    : {};
  const genreFilter = options.genre
    ? { genres: { some: { genre: { name: options.genre } } } }
    : {};
  const platformFilter = options.platform
    ? { platform: { contains: options.platform, mode: "insensitive" as const } }
    : {};
  const yearFilter = options.year ? { year: options.year } : {};

  const sortMap: Record<string, Prisma.TitleOrderByWithRelationInput[]> = {
    newest: [{ year: "desc" }, { title: "asc" }],
    oldest: [{ year: "asc" }, { title: "asc" }],
    rating: [{ rating: "desc" }, { year: "desc" }],
    title: [{ title: "asc" }],
  };

  const isSearch = !!options.query;
  const fetchLimit = isSearch ? Math.max(options.limit * 4, 40) : options.limit;

  const entries = await prisma.title.findMany({
    where: {
      ...typeFilter,
      ...genreFilter,
      ...platformFilter,
      ...yearFilter,
      ...(buildTitleSearchWhere(options.query) ?? {}),
    },
    orderBy: isSearch ? [{ title: "asc" }] : (sortMap[options.sort ?? "newest"] ?? sortMap.newest),
    skip: isSearch ? 0 : (options.skip ?? 0),
    take: fetchLimit,
    select: titleCardSelect,
  });

  const cards = entries.map(mapTitleCard);

  if (isSearch) {
    const q = options.query!;
    cards.sort((a, b) => titleSearchRelevance(a, q) - titleSearchRelevance(b, q));
    return cards.slice(0, options.limit);
  }

  return cards;
});

export async function getCatalogCardCount(options: {
  type?: ContentType;
  query?: string;
  genre?: string;
  platform?: string;
  year?: number;
}): Promise<number> {
  const typeFilter = options.type
    ? { type: options.type === "movie" ? TitleType.movie : TitleType.series }
    : {};
  const genreFilter = options.genre
    ? { genres: { some: { genre: { name: options.genre } } } }
    : {};
  const platformFilter = options.platform
    ? { platform: { contains: options.platform, mode: "insensitive" as const } }
    : {};
  const yearFilter = options.year ? { year: options.year } : {};

  return prisma.title.count({
    where: {
      ...typeFilter,
      ...genreFilter,
      ...platformFilter,
      ...yearFilter,
      ...(buildTitleSearchWhere(options.query) ?? {}),
    },
  });
}

export const getSongCards = cache(async (options: {
  limit: number;
  skip?: number;
  query?: string;
  excludeSlug?: string;
  appearanceLimit?: number;
  category?: string;
  artist?: string;
  year?: number;
  sort?: "appearances" | "newest" | "oldest" | "title";
}): Promise<SongLibraryItem[]> => {
  const categoryFilter = options.category
    ? { mood: options.category }
    : {};
  const artistFilter = options.artist
    ? { artist: options.artist }
    : {};
  const yearFilter = options.year
    ? { appearances: { some: { title: { year: options.year } } } }
    : {};

  const sortMap: Record<string, Prisma.SongOrderByWithRelationInput[]> = {
    appearances: [{ appearances: { _count: "desc" } }, { title: "asc" }],
    newest: [{ title: "asc" }],
    oldest: [{ title: "asc" }],
    title: [{ title: "asc" }],
  };

  const isSearch = !!options.query;
  const fetchLimit = isSearch ? Math.max(options.limit * 4, 40) : options.limit;

  const songs = await prisma.song.findMany({
    where: {
      ...(options.excludeSlug ? { slug: { not: options.excludeSlug } } : {}),
      ...categoryFilter,
      ...artistFilter,
      ...yearFilter,
      ...(buildSongSearchWhere(options.query) ?? {}),
    },
    orderBy: isSearch ? [{ title: "asc" }] : (sortMap[options.sort ?? "appearances"] ?? sortMap.appearances),
    skip: isSearch ? 0 : (options.skip ?? 0),
    take: fetchLimit,
    include: {
      appearances: {
        include: {
          title: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      },
    },
  });

  const items = songs.map((song) =>
    mapSongLibraryItem(song, {
      appearanceLimit: options.appearanceLimit,
    }),
  );

  if (isSearch) {
    const q = options.query!;
    items.sort((a, b) => songSearchRelevance(a, q) - songSearchRelevance(b, q));
    return items.slice(0, options.limit);
  }

  return items;
});

export const getTitleFilterOptions = cache(async (type?: ContentType): Promise<{
  genres: string[];
  platforms: string[];
  years: string[];
}> => {
  const typeFilter = type
    ? { type: type === "movie" ? TitleType.movie : TitleType.series }
    : {};

  const [genreRows, platformRows, yearRows] = await Promise.all([
    prisma.genre.findMany({
      where: { titles: { some: { title: typeFilter } } },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.title.findMany({
      where: typeFilter,
      select: { platform: true },
      distinct: ["platform"],
      orderBy: { platform: "asc" },
    }),
    prisma.title.findMany({
      where: typeFilter,
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  return {
    genres: genreRows.map((r) => r.name),
    platforms: platformRows.map((r) => r.platform).filter(Boolean),
    years: yearRows.map((r) => String(r.year)),
  };
});

export const getSongFilterOptions = cache(async (): Promise<{
  categories: string[];
  artists: string[];
  years: string[];
  formats: string[];
}> => {
  const [moodRows, artistRows] = await Promise.all([
    prisma.song.findMany({
      select: { mood: true },
      distinct: ["mood"],
      orderBy: { mood: "asc" },
    }),
    prisma.song.findMany({
      select: { artist: true },
      distinct: ["artist"],
      orderBy: { artist: "asc" },
    }),
  ]);

  return {
    categories: moodRows.map((r) => r.mood).filter(Boolean),
    artists: artistRows.map((r) => r.artist).filter(Boolean),
    years: [],
    formats: [],
  };
});

export async function getSongCardCount(options: {
  query?: string;
  category?: string;
  artist?: string;
  year?: number;
}): Promise<number> {
  const categoryFilter = options.category ? { mood: options.category } : {};
  const artistFilter = options.artist ? { artist: options.artist } : {};
  const yearFilter = options.year
    ? { appearances: { some: { title: { year: options.year } } } }
    : {};

  return prisma.song.count({
    where: {
      ...categoryFilter,
      ...artistFilter,
      ...yearFilter,
      ...(buildSongSearchWhere(options.query) ?? {}),
    },
  });
}

export const getHomeEpisodeCards = cache(
  async (
    limit: number,
  ): Promise<
    Array<{
      id: string;
      seriesSlug: string;
      seriesTitle: string;
      seriesYear: number;
      image: string;
      seasonNumber: number;
      episodeNumber: number;
      episodeTitle: string;
      summary: string;
      songsCount: number;
      leadSong: string;
    }>
  > => {
  const episodes = await prisma.episode.findMany({
    take: limit,
    orderBy: [
      {
        season: {
          title: {
            year: "desc",
          },
        },
      },
      {
        season: {
          seasonNumber: "desc",
        },
      },
      {
        episodeNumber: "desc",
      },
    ],
    select: {
      id: true,
      episodeNumber: true,
      title: true,
      summary: true,
      season: {
        select: {
          seasonNumber: true,
          title: {
            select: {
              slug: true,
              title: true,
              year: true,
              backdrop: true,
            },
          },
        },
      },
      appearances: {
        select: {
          song: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
      _count: {
        select: {
          appearances: true,
        },
      },
    },
  });

  return episodes.map((episode: DbHomeEpisode) => ({
    id: String(episode.id),
    seriesSlug: episode.season.title.slug,
    seriesTitle: episode.season.title.title,
    seriesYear: episode.season.title.year,
    image: episode.season.title.backdrop,
    seasonNumber: episode.season.seasonNumber,
    episodeNumber: episode.episodeNumber,
    episodeTitle: episode.title,
    summary: episode.summary,
    songsCount: episode._count.appearances,
    leadSong: episode.appearances[0]?.song.title ?? "Soundtrack update",
  }));
  },
);

export async function getSongsByArtists(options: {
  artists: string[];
  appearanceLimit?: number;
}): Promise<SongLibraryItem[]> {
  if (options.artists.length === 0) {
    return [];
  }

  const songs = await prisma.song.findMany({
    where: {
      artist: {
        in: options.artists,
      },
    },
    orderBy: [{ appearances: { _count: "desc" } }, { title: "asc" }],
    include: {
      appearances: {
        include: {
          title: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      },
    },
  });

  return songs.map((song) =>
    mapSongLibraryItem(song, {
      appearanceLimit: options.appearanceLimit,
    }),
  );
}

export async function getMovieBySlug(slug: string): Promise<MovieEntry | undefined> {
  const movie = await prisma.title.findFirst({
    where: {
      slug,
      type: TitleType.movie,
    },
    include: movieDetailInclude,
  });

  return movie ? mapMovieEntry(movie) : undefined;
}

export async function getSeriesBySlug(slug: string): Promise<SeriesEntry | undefined> {
  const series = await prisma.title.findFirst({
    where: {
      slug,
      type: TitleType.series,
    },
    include: seriesDetailInclude,
  });

  return series ? mapSeriesEntry(series) : undefined;
}

export async function getContentBySlug(
  type: "movie",
  slug: string,
): Promise<MovieEntry | undefined>;
export async function getContentBySlug(
  type: "series",
  slug: string,
): Promise<SeriesEntry | undefined>;
export async function getContentBySlug(
  type: "movie" | "series",
  slug: string,
): Promise<CatalogEntry | undefined> {
  return type === "movie" ? getMovieBySlug(slug) : getSeriesBySlug(slug);
}

export async function getSongBySlug(slug: string): Promise<SongLibraryItem | undefined> {
  const song = await prisma.song.findUnique({
    where: {
      slug,
    },
    include: {
      appearances: {
        include: {
          title: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      },
    },
  });

  return song ? mapSongLibraryItem(song) : undefined;
}

export async function getRelatedMovies(currentSlug: string, limit = 4): Promise<MovieEntry[]> {
  const currentMovie = await prisma.title.findFirst({
    where: { slug: currentSlug, type: TitleType.movie },
    select: { ...titleCardSelect, genres: { include: { genre: true } } },
  });

  if (!currentMovie) {
    const fallback = await prisma.title.findMany({
      where: { type: TitleType.movie },
      orderBy: [{ year: "desc" }, { rating: "desc" }],
      take: limit,
      select: titleCardSelect,
    });
    return fallback.map((m) => mapTitleCard(m) as MovieEntry);
  }

  const genreNames = currentMovie.genres.map((g) => g.genre.name);

  const genreMatched = await prisma.title.findMany({
    where: {
      type: TitleType.movie,
      slug: { not: currentSlug },
      genres: { some: { genre: { name: { in: genreNames } } } },
    },
    orderBy: [{ rating: "desc" }, { year: "desc" }],
    take: limit,
    select: titleCardSelect,
  });

  if (genreMatched.length >= limit) {
    return genreMatched.map((m) => mapTitleCard(m) as MovieEntry);
  }

  const usedSlugs = new Set(genreMatched.map((m) => m.slug));
  usedSlugs.add(currentSlug);

  const fallback = await prisma.title.findMany({
    where: {
      type: TitleType.movie,
      slug: { notIn: [...usedSlugs] },
    },
    orderBy: [{ year: "desc" }, { rating: "desc" }],
    take: limit - genreMatched.length,
    select: titleCardSelect,
  });

  return [...genreMatched, ...fallback].map((m) => mapTitleCard(m) as MovieEntry);
}

export async function getRelatedSongs(currentSlug: string, limit = 4): Promise<SongLibraryItem[]> {
  return getSongCards({
    limit,
    excludeSlug: currentSlug,
  });
}

export async function searchCatalog(query: string): Promise<{
  content: CatalogEntry[];
  songs: SongLibraryItem[];
}> {
  const normalized = query.trim().toLowerCase();
  const { catalog, songLibrary } = await getCatalogSnapshot();

  if (!normalized) {
    return {
      content: catalog,
      songs: songLibrary,
    };
  }

  return {
    content: catalog.filter((entry) =>
      [entry.title, entry.description, entry.type, entry.platform, ...entry.genres]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
    songs: songLibrary.filter((song) =>
      [song.title, song.artist, song.mood, song.album ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
  };
}

export async function getTitleCountByType(type: ContentType): Promise<number> {
  return prisma.title.count({
    where: {
      type: type === "movie" ? TitleType.movie : TitleType.series,
    },
  });
}
