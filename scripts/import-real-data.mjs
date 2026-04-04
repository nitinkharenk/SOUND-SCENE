import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TitleType } from "@prisma/client";

function getDirectConnectionString() {
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    return null;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${encodeURIComponent(database)}?sslmode=require`;
}

function getPgConfig() {
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    return null;
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
  adapter: new PrismaPg(
    getPgConfig() ?? {
      connectionString:
        getDirectConnectionString() ||
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        "",
      ssl: {
        rejectUnauthorized: false,
      },
    },
  ),
});

const MOVIE_TARGET = 200;
const SERIES_TARGET = 200;
const SONG_TARGET = 200;
const SERIES_EPISODE_ENRICH_TARGET = 30;
const MOVIE_APPEARANCE_ENRICH_TARGET = 24;
const ITUNES_MOVIE_TERMS = [
  "us",
  "gb",
  "ca",
  "in",
  "au",
];
const SONG_TERMS = [
  "soundtrack",
  "movie soundtrack",
  "tv soundtrack",
  "film score",
  "theme song",
  "score",
  "original soundtrack",
];
const usedTitleSlugs = new Set();
const usedSongSlugs = new Set();
const genreCache = new Map();

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(baseValue, used) {
  const base = slugify(baseValue) || "untitled";

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 2;

  while (used.has(`${base}-${index}`)) {
    index += 1;
  }

  const next = `${base}-${index}`;
  used.add(next);
  return next;
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clampText(value = "", fallback = "") {
  const cleaned = stripHtml(value);
  return cleaned || fallback;
}

function toArtwork(url) {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

function toRuntime(trackTimeMillis) {
  if (!trackTimeMillis || Number.isNaN(trackTimeMillis)) {
    return "";
  }

  const totalMinutes = Math.round(trackTimeMillis / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function inferMood(seed) {
  const cleaned = clampText(seed, "Soundtrack");
  return cleaned.length > 48 ? `${cleaned.slice(0, 45).trim()}...` : cleaned;
}

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function youtubeSearchUrl(title, artist) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`;
}

function spotifySearchUrl(title, artist) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectMovies() {
  const movies = new Map();

  for (const country of ITUNES_MOVIE_TERMS) {
    const payload = await fetchJson(
      `https://itunes.apple.com/${country}/rss/topmovies/limit=100/json`,
    );
    await sleep(350);

    for (const item of payload.feed?.entry ?? []) {
      const movieId = item?.id?.attributes?.["im:id"];
      const title = item?.["im:name"]?.label;
      const artwork = item?.["im:image"]?.at?.(-1)?.label;

      if (!movieId || !title || !artwork) {
        continue;
      }

      movies.set(String(movieId), item);
      if (movies.size >= MOVIE_TARGET) {
        return Array.from(movies.values()).slice(0, MOVIE_TARGET);
      }
    }
  }

  return Array.from(movies.values()).slice(0, MOVIE_TARGET);
}

async function collectSeries() {
  const shows = [];
  let page = 0;

  while (shows.length < SERIES_TARGET) {
    const payload = await fetchJson(`https://api.tvmaze.com/shows?page=${page}`);
    const eligible = (payload ?? []).filter((show) => show?.id && show?.name && show?.image?.original);
    shows.push(...eligible);
    page += 1;

    if (!payload?.length) {
      break;
    }
  }

  return shows.slice(0, SERIES_TARGET);
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

async function runInBatches(items, batchSize, worker, pauseMs = 0) {
  const results = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);

    if (pauseMs > 0 && index + batchSize < items.length) {
      await sleep(pauseMs);
    }
  }

  return results;
}

async function resetDatabase() {
  await prisma.songAppearance.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.titleGenre.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.song.deleteMany();
  await prisma.title.deleteMany();
}

async function ensureGenres(titleId, names) {
  for (const name of names.filter(Boolean)) {
    let genre = genreCache.get(name);

    if (!genre) {
      try {
        genre = await prisma.genre.create({
          data: { name },
        });
      } catch {
        genre = await prisma.genre.findUnique({
          where: { name },
        });
      }
    }

    if (!genre) {
      continue;
    }

    genreCache.set(name, genre);

    await prisma.titleGenre.upsert({
      where: {
        titleId_genreId: {
          titleId,
          genreId: genre.id,
        },
      },
      create: {
        titleId,
        genreId: genre.id,
      },
      update: {},
    });
  }
}

async function importMovies(movies) {
  const created = await runInBatches(movies, 12, async (item) => {
    const titleText = item["im:name"]?.label ?? "Untitled";
    const artwork = item["im:image"]?.at?.(-1)?.label ?? "";
    const year = Number.parseInt(String(item["im:releaseDate"]?.label ?? "").slice(0, 4), 10) || 0;
    const description = clampText(item.summary?.label, item.rights?.label);
    const director = clampText(item["im:artist"]?.label, "Featured release");
    const previewLink = Array.isArray(item.link)
      ? item.link.find((entry) => entry?.attributes?.["im:assetType"] === "preview")
      : null;
    const previewDuration = Number.parseFloat(previewLink?.["im:duration"]?.label ?? "0");
    const title = await prisma.title.create({
      data: {
        slug: uniqueSlug(titleText, usedTitleSlugs),
        title: titleText,
        type: TitleType.movie,
        year,
        rating: "NR",
        runtime: toRuntime(previewDuration),
        platform: "Apple TV / iTunes",
        tagline: director,
        description: description || `${titleText} imported from the live Apple movie catalog.`,
        poster: toArtwork(artwork),
        backdrop: toArtwork(artwork),
        source: "itunes",
      },
    });

    await ensureGenres(title.id, [item.category?.attributes?.label]);
    return { db: title, raw: item };
  }, 150);

  return created;
}

