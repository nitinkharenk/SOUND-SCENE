import {
  getCatalog,
  getCatalogCards,
  getSceneLibrary,
  getSongCards,
  getSongLibrary,
  type CatalogEntry,
  type ContentType,
  type FlattenedSceneItem,
  type SongLibraryItem,
} from "@/lib/content-store";
import { prisma } from "@/lib/prisma";
import { slugifyLabel } from "@/lib/text";

export type ArtistProfile = {
  slug: string;
  name: string;
  songs: SongLibraryItem[];
  appearancesCount: number;
  soundtrackCount: number;
  titles: Array<{
    slug: string;
    title: string;
    type: ContentType;
    year: number;
  }>;
};

export type ArtistSearchResult = {
  slug: string;
  name: string;
  songsCount: number;
  appearancesCount: number;
  soundtrackCount: number;
  topSong?: SongLibraryItem;
};

export type DiscoverGenrePageData = {
  slug: string;
  name: string;
  description: string;
  songs: SongLibraryItem[];
  titles: CatalogEntry[];
  featuredSong?: SongLibraryItem;
  featuredTitle?: CatalogEntry;
};

export type SceneCollectionData = {
  slug: string;
  name: string;
  description: string;
  cues: FlattenedSceneItem[];
  titles: CatalogEntry[];
  featuredCue?: FlattenedSceneItem;
};

export type SearchExperienceData = {
  query: string;
  suggestion?: string;
  movies: CatalogEntry[];
  series: CatalogEntry[];
  songs: SongLibraryItem[];
  artists: ArtistSearchResult[];
  editorialSuggestions: {
    movies: CatalogEntry[];
    series: CatalogEntry[];
    songs: SongLibraryItem[];
    artists: ArtistSearchResult[];
  };
};

type SearchCoreResults = {
  query: string;
  suggestion?: string;
  movies: CatalogEntry[];
  series: CatalogEntry[];
  songs: SongLibraryItem[];
  artists: ArtistSearchResult[];
};

const genreDescriptions: Record<string, string> = {
  ambient: "Slow-burn atmospheric songs that stretch a scene without breaking its tension.",
  synthwave: "Neon-soaked tracks for chase scenes, midnight drives, and retro-futurist moods.",
  "dream-pop": "Shimmering, melancholic songs that land on the emotional peaks of a story.",
  pop: "Immediate, melodic cues that make a scene feel bright, sharp, and memorable.",
  alternative: "Off-center soundtrack cuts with texture, edge, and modern indie pull.",
  electronic: "Pulse-heavy cues that tighten suspense and keep momentum moving forward.",
  rock: "Big-impact guitar-led moments built for confrontations, reveals, and catharsis.",
  instrumental: "Score-adjacent tracks that shape mood without overwhelming the picture.",
  soundtrack: "Editorially selected soundtrack cuts grouped by tone, replay value, and scene fit.",
};

const sceneDescriptions: Record<string, string> = {
  opening: "First-impression songs that lock in the tone from the opening frames.",
  montage: "Driving, building, and transformative sequences powered by rhythm and momentum.",
  club: "Nightlife cues that bring energy, movement, and crowd chemistry to the foreground.",
  reveal: "Songs that land exactly when the story opens up, twists, or changes direction.",
  finale: "Closing songs that carry the last emotional hit of the story.",
  breakup: "Heartbreak soundtrack moments built around distance, fallout, and afterglow.",
  turn: "Pivot-point cues where the story changes shape and the soundtrack follows it.",
  "episode-scene": "Memorable episodic cue moments surfaced from series-wide soundtrack mapping.",
};

export async function getArtistProfiles(): Promise<ArtistProfile[]> {
  const [songs, catalog] = await Promise.all([getSongLibrary(), getCatalog()]);
  const catalogBySlug = new Map(catalog.map((entry) => [entry.slug, entry]));
  const profileMap = new Map<string, ArtistProfile>();

  for (const song of songs) {
    const slug = slugifyLabel(song.artist);
    const existing = profileMap.get(slug) ?? {
      slug,
      name: song.artist,
      songs: [],
      appearancesCount: 0,
      soundtrackCount: 0,
      titles: [],
    };

    existing.songs.push(song);
    existing.appearancesCount += song.appearances.length;

    const uniqueTitles = new Map(existing.titles.map((title) => [title.slug, title]));

    for (const appearance of song.appearances) {
      const relatedTitle = catalogBySlug.get(appearance.contentSlug);

      if (relatedTitle) {
        uniqueTitles.set(relatedTitle.slug, {
          slug: relatedTitle.slug,
          title: relatedTitle.title,
          type: relatedTitle.type,
          year: relatedTitle.year,
        });
      }
    }

    existing.titles = [...uniqueTitles.values()].sort(
      (left, right) => right.year - left.year || left.title.localeCompare(right.title),
    );
    existing.soundtrackCount = existing.titles.length;

    profileMap.set(slug, existing);
  }

  return [...profileMap.values()]
    .map((profile) => ({
      ...profile,
      songs: [...profile.songs].sort(
        (left, right) =>
          right.appearances.length - left.appearances.length ||
          left.title.localeCompare(right.title),
      ),
    }))
    .sort(
      (left, right) =>
        right.appearancesCount - left.appearancesCount ||
        left.name.localeCompare(right.name),
    );
}

