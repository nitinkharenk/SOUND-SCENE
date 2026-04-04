import postgres from "postgres";

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing Postgres connection string in environment.");
}

const db = postgres(connectionString, {
  ssl: "require",
  max: 1,
  prepare: false,
});

try {
  await db.unsafe(`
    alter table "public"."SongAppearance"
      alter column "timestamp" drop not null;

    update "public"."SongAppearance"
      set "timestamp" = null
      where "timestamp" like 'Track %';
  `);

  const [counts] = await db`
    select
      count(*)::int as total,
      count(*) filter (where "timestamp" is null)::int as null_timestamps
    from "public"."SongAppearance"
  `;

  console.log(JSON.stringify(counts, null, 2));
} finally {
  await db.end({ timeout: 5 });
}