async function importSeries(shows) {
  const created = await runInBatches(shows, 10, async (show) => {
    const year = Number.parseInt(String(show.premiered ?? "").slice(0, 4), 10) || 0;
    const description = clampText(show.summary, `${show.name} imported from the TVMaze catalog.`);
    const title = await prisma.title.create({
      data: {
        slug: uniqueSlug(show.name, usedTitleSlugs),
        title: show.name,
        type: TitleType.series,
        year,
        rating: String(show.rating?.average ?? "NR"),
        runtime: show.averageRuntime ? `${Math.floor(show.averageRuntime / 60)}h ${String(show.averageRuntime % 60).padStart(2, "0")}m` : "",
        platform: show.network?.name || show.webChannel?.name || "TVMaze",
        tagline: clampText(show.network?.name || show.webChannel?.name, description.slice(0, 120)),
        description,
        poster: show.image.original || show.image.medium,
        backdrop: show.image.original || show.image.medium,
        source: "tvmaze",
        tvmazeId: show.id,
      },
    });

    await ensureGenres(title.id, show.genres ?? []);
    return { db: title, raw: show };
  }, 150);

  await runInBatches(created.slice(0, SERIES_EPISODE_ENRICH_TARGET), 8, async ({ db, raw }) => {
    const episodes = await fetchJson(`https://api.tvmaze.com/shows/${raw.id}/episodes`);
    const seasons = new Map();

    for (const episode of episodes ?? []) {
      const seasonNumber = episode.season || 1;
      let season = seasons.get(seasonNumber);

      if (!season) {
        season = await prisma.season.create({
          data: {
            titleId: db.id,
            seasonNumber,
            label: `Season ${seasonNumber}`,
          },
        });
        seasons.set(seasonNumber, season);
      }

      await prisma.episode.create({
        data: {
          seasonId: season.id,
          episodeNumber: episode.number || 1,
          title: episode.name || `Episode ${episode.number || 1}`,
          summary: clampText(episode.summary, `Episode ${episode.number || 1} from ${raw.name}.`),
        },
      });
    }
  });

  return created;
}

async function ensureSongFromTrack(item) {
  const slugBase = slugify(`${item.trackName}-${item.artistName}`);
  const uniqueSongSlug = uniqueSlug(`${item.trackName}-${item.artistName}`, usedSongSlugs);
  const existing = await prisma.song.findFirst({
    where: {
      OR: [
        { slug: slugBase },
        { slug: uniqueSongSlug },
        {
          title: item.trackName,
          artist: item.artistName,
        },
      ],
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.song.create({
    data: {
      slug: uniqueSongSlug,
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

async function importSongsAndMovieAppearances(movies) {
  const supplementalTracks = await collectSupplementalSongs();

  for (const item of supplementalTracks) {
    if ((await prisma.song.count()) >= SONG_TARGET) {
      break;
    }

    if (!item.trackName || !item.artistName) {
      continue;
    }

    await ensureSongFromTrack(item);
  }

  let createdSongs = await prisma.song.count();

  await runInBatches(movies.slice(0, MOVIE_APPEARANCE_ENRICH_TARGET), 2, async ({ db, raw }) => {
    const soundtrackResults = await fetchJson(
      `https://itunes.apple.com/search?media=music&entity=song&term=${encodeURIComponent(`${raw["im:name"]?.label ?? raw.title} soundtrack`)}&limit=8`,
    );

    let order = 1;

    for (const item of soundtrackResults.results ?? []) {
      if (!item.trackName || !item.artistName) {
        continue;
      }

      const normalizedCollection = normalizeTitle(item.collectionName || "");
      const normalizedTitle = normalizeTitle(raw.trackName);

      if (
        normalizedCollection &&
        !normalizedCollection.includes(normalizedTitle) &&
        !normalizeTitle(item.trackName).includes(normalizedTitle)
      ) {
        continue;
      }

      const song = await ensureSongFromTrack(item);
      createdSongs += 1;

      await prisma.songAppearance.create({
        data: {
          titleId: db.id,
          songId: song.id,
          order,
          sceneType: "Soundtrack",
          timestamp: null,
          sceneDescription: `Imported from live soundtrack search results for ${raw["im:name"]?.label ?? raw.title}.`,
          source: "itunes-soundtrack-search",
        },
      });

      order += 1;
    }
  }, 350);

  return createdSongs;
}

async function main() {
  console.log("Resetting existing catalog tables...");
  await resetDatabase();

  console.log("Collecting real movie data...");
  const movies = await collectMovies();
  console.log(`Importing ${movies.length} movies...`);
  const importedMovies = await importMovies(movies);

  console.log("Collecting real series data...");
  const shows = await collectSeries();
  console.log(`Importing ${shows.length} series with episodes...`);
  await importSeries(shows);

  console.log("Importing soundtrack songs and movie appearances...");
  await importSongsAndMovieAppearances(importedMovies);

  const [movieCount, seriesCount, songCount, appearanceCount] = await Promise.all([
    prisma.title.count({ where: { type: TitleType.movie } }),
    prisma.title.count({ where: { type: TitleType.series } }),
    prisma.song.count(),
    prisma.songAppearance.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        movies: movieCount,
        series: seriesCount,
        songs: songCount,
        appearances: appearanceCount,
      },
      null,
      2,
    ),
  );

  if (movieCount < MOVIE_TARGET || seriesCount < SERIES_TARGET || songCount < SONG_TARGET) {
    throw new Error("Import completed but did not reach the requested minimum counts.");
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