export async function getArtistProfileBySlug(
  slug: string,
): Promise<ArtistProfile | undefined> {
  const allArtists = await prisma.song.findMany({
    select: { artist: true },
    distinct: ["artist"],
  });
  const matchingArtist = allArtists.find((r) => slugifyLabel(r.artist) === slug)?.artist;
  if (!matchingArtist) return undefined;

  const songs = await getSongCards({ limit: 200, artist: matchingArtist, appearanceLimit: 10 });
  const catalog = await getCatalogCards({ limit: 200 });
  const catalogBySlug = new Map(catalog.map((entry) => [entry.slug, entry]));

  const profile: ArtistProfile = {
    slug,
    name: matchingArtist,
    songs: [],
    appearancesCount: 0,
    soundtrackCount: 0,
    titles: [],
  };

  const uniqueTitles = new Map<string, ArtistProfile["titles"][number]>();

  for (const song of songs) {
    profile.songs.push(song);
    profile.appearancesCount += song.appearances.length;

    for (const appearance of song.appearances) {
      const relatedTitle = catalogBySlug.get(appearance.contentSlug);
      if (relatedTitle) {
        uniqueTitles.set(relatedTitle.slug, {
          slug: relatedTitle.slug,
          title: relatedTitle.title,
          type: relatedTitle.type,
          year: relatedTitle.year,
        });
      }
    }
  }

  profile.titles = [...uniqueTitles.values()].sort(
    (left, right) => right.year - left.year || left.title.localeCompare(right.title),
  );
  profile.soundtrackCount = profile.titles.length;
  profile.songs.sort(
    (left, right) =>
      right.appearances.length - left.appearances.length || left.title.localeCompare(right.title),
  );

  return profile;
}

export async function getArtistSearchResults(
  query?: string,
): Promise<ArtistSearchResult[]> {
  const normalized = query?.trim().toLowerCase() ?? "";
  const profiles = await getArtistProfiles();

  return profiles
    .filter((profile) =>
      normalized
        ? profile.name.toLowerCase().includes(normalized) ||
          profile.songs.some((song) => song.title.toLowerCase().includes(normalized))
        : true,
    )
    .map((profile) => ({
      slug: profile.slug,
      name: profile.name,
      songsCount: profile.songs.length,
      appearancesCount: profile.appearancesCount,
      soundtrackCount: profile.soundtrackCount,
      topSong: profile.songs[0],
    }))
    .slice(0, 12);
}

function buildArtistSearchResultsFromSongs(
  songs: SongLibraryItem[],
  normalizedQuery: string,
  limit: number,
): ArtistSearchResult[] {
  const profileMap = new Map<
    string,
    {
      slug: string;
      name: string;
      songs: SongLibraryItem[];
      appearancesCount: number;
      titleSlugs: Set<string>;
    }
  >();

  for (const song of songs) {
    const slug = slugifyLabel(song.artist);
    const existing = profileMap.get(slug) ?? {
      slug,
      name: song.artist,
      songs: [],
      appearancesCount: 0,
      titleSlugs: new Set<string>(),
    };

    existing.songs.push(song);
    existing.appearancesCount += song.appearances.length;

    for (const appearance of song.appearances) {
      existing.titleSlugs.add(appearance.contentSlug);
    }

    profileMap.set(slug, existing);
  }

  return [...profileMap.values()]
    .filter((profile) =>
      normalizedQuery
        ? profile.name.toLowerCase().includes(normalizedQuery) ||
          profile.songs.some((song) => song.title.toLowerCase().includes(normalizedQuery))
        : true,
    )
    .map((profile) => {
      const sortedSongs = [...profile.songs].sort(
        (left, right) =>
          right.appearances.length - left.appearances.length ||
          left.title.localeCompare(right.title),
      );

      return {
        slug: profile.slug,
        name: profile.name,
        songsCount: sortedSongs.length,
        appearancesCount: profile.appearancesCount,
        soundtrackCount: profile.titleSlugs.size,
        topSong: sortedSongs[0],
      };
    })
    .sort(
      (left, right) =>
        right.appearancesCount - left.appearancesCount ||
        left.name.localeCompare(right.name),
    )
    .slice(0, limit);
}

