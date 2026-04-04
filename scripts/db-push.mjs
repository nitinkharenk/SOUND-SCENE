import postgres from "postgres";

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

const connectionString =
  getDirectConnectionString() ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error("Missing Postgres connection environment variables.");
}

const sql = postgres(connectionString, {
  ssl: "require",
  max: 1,
  prepare: false,
});

const statements = [
  `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TitleType') THEN
        CREATE TYPE "TitleType" AS ENUM ('movie', 'series');
      END IF;
    END $$;
  `,
  `
    CREATE TABLE IF NOT EXISTS "Title" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "type" "TitleType" NOT NULL,
      "year" INTEGER NOT NULL,
      "rating" TEXT NOT NULL,
      "runtime" TEXT,
      "platform" TEXT NOT NULL,
      "tagline" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "poster" TEXT NOT NULL,
      "backdrop" TEXT NOT NULL,
      "source" TEXT,
      "tmdbId" INTEGER UNIQUE,
      "tvmazeId" INTEGER UNIQUE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `CREATE INDEX IF NOT EXISTS "Title_type_year_idx" ON "Title"("type", "year");`,
  `CREATE INDEX IF NOT EXISTS "Title_slug_idx" ON "Title"("slug");`,
  `
    CREATE TABLE IF NOT EXISTS "Genre" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS "TitleGenre" (
      "titleId" TEXT NOT NULL,
      "genreId" TEXT NOT NULL,
      PRIMARY KEY ("titleId", "genreId"),
      CONSTRAINT "TitleGenre_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "TitleGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  `CREATE INDEX IF NOT EXISTS "TitleGenre_genreId_idx" ON "TitleGenre"("genreId");`,
  `
    CREATE TABLE IF NOT EXISTS "Season" (
      "id" TEXT PRIMARY KEY,
      "titleId" TEXT NOT NULL,
      "seasonNumber" INTEGER NOT NULL,
      "label" TEXT,
      CONSTRAINT "Season_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Season_titleId_seasonNumber_key" UNIQUE ("titleId", "seasonNumber")
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS "Episode" (
      "id" TEXT PRIMARY KEY,
      "seasonId" TEXT NOT NULL,
      "episodeNumber" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "summary" TEXT NOT NULL,
      CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Episode_seasonId_episodeNumber_key" UNIQUE ("seasonId", "episodeNumber")
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS "Song" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "artist" TEXT NOT NULL,
      "mood" TEXT NOT NULL,
      "artwork" TEXT,
      "album" TEXT,
      "youtubeLink" TEXT NOT NULL,
      "spotifyLink" TEXT NOT NULL,
      "musicBrainzId" TEXT UNIQUE,
      "source" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `CREATE INDEX IF NOT EXISTS "Song_title_idx" ON "Song"("title");`,
  `CREATE INDEX IF NOT EXISTS "Song_artist_idx" ON "Song"("artist");`,
  `
    CREATE TABLE IF NOT EXISTS "SongAppearance" (
      "id" TEXT PRIMARY KEY,
      "titleId" TEXT NOT NULL,
      "songId" TEXT NOT NULL,
      "episodeId" TEXT,
      "order" INTEGER NOT NULL,
      "sceneType" TEXT NOT NULL,
      "timestamp" TEXT NOT NULL,
      "sceneDescription" TEXT NOT NULL,
      "source" TEXT,
      CONSTRAINT "SongAppearance_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "SongAppearance_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "SongAppearance_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  `CREATE INDEX IF NOT EXISTS "SongAppearance_titleId_order_idx" ON "SongAppearance"("titleId", "order");`,
  `CREATE INDEX IF NOT EXISTS "SongAppearance_songId_idx" ON "SongAppearance"("songId");`,
  `CREATE INDEX IF NOT EXISTS "SongAppearance_episodeId_idx" ON "SongAppearance"("episodeId");`,
];

try {
  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  console.log("Database schema applied successfully.");
} finally {
  await sql.end({ timeout: 5 });
}
