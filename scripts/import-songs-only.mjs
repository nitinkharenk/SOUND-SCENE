import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TitleType } from "@prisma/client";

const SONG_TARGET = 200;
const MOVIE_APPEARANCE_ENRICH_TARGET = 24;
const SONG_TERMS = [
  "soundtrack",
  "movie soundtrack",
  "tv soundtrack",
  "film score",
  "theme song",
  "score",
  "original soundtrack",
];
const usedSongSlugs = new Set();

function getPgConfig() {
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    throw new Error("Missing Postgres host credentials in environment.");
  }

  return {
    host,
    user,
    password,
    database,
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(getPgConfig()),
});

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(baseValue) {
  const base = slugify(baseValue) || "untitled";

  if (!usedSongSlugs.has(base)) {
    usedSongSlugs.add(base);
    return base;
  }

  let index = 2;

  while (usedSongSlugs.has(`${base}-${index}`)) {
    index += 1;
  }

  const next = `${base}-${index}`;
  usedSongSlugs.add(next);
  return next;
}

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toArtwork(url) {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

function inferMood(seed) {
  const cleaned = String(seed || "Soundtrack").trim();
  return cleaned.length > 48 ? `${cleaned.slice(0, 45).trim()}...` : cleaned;
}

function youtubeSearchUrl(title, artist) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`;
}

function spotifySearchUrl(title, artist) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Accept": "application/json",
      "User-Agent": process.env.MUSICBRAINZ_USER_AGENT || "SoundScene/1.0",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 429) {
    const attempt = Number(init.__attempt ?? 0);

    if (attempt >= 5) {
      throw new Error(`Request failed: 429 Too Many Requests for ${url}`);
    }

    await sleep(1500 * (attempt + 1));
    return fetchJson(url, {
      ...init,
      __attempt: attempt + 1,
    });
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function runInBatches(items, batchSize, worker, pauseMs = 0) {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    await Promise.all(batch.map(worker));

    if (pauseMs > 0 && index + batchSize < items.length) {
      await sleep(pauseMs);
    }
  }
}

async function collectSupplementalSongs() {
  const songs = new Map();

  for (const term of SONG_TERMS) {
    const payload = await fetchJson(
      `https://itunes.apple.com/search?media=music&entity=song&term=${encodeURIComponent(term)}&limit=200`,
    );
    await sleep(250);

    for (const item of payload.results ?? []) {
      if (!item.trackId || !item.trackName || !item.artistName) {
        continue;
      }

      songs.set(item.trackId, item);
      if (songs.size >= SONG_TARGET * 2) {
        return Array.from(songs.values());
      }
    }
  }

  return Array.from(songs.values());
}

async function ensureSongFromTrack(item) {
  const existing = await prisma.song.findFirst({
    where: {
      OR: [
        {
          title: item.trackName,
          artist: item.artistName,
        },
      ],
    },
  });

  if (existing) {
    usedSongSlugs.add(existing.slug);
    return existing;
  }

  return prisma.song.create({
    data: {
      slug: uniqueSlug(`${item.trackName}-${item.artistName}`),
      title: item.trackName,
      artist: item.artistName,
      mood: inferMood(item.primaryGenreName || item.collectionName || "Soundtrack"),
      artwork: toArtwork(item.artworkUrl100 || item.artworkUrl60 || ""),
      album: item.collectionName || null,
      youtubeLink: youtubeSearchUrl(item.trackName, item.artistName),
      spotifyLink: spotifySearchUrl(item.trackName, item.artistName),
      source: "itunes",
    },
  });
}

async function importSongs() {
  const tracks = await collectSupplementalSongs();

  for (const item of tracks) {
    const currentCount = await prisma.song.count();
    if (currentCount >= SONG_TARGET) {
      break;
    }

    await ensureSongFromTrack(item);
  }
}

async function importMovieAppearances() {
  const movies = await prisma.title.findMany({
    where: {
      type: TitleType.movie,
    },
    orderBy: [
      { year: "desc" },
      { title: "asc" },
    ],
    take: MOVIE_APPEARANCE_ENRICH_TARGET,
  });

  await runInBatches(movies, 2, async (movie) => {
    const soundtrackResults = await fetchJson(
      `https://itunes.apple.com/search?media=music&entity=song&term=${encodeURIComponent(`${movie.title} soundtrack`)}&limit=8`,
    );

    let order = 1;

    for (const item of soundtrackResults.results ?? []) {
      if (!item.trackName || !item.artistName) {
        continue;
      }

      const normalizedCollection = normalizeTitle(item.collectionName || "");
      const normalizedTitle = normalizeTitle(movie.title);

      if (
        normalizedCollection &&
        !normalizedCollection.includes(normalizedTitle) &&
        !normalizeTitle(item.trackName).includes(normalizedTitle)
      ) {
        continue;
      }

      const song = await ensureSongFromTrack(item);

      await prisma.songAppearance.create({
        data: {
          titleId: movie.id,
          songId: song.id,
          order,
          sceneType: "Soundtrack",
          timestamp: null,
          sceneDescription: `Imported from live soundtrack search results for ${movie.title}.`,
          source: "itunes-soundtrack-search",
        },
      });

      order += 1;
    }
  }, 350);
}

async function main() {
  console.log("Importing supplemental songs...");
  await importSongs();
  console.log("Importing movie soundtrack appearances...");
  await importMovieAppearances();

  const [songCount, appearanceCount] = await Promise.all([
    prisma.song.count(),
    prisma.songAppearance.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        songs: songCount,
        appearances: appearanceCount,
      },
      null,
      2,
    ),
  );

  if (songCount < SONG_TARGET) {
    throw new Error("Song import did not reach the requested minimum count.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