async function getDirectArtistSearchResults(
  query: string,
  limit = 12,
): Promise<ArtistSearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const seedSongs = await getSongCards({
    limit: 24,
    query,
    appearanceLimit: 1,
  });

  return buildArtistSearchResultsFromSongs(seedSongs, normalizedQuery, limit);
}

async function getEditorialArtistSuggestions(limit = 3): Promise<ArtistSearchResult[]> {
  const songs = await getSongCards({
    limit: 24,
    appearanceLimit: 1,
  });

  return buildArtistSearchResultsFromSongs(songs, "", limit);
}

export async function getSearchCoreResults(
  query: string,
): Promise<SearchCoreResults> {
  const trimmedQuery = query.trim();
  const normalized = trimmedQuery.toLowerCase();

  if (!normalized) {
    return {
      query,
      movies: [],
      series: [],
      songs: [],
      artists: [],
    };
  }

  const [movies, series, songMatches, artists] = await Promise.all([
    getCatalogCards({ type: "movie", limit: 8, query: trimmedQuery }),
    getCatalogCards({ type: "series", limit: 8, query: trimmedQuery }),
    getSongCards({ limit: 10, query: trimmedQuery, appearanceLimit: 1 }),
    getDirectArtistSearchResults(trimmedQuery, 8),
  ]);

  const searchableTerms = Array.from(
    new Set([
      ...movies.map((entry) => entry.title),
      ...series.map((entry) => entry.title),
      ...songMatches.flatMap((song) => [song.title, song.artist]),
      ...artists.map((artist) => artist.name),
    ]),
  ).slice(0, 40);

  return {
    query,
    suggestion: getSearchSuggestion(normalized, searchableTerms),
    movies,
    series,
    songs: songMatches,
    artists,
  };
}

async function getSearchEditorialSuggestions() {
  const [editorialMovies, editorialSeries, editorialSongs, editorialArtists] =
    await Promise.all([
      getCatalogCards({ type: "movie", limit: 3 }),
      getCatalogCards({ type: "series", limit: 3 }),
      getSongCards({ limit: 3, appearanceLimit: 1 }),
      getEditorialArtistSuggestions(3),
    ]);

  return {
    movies: editorialMovies,
    series: editorialSeries,
    songs: editorialSongs,
    artists: editorialArtists,
  };
}

export async function getDiscoverGenreSlugs(): Promise<string[]> {
  const moodRows = await prisma.song.findMany({
    select: { mood: true },
    distinct: ["mood"],
  });
  return [...new Set(moodRows.map((r) => slugifyLabel(r.mood || "soundtrack")))].sort();
}

export async function getDiscoverGenreData(
  slug: string,
): Promise<DiscoverGenrePageData | undefined> {
  const allMoods = await prisma.song.findMany({
    select: { mood: true },
    distinct: ["mood"],
  });
  const matchingMood = allMoods.find((r) => slugifyLabel(r.mood || "soundtrack") === slug)?.mood;
  if (!matchingMood) return undefined;

  const [songs, catalog] = await Promise.all([
    getSongCards({ limit: 100, category: matchingMood, appearanceLimit: 3 }),
    getCatalogCards({ limit: 50 }),
  ]);
  const matchingSongs = songs;

  if (matchingSongs.length === 0) {
    return undefined;
  }

  const titleSlugs = new Set(
    matchingSongs.flatMap((song) => song.appearances.map((appearance) => appearance.contentSlug)),
  );
  const titles = catalog.filter((entry) => titleSlugs.has(entry.slug));
  const name = matchingSongs[0]?.mood || "Soundtrack";

  return {
    slug,
    name,
    description:
      genreDescriptions[slug] ??
      `Editorial picks and soundtrack appearances grouped around the ${name.toLowerCase()} mood.`,
    songs: matchingSongs
      .slice()
      .sort(
        (left, right) =>
          right.appearances.length - left.appearances.length ||
          left.title.localeCompare(right.title),
      ),
    titles: titles
      .slice()
      .sort((left, right) => right.year - left.year || left.title.localeCompare(right.title)),
    featuredSong: matchingSongs[0],
    featuredTitle: titles[0],
  };
}

