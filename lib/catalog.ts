const image = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export type ContentType = "movie" | "series";

export type Song = {
  slug: string;
  title: string;
  artist: string;
  mood: string;
  youtubeLink: string;
  spotifyLink: string;
};

export type MovieSoundtrackItem = {
  order: number;
  sceneType: string;
  timestamp: string;
  sceneDescription: string;
  song: Song;
};

export type EpisodeSoundtrackItem = {
  order: number;
  timestamp: string;
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

export type FeaturedCollection = {
  title: string;
  description: string;
  color: string;
};

export type FlattenedSceneItem = {
  contentSlug: string;
  contentTitle: string;
  contentType: ContentType;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle?: string;
  order: number;
  sceneType?: string;
  timestamp: string;
  sceneDescription: string;
  song: Song;
};

export type SongAppearance = {
  contentSlug: string;
  contentTitle: string;
  contentType: ContentType;
  sceneType: string;
  timestamp: string;
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

const posterImageIds = [
  "photo-1517604931442-7e0c8ed2963c",
  "photo-1513106580091-1d82408b8cd6",
  "photo-1485846234645-a62644f84728",
  "photo-1505238680356-667803448bb6",
  "photo-1518998053901-5348d3961a04",
  "photo-1536440136628-849c177e76a1",
  "photo-1489599849927-2ee91cede3ba",
  "photo-1499364615650-ec38552f4f34",
] as const;

const backdropImageIds = [
  "photo-1500530855697-b586d89ba3ee",
  "photo-1497032628192-86f99bcd76bc",
  "photo-1511671782779-c97d3d27a1d4",
  "photo-1470225620780-dba8ba36b745",
  "photo-1504674900247-0877df9cc836",
  "photo-1493225457124-a3eb161ffa5f",
  "photo-1501386761578-eac5c94b800a",
  "photo-1500534314209-a25ddb2bd429",
] as const;

const movieGenreSets = [
  ["Thriller", "Drama", "Soundtrack"],
  ["Action", "Noir", "Late Night"],
  ["Romance", "Indie", "Mixtape"],
  ["Sci-Fi", "Mystery", "Synthwave"],
  ["Comedy", "Coming-of-age", "Playlist"],
] as const;

const seriesGenreSets = [
  ["Drama", "Series", "Neo-noir"],
  ["Mystery", "Series", "Electronic"],
  ["Crime", "Series", "Prestige"],
  ["Sci-Fi", "Series", "Atmospheric"],
] as const;

const platforms = [
  "StreamBox",
  "Vista+",
  "Prime View",
  "Nexa",
  "Pulse TV",
  "CineMax",
] as const;

const cities = [
  "Tokyo",
  "Seoul",
  "Mumbai",
  "Berlin",
  "Lagos",
  "Mexico City",
  "London",
  "Los Angeles",
] as const;

const artists = [
  "Velvet Signal",
  "Nova Bloom",
  "Satin Circuit",
  "North Receiver",
  "June Arcade",
  "Analog Hearts",
  "Night Relay",
  "Echo Valley",
] as const;

const songMoods = [
  "Neon pulse",
  "Midnight drive",
  "Warm static",
  "Dream-pop lift",
  "Tension synth",
  "Golden hour haze",
] as const;

const movieTitlePrefixes = [
  "Neon",
  "Midnight",
  "Velvet",
  "Static",
  "Golden",
  "Echo",
  "Silver",
  "Electric",
] as const;

const movieTitleSuffixes = [
  "Boulevard",
  "Frequency",
  "Mirage",
  "Paradox",
  "Letters",
  "Casino",
  "Drive",
  "Signal",
] as const;

const seriesTitlePrefixes = [
  "Violet",
  "Signal",
  "Shadow",
  "Afterlight",
  "Parallel",
  "Mercury",
  "Glass",
  "Lowlight",
] as const;

const seriesTitleSuffixes = [
  "District",
  "Archive",
  "Tapes",
  "Control",
  "Heights",
  "Relay",
  "Index",
  "Season",
] as const;

const baseCatalog: CatalogEntry[] = [
  {
    slug: "neon-skyline",
    title: "Neon Skyline",
    type: "movie",
    year: 2025,
    rating: "8.7",
    runtime: "2h 08m",
    platform: "Theatrical / StreamBox",
    genres: ["Sci-Fi", "Thriller", "Night Drive"],
    tagline: "A getaway driver, a vanished singer, and one impossible night.",
    description:
      "A sleek chase thriller built around downtown glow, rooftop encounters, and a synth-heavy soundtrack map curated scene by scene.",
    poster: image("photo-1517604931442-7e0c8ed2963c"),
    backdrop: image("photo-1500530855697-b586d89ba3ee"),
    soundtrack: [
      {
        order: 1,
        sceneType: "Opening",
        timestamp: "00:04:12",
        sceneDescription:
          "Lena tears through the rain-soaked freeway while police lights smear across the windshield.",
        song: {
          slug: "after-hours-static",
          title: "After Hours Static",
          artist: "Velvet Signal",
          mood: "Synthetic rush",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 2,
        sceneType: "Club",
        timestamp: "00:37:40",
        sceneDescription:
          "Inside Club Mirage, the camera circles the missing singer just before the lights cut out.",
        song: {
          slug: "mirror-heartbeat",
          title: "Mirror Heartbeat",
          artist: "Nova Bloom",
          mood: "Dark dance-pop",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 3,
        sceneType: "Finale",
        timestamp: "01:52:03",
        sceneDescription:
          "The skyline powers back on as Lena and Ari step onto the unfinished tower at dawn.",
        song: {
          slug: "dawn-on-repeat",
          title: "Dawn on Repeat",
          artist: "Satin Circuit",
          mood: "Triumphant slow burn",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
    ],
  },
  {
    slug: "afterlight-casino",
    title: "Afterlight Casino",
    type: "movie",
    year: 2024,
    rating: "8.2",
    runtime: "1h 56m",
    platform: "Prime View",
    genres: ["Heist", "Drama", "Noir"],
    tagline: "Every table is wired. Every song is a clue.",
    description:
      "A high-stakes casino heist told through velvet interiors, coded glances, and a glamorous soundtrack that shifts with each layer of the con.",
    poster: image("photo-1513106580091-1d82408b8cd6"),
    backdrop: image("photo-1497032628192-86f99bcd76bc"),
    soundtrack: [
      {
        order: 1,
        sceneType: "Montage",
        timestamp: "00:18:22",
        sceneDescription:
          "The crew rehearses the scam in an empty hotel ballroom under service lights.",
        song: {
          slug: "velvet-countdown",
          title: "Velvet Countdown",
          artist: "The Gold Routine",
          mood: "Cocktail groove",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 2,
        sceneType: "Reveal",
        timestamp: "01:08:11",
        sceneDescription:
          "Cass slips the marked chip across the roulette table just as the mark recognizes her.",
        song: {
          slug: "hold-the-lights",
          title: "Hold the Lights",
          artist: "Midnight Embassy",
          mood: "Tension soul",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 3,
        sceneType: "Exit",
        timestamp: "01:49:00",
        sceneDescription:
          "The elevators open to sunrise and the crew leaves separately through the casino lobby.",
        song: {
          slug: "silent-jackpot",
          title: "Silent Jackpot",
          artist: "Iris Arcade",
          mood: "Confident closer",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
    ],
  },
  {
    slug: "static-hearts",
    title: "Static Hearts",
    type: "movie",
    year: 2026,
    rating: "9.1",
    runtime: "2h 15m",
    platform: "CineMax",
    genres: ["Romance", "Drama", "Indie"],
    tagline: "They met on pirate radio. The city listened in.",
    description:
      "A bittersweet romance about two late-night radio hosts whose playlists become a diary for everyone tuning in.",
    poster: image("photo-1485846234645-a62644f84728"),
    backdrop: image("photo-1511671782779-c97d3d27a1d4"),
    soundtrack: [
      {
        order: 1,
        sceneType: "Meet-cute",
        timestamp: "00:22:30",
        sceneDescription:
          "Maya passes Noah a handwritten playlist through the studio glass while the city loses power.",
        song: {
          slug: "blue-room-frequency",
          title: "Blue Room Frequency",
          artist: "June Arcade",
          mood: "Warm lo-fi soul",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 2,
        sceneType: "Breakup",
        timestamp: "01:29:54",
        sceneDescription:
          "The midnight broadcast cuts into static while Noah reads the final dedications on air.",
        song: {
          slug: "until-the-signal-breaks",
          title: "Until the Signal Breaks",
          artist: "Paper Satellites",
          mood: "Tender ache",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
      {
        order: 3,
        sceneType: "Final song",
        timestamp: "02:09:02",
        sceneDescription:
          "The rooftop transmitter hums back to life and their last shared song spills over the skyline.",
        song: {
          slug: "city-in-a-loop",
          title: "City in a Loop",
          artist: "Analog Hearts",
          mood: "Big emotional release",
          youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          spotifyLink: "https://open.spotify.com/",
        },
      },
    ],
  },
  {
    slug: "signal-lost",
    title: "Signal Lost",
    type: "series",
    year: 2025,
    rating: "8.9",
    seasonsCount: 2,
    platform: "Nexa",
    genres: ["Mystery", "Sci-Fi", "Series"],
    tagline: "The station is dead. The playlist keeps changing.",
    description:
      "A serialized mystery about a remote listening outpost where every episode reveals another hidden transmission and another crucial song cue.",
    poster: image("photo-1505238680356-667803448bb6"),
    backdrop: image("photo-1470225620780-dba8ba36b745"),
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "The Quiet Frequency",
            summary:
              "A new engineer arrives at Outpost Eight and hears music in a sealed room no one can enter.",
            songs: [
              {
                order: 1,
                timestamp: "00:11:06",
                sceneDescription:
                  "A faint melody leaks through the ventilation duct as the station lights flicker.",
                song: {
                  slug: "hollow-transmission",
                  title: "Hollow Transmission",
                  artist: "North Receiver",
                  mood: "Ambient dread",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
              {
                order: 2,
                timestamp: "00:43:55",
                sceneDescription:
                  "The sealed archive opens and the entire station hears the same chorus at once.",
                song: {
                  slug: "cold-lanterns",
                  title: "Cold Lanterns",
                  artist: "Night Relay",
                  mood: "Frozen crescendo",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
            ],
          },
          {
            episodeNumber: 2,
            title: "Static in the Snow",
            summary:
              "A blizzard isolates the station and the crew finds coded timestamps hidden in old playlists.",
            songs: [
              {
                order: 1,
                timestamp: "00:08:48",
                sceneDescription:
                  "The first storm front rolls in over the antenna field as everyone rushes to secure the generators.",
                song: {
                  slug: "whiteout-disco",
                  title: "Whiteout Disco",
                  artist: "Echo Valley",
                  mood: "Urgent shimmer",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
            ],
          },
        ],
      },
      {
        seasonNumber: 2,
        episodes: [
          {
            episodeNumber: 4,
            title: "The Last Antenna",
            summary:
              "The station goes dark and the team climbs the mountain to send one final broadcast.",
            songs: [
              {
                order: 1,
                timestamp: "00:51:03",
                sceneDescription:
                  "On the ridge line, Mara aims the dish into the storm while the signal finally locks.",
                song: {
                  slug: "through-the-surge",
                  title: "Through the Surge",
                  artist: "Signal Choir",
                  mood: "Heroic tension",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "violet-district",
    title: "Violet District",
    type: "series",
    year: 2026,
    rating: "8.5",
    seasonsCount: 1,
    platform: "Vista+",
    genres: ["Crime", "Drama", "Series"],
    tagline: "Every neighborhood has a soundtrack. This one bites back.",
    description:
      "A prestige crime series where each episode pairs a neighborhood case file with carefully placed tracks, timestamps, and emotional scene notes.",
    poster: image("photo-1518998053901-5348d3961a04"),
    backdrop: image("photo-1504674900247-0877df9cc836"),
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "Red Wire",
            summary:
              "Detective Imani returns home to investigate a warehouse fire that erased an entire evidence room.",
            songs: [
              {
                order: 1,
                timestamp: "00:15:19",
                sceneDescription:
                  "Imani drives through the industrial waterfront while the fire still burns in the distance.",
                song: {
                  slug: "brick-by-brick",
                  title: "Brick by Brick",
                  artist: "The Hollow State",
                  mood: "Pulse-heavy noir",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
            ],
          },
          {
            episodeNumber: 3,
            title: "Summer Inventory",
            summary:
              "A neighborhood block party becomes a surveillance trap after one witness changes her story.",
            songs: [
              {
                order: 1,
                timestamp: "00:27:44",
                sceneDescription:
                  "The camera drifts between dancers, detectives, and a hidden exchange near the DJ booth.",
                song: {
                  slug: "heatwave-ledger",
                  title: "Heatwave Ledger",
                  artist: "Saint Avenue",
                  mood: "Slick and suspicious",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
              {
                order: 2,
                timestamp: "00:54:08",
                sceneDescription:
                  "Imani replays the security footage and notices the witness mouthing a lyric instead of a name.",
                song: {
                  slug: "spoken-in-neon",
                  title: "Spoken in Neon",
                  artist: "Lina Vale",
                  mood: "Chillwave clue drop",
                  youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  spotifyLink: "https://open.spotify.com/",
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

function padIndex(value: number): string {
  return value.toString().padStart(3, "0");
}

function createSong(seed: number, variant: number) {
  const songNumber = seed * 10 + variant;

  return {
    slug: `dummy-track-${padIndex(songNumber)}`,
    title: `Dummy Track ${padIndex(songNumber)}`,
    artist: artists[(seed + variant) % artists.length],
    mood: songMoods[(seed + variant) % songMoods.length],
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    spotifyLink: "https://open.spotify.com/",
  };
}

function createMovieEntry(index: number): MovieEntry {
  const genres = movieGenreSets[index % movieGenreSets.length];
  const city = cities[index % cities.length];
  const title = `${movieTitlePrefixes[index % movieTitlePrefixes.length]} ${movieTitleSuffixes[(index + 2) % movieTitleSuffixes.length]} ${padIndex(index)}`;

  return {
    slug: `dummy-movie-${padIndex(index)}`,
    title,
    type: "movie",
    year: 2020 + (index % 7),
    rating: (7.1 + (index % 19) * 0.1).toFixed(1),
    runtime: `${96 + (index % 35)}m`,
    platform: platforms[index % platforms.length],
    genres: [...genres],
    tagline: `${city} nights, sharp instincts, and one unforgettable soundtrack trail.`,
    description: `Dummy movie entry ${padIndex(index)} follows a stylish chase through ${city}, with scene-by-scene soundtrack notes designed to stress test discovery, search, and browsing layouts.`,
    poster: image(posterImageIds[index % posterImageIds.length]),
    backdrop: image(backdropImageIds[(index + 1) % backdropImageIds.length]),
    soundtrack: [
      {
        order: 1,
        sceneType: "Opening",
        timestamp: "00:06:12",
        sceneDescription: `The story opens in ${city} as the lead disappears into a wall of light and traffic.`,
        song: createSong(index, 1),
      },
      {
        order: 2,
        sceneType: "Turn",
        timestamp: "00:44:28",
        sceneDescription: `A key reveal resets the mission and turns the soundtrack darker, faster, and more urgent.`,
        song: createSong(index, 2),
      },
      {
        order: 3,
        sceneType: "Finale",
        timestamp: "01:31:46",
        sceneDescription: `The finale lands on a skyline payoff that gives the closing cue room to breathe.`,
        song: createSong(index, 3),
      },
    ],
  };
}

function createSeriesEntry(index: number): SeriesEntry {
  const genres = seriesGenreSets[index % seriesGenreSets.length];
  const city = cities[(index + 3) % cities.length];
  const title = `${seriesTitlePrefixes[index % seriesTitlePrefixes.length]} ${seriesTitleSuffixes[(index + 1) % seriesTitleSuffixes.length]} ${padIndex(index)}`;

  return {
    slug: `dummy-series-${padIndex(index)}`,
    title,
    type: "series",
    year: 2021 + (index % 6),
    rating: (7.4 + (index % 17) * 0.1).toFixed(1),
    seasonsCount: 1,
    platform: platforms[(index + 2) % platforms.length],
    genres: [...genres],
    tagline: `Every episode in ${city} leaves behind a different clue and a different hook.`,
    description: `Dummy series entry ${padIndex(index)} tracks a serialized mystery through ${city}, giving the app enough episodes, songs, and searchable text to simulate a fuller catalog.`,
    poster: image(posterImageIds[(index + 2) % posterImageIds.length]),
    backdrop: image(backdropImageIds[(index + 3) % backdropImageIds.length]),
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: `Pilot ${padIndex(index)}`,
            summary: `A new thread begins in ${city} when an anonymous playlist points the team toward a hidden connection.`,
            songs: [
              {
                order: 1,
                timestamp: "00:12:04",
                sceneDescription: `The pilot opens on a coded transmission that sends the group across ${city} before sunrise.`,
                song: createSong(500 + index, 1),
              },
              {
                order: 2,
                timestamp: "00:39:18",
                sceneDescription: "A hallway confrontation reveals that the playlist is naming people, not places.",
                song: createSong(500 + index, 2),
              },
            ],
          },
          {
            episodeNumber: 2,
            title: `Echo Chamber ${padIndex(index)}`,
            summary: `The team follows a fresh recording and discovers the soundtrack archive has been altered again.`,
            songs: [
              {
                order: 1,
                timestamp: "00:18:26",
                sceneDescription: "An intercepted club recording exposes a second timeline running under the case.",
                song: createSong(500 + index, 3),
              },
              {
                order: 2,
                timestamp: "00:47:11",
                sceneDescription: "The closing montage crossfades city lights, evidence boards, and one final looping cue.",
                song: createSong(500 + index, 4),
              },
            ],
          },
        ],
      },
    ],
  };
}

function generateDummyCatalogEntries(total: number): CatalogEntry[] {
  return Array.from({ length: total }, (_, index) => {
    const entryNumber = index + 1;

    // Keep the generated dataset mixed so title, song, and episode experiences all have depth.
    return entryNumber % 4 === 0
      ? createSeriesEntry(entryNumber)
      : createMovieEntry(entryNumber);
  });
}

const dummyCatalog = generateDummyCatalogEntries(200);

export const catalog: CatalogEntry[] = [...baseCatalog, ...dummyCatalog];

export const featuredCollections: FeaturedCollection[] = [
  {
    title: "Trending Tonight",
    description: "Editorial picks pulling the most soundtrack searches right now.",
    color: "bg-[#ffd6cd]",
  },
  {
    title: "New Episode Drops",
    description: "Fresh song-by-scene maps from the latest series additions.",
    color: "bg-[#d3dced]",
  },
  {
    title: "Admin Curated",
    description: "Entries highlighted for exceptional scene-level detail quality.",
    color: "bg-[#d6e4dc]",
  },
];

const flattenAppearances = (): FlattenedSceneItem[] =>
  catalog.flatMap<FlattenedSceneItem>((entry) => {
    if (entry.type === "movie") {
      return entry.soundtrack.map((item) => ({
        contentSlug: entry.slug,
        contentTitle: entry.title,
        contentType: entry.type,
        seasonNumber: null,
        episodeNumber: null,
        ...item,
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
          ...item,
        })),
      ),
    );
  });

export const sceneLibrary: FlattenedSceneItem[] = flattenAppearances();

export const songLibrary: SongLibraryItem[] = Array.from(
  sceneLibrary.reduce((map, item) => {
    const existing = map.get(item.song.slug) ?? {
      ...item.song,
      appearances: [] as SongAppearance[],
    };

    existing.appearances.push({
      contentSlug: item.contentSlug,
      contentTitle: item.contentTitle,
      contentType: item.contentType,
      sceneType: item.sceneType ?? "Episode scene",
      timestamp: item.timestamp,
      sceneDescription: item.sceneDescription,
      seasonNumber: item.seasonNumber,
      episodeNumber: item.episodeNumber,
      episodeTitle: item.episodeTitle,
    });

    map.set(item.song.slug, existing);
    return map;
  }, new Map<string, SongLibraryItem>()).values(),
);

export const stats: Stats = {
  titles: catalog.length,
  songs: songLibrary.length,
  scenes: sceneLibrary.length,
  seriesEpisodes: catalog
    .filter((entry): entry is SeriesEntry => entry.type === "series")
    .reduce(
      (total, entry) =>
        total +
        entry.seasons.reduce(
          (seasonTotal, season) => seasonTotal + season.episodes.length,
          0,
        ),
      0,
    ),
};

export const trendingContent: CatalogEntry[] = catalog.slice(0, 4);
export const recentSceneDrops: FlattenedSceneItem[] = sceneLibrary.slice(0, 6);
export const popularSongs: SongLibraryItem[] = songLibrary.slice(0, 5);
export const seriesHighlights: SeriesEntry[] = catalog.filter(
  (entry): entry is SeriesEntry => entry.type === "series",
);
export const movieHighlights: MovieEntry[] = catalog.filter(
  (entry): entry is MovieEntry => entry.type === "movie",
);

function isDummySlug(slug: string): boolean {
  return slug.startsWith("dummy-");
}

function byCuratedFirst<T extends { slug: string }>(left: T, right: T): number {
  return Number(isDummySlug(left.slug)) - Number(isDummySlug(right.slug));
}

export function getStaticMovieParams(): Array<{ slug: string }> {
  return movieHighlights
    .filter((movie) => !isDummySlug(movie.slug))
    .map((movie) => ({ slug: movie.slug }));
}

export function getStaticSeriesParams(): Array<{ slug: string }> {
  return seriesHighlights
    .filter((series) => !isDummySlug(series.slug))
    .map((series) => ({ slug: series.slug }));
}

export function getStaticSongParams(): Array<{ slug: string }> {
  return songLibrary
    .filter((song) => !isDummySlug(song.slug))
    .map((song) => ({ slug: song.slug }));
}

export function getRelatedMovies(currentSlug: string, limit = 4): MovieEntry[] {
  return [...movieHighlights]
    .filter((movie) => movie.slug !== currentSlug)
    .sort(
      (left, right) =>
        byCuratedFirst(left, right) ||
        right.year - left.year ||
        Number(right.rating) - Number(left.rating),
    )
    .slice(0, limit);
}

export function getRelatedSongs(currentSlug: string, limit = 4): SongLibraryItem[] {
  return [...songLibrary]
    .filter((song) => song.slug !== currentSlug)
    .sort(
      (left, right) =>
        byCuratedFirst(left, right) ||
        right.appearances.length - left.appearances.length ||
        right.title.localeCompare(left.title),
    )
    .slice(0, limit);
}

export function getContentBySlug(type: "movie", slug: string): MovieEntry | undefined;
export function getContentBySlug(type: "series", slug: string): SeriesEntry | undefined;
export function getContentBySlug(
  type: ContentType,
  slug: string,
): CatalogEntry | undefined {
  return catalog.find(
    (entry): entry is CatalogEntry => entry.type === type && entry.slug === slug,
  );
}

export function getSongBySlug(slug: string): SongLibraryItem | undefined {
  return songLibrary.find((song) => song.slug === slug);
}

export function searchCatalog(query: string): {
  content: CatalogEntry[];
  songs: SongLibraryItem[];
} {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      content: catalog,
      songs: songLibrary,
    };
  }

  return {
    content: catalog.filter((entry) =>
      [entry.title, entry.description, entry.type, ...entry.genres]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
    songs: songLibrary.filter((song) =>
      [song.title, song.artist, song.mood]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
  };
}