export async function getSceneCollectionSlugs(): Promise<string[]> {
  const sceneTypeRows = await prisma.songAppearance.findMany({
    select: { sceneType: true },
    distinct: ["sceneType"],
  });
  return [...new Set(sceneTypeRows.map((r) => slugifyLabel(r.sceneType || "Episode Scene")))].sort();
}

export async function getSceneCollectionData(
  slug: string,
): Promise<SceneCollectionData | undefined> {
  const [cues, catalog] = await Promise.all([getSceneLibrary(), getCatalogCards({ limit: 50 })]);
  const matchingCues = cues.filter(
    (cue) => slugifyLabel(cue.sceneType || "Episode Scene") === slug,
  );

  if (matchingCues.length === 0) {
    return undefined;
  }

  const titleSlugs = new Set(matchingCues.map((cue) => cue.contentSlug));
  const titles = catalog.filter((entry) => titleSlugs.has(entry.slug));
  const name = matchingCues[0]?.sceneType || "Episode Scene";

  return {
    slug,
    name,
    description:
      sceneDescriptions[slug] ??
      `Mapped soundtrack moments collected around ${name.toLowerCase()} scenes across the catalog.`,
    cues: matchingCues
      .slice()
      .sort((left, right) => (left.timestamp ?? "").localeCompare(right.timestamp ?? "")),
    titles: titles
      .slice()
      .sort((left, right) => right.year - left.year || left.title.localeCompare(right.title)),
    featuredCue: matchingCues[0],
  };
}

export async function getSearchExperienceData(
  query: string,
): Promise<SearchExperienceData> {
  const coreResults = await getSearchCoreResults(query);
  const hasQuery = query.trim().length > 0;
  const hasMatches =
    coreResults.movies.length +
      coreResults.series.length +
      coreResults.songs.length +
      coreResults.artists.length >
    0;

  if (!hasQuery) {
    return {
      ...coreResults,
      editorialSuggestions: await getSearchEditorialSuggestions(),
    };
  }

  if (!hasMatches) {
    return {
      ...coreResults,
      editorialSuggestions: await getSearchEditorialSuggestions(),
    };
  }

  return {
    ...coreResults,
    editorialSuggestions: {
      movies: [],
      series: [],
      songs: [],
      artists: [],
    },
  };
}

export async function getLatestFeedItems(): Promise<
  Array<{
    title: string;
    href: string;
    description: string;
    pubDate: Date;
    category: string;
  }>
> {
  const [catalog, songs] = await Promise.all([
    getCatalogCards({ limit: 8 }),
    getSongCards({ limit: 8, appearanceLimit: 0 }),
  ]);
  const titleItems = catalog.slice(0, 8).map((entry) => ({
    title: entry.title,
    href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
    description: entry.tagline || entry.description,
    pubDate: new Date(`${entry.year}-01-01T00:00:00.000Z`),
    category: entry.type === "movie" ? "Movie" : "Series",
  }));
  const songItems = songs.slice(0, 8).map((song) => ({
    title: song.title,
    href: `/songs/${song.slug}`,
    description: `${song.artist} · ${song.mood}`,
    pubDate: new Date(),
    category: "Song",
  }));

  return [...titleItems, ...songItems]
    .sort((left, right) => right.pubDate.getTime() - left.pubDate.getTime())
    .slice(0, 12);
}

function getSearchSuggestion(query: string, options: string[]): string | undefined {
  if (query.length < 3) {
    return undefined;
  }

  let bestMatch: { term: string; score: number } | undefined;

  for (const option of options) {
    const normalizedOption = option.toLowerCase();

    if (normalizedOption === query || normalizedOption.includes(query)) {
      continue;
    }

    const score = levenshteinDistance(query, normalizedOption);

    if (score > Math.max(4, Math.floor(normalizedOption.length / 2))) {
      continue;
    }

    if (!bestMatch || score < bestMatch.score) {
      bestMatch = {
        term: option,
        score,
      };
    }
  }

  return bestMatch?.term;
}

function levenshteinDistance(left: string, right: string): number {
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let row = 0; row <= left.length; row += 1) {
    matrix[row]![0] = row;
  }

  for (let column = 0; column <= right.length; column += 1) {
    matrix[0]![column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;

      matrix[row]![column] = Math.min(
        matrix[row - 1]![column]! + 1,
        matrix[row]![column - 1]! + 1,
        matrix[row - 1]![column - 1]! + cost,
      );
    }
  }

  return matrix[left.length]![right.length]!;
}
