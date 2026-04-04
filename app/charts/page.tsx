import Link from "next/link";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getDiscoveryData } from "@/lib/discovery";
import { pluralize } from "@/lib/text";

type ChartCard = {
  id: string;
  title: string;
  kicker: string;
  href: string;
  image: string;
  summary: string;
  metric: string;
  previewItems: string[];
};

function sortByRating<T extends { rating: string; year: number; title: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      Number(right.rating) - Number(left.rating) ||
      right.year - left.year ||
      left.title.localeCompare(right.title),
  );
}

function sortByNewest<T extends { year: number; title: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => right.year - left.year || left.title.localeCompare(right.title),
  );
}

export default async function ChartsPage() {
  const { contentItems, songItems } = await getDiscoveryData({ contentLimit: 20, songLimit: 20 });

  const topSongs = [...songItems].sort(
    (left, right) =>
      right.appearances.length - left.appearances.length ||
      right.year - left.year ||
      left.title.localeCompare(right.title),
  );

  const topMovies = sortByRating(contentItems.filter((item) => item.type === "movie"));
  const topSeries = sortByRating(contentItems.filter((item) => item.type === "series"));
  const newReleases = [
    ...contentItems.map((item) => ({
      title: item.title,
      image: item.poster,
      year: item.year,
    })),
    ...songItems.map((item) => ({
      title: item.title,
      image: item.image,
      year: item.year,
    })),
  ].sort((left, right) => right.year - left.year || left.title.localeCompare(right.title));
  const newestSongs = sortByNewest(songItems);
  const newestMovies = sortByNewest(contentItems.filter((item) => item.type === "movie"));
  const newestSeries = sortByNewest(contentItems.filter((item) => item.type === "series"));
  const oldestMovies = [...contentItems]
    .filter((item) => item.type === "movie")
    .sort((left, right) => left.year - right.year || left.title.localeCompare(right.title));
  const oldestSeries = [...contentItems]
    .filter((item) => item.type === "series")
    .sort((left, right) => left.year - right.year || left.title.localeCompare(right.title));
  const breakoutTitles = [...contentItems].sort(
    (left, right) =>
      right.year - left.year ||
      Number(right.rating) - Number(left.rating) ||
      left.title.localeCompare(right.title),
  );

  const chartCards: ChartCard[] = [
    {
      id: "songs-top",
      title: "Top Songs",
      kicker: "Soundtrack momentum",
      href: "/songs?sort=appearances",
      image: topSongs[0]?.image ?? "",
      summary: "Browse the most replayed soundtrack songs ranked by mapped scene appearances.",
      metric: pluralize(topSongs.length, "song"),
      previewItems: topSongs.slice(0, 3).map((song) => `${song.title} · ${song.artist}`),
    },
    {
      id: "songs-latest",
      title: "Latest Songs",
      kicker: "Fresh soundtrack songs",
      href: "/songs?sort=newest",
      image: newestSongs[0]?.image ?? "",
      summary: "Find the newest soundtrack-linked songs added to the platform.",
      metric: pluralize(newestSongs.length, "song"),
      previewItems: newestSongs.slice(0, 3).map((song) => `${song.title} · ${song.year || "new"}`),
    },
    {
      id: "movies-top",
      title: "Top Movies",
      kicker: "Movie charts",
      href: "/movies?sort=rating",
      image: topMovies[0]?.poster ?? "",
      summary: "Explore the highest-rated movie soundtrack guides and their most revisited titles.",
      metric: pluralize(topMovies.length, "movie"),
      previewItems: topMovies.slice(0, 3).map((movie) => `${movie.title} · ${movie.year}`),
    },
    {
      id: "movies-latest",
      title: "Latest Movies",
      kicker: "Fresh movie drops",
      href: "/movies?sort=newest",
      image: newestMovies[0]?.poster ?? "",
      summary: "Browse the newest movie entries with soundtrack guides and metadata.",
      metric: pluralize(newestMovies.length, "movie"),
      previewItems: newestMovies.slice(0, 3).map((movie) => `${movie.title} · ${movie.year}`),
    },
    {
      id: "movies-classics",
      title: "Classic Movies",
      kicker: "Archive charts",
      href: "/movies?sort=oldest",
      image: oldestMovies[0]?.poster ?? "",
      summary: "Jump into the oldest movies in the library for classic soundtrack digging.",
      metric: pluralize(oldestMovies.length, "movie"),
      previewItems: oldestMovies.slice(0, 3).map((movie) => `${movie.title} · ${movie.year}`),
    },
    {
      id: "series-top",
      title: "Top Series",
      kicker: "Series charts",
      href: "/series?sort=rating",
      image: topSeries[0]?.poster ?? "",
      summary: "See which series soundtrack breakdowns are leading the platform right now.",
      metric: pluralize(topSeries.length, "series", "series"),
      previewItems: topSeries.slice(0, 3).map((series) => `${series.title} · ${series.year}`),
    },
    {
      id: "series-latest",
      title: "Latest Series",
      kicker: "Fresh series drops",
      href: "/series?sort=newest",
      image: newestSeries[0]?.poster ?? "",
      summary: "See the newest series added with episode-aware soundtrack mapping.",
      metric: pluralize(newestSeries.length, "series", "series"),
      previewItems: newestSeries.slice(0, 3).map((series) => `${series.title} · ${series.year}`),
    },
    {
      id: "series-classics",
      title: "Classic Series",
      kicker: "Archive charts",
      href: "/series?sort=oldest",
      image: oldestSeries[0]?.poster ?? "",
      summary: "Browse older series entries and their soundtrack breakdowns.",
      metric: pluralize(oldestSeries.length, "series", "series"),
      previewItems: oldestSeries.slice(0, 3).map((series) => `${series.title} · ${series.year}`),
    },
    {
      id: "breakout",
      title: "Breakout Titles",
      kicker: "Fast risers",
      href: "/new-releases?sort=newest",
      image: breakoutTitles[0]?.poster ?? "",
      summary: "A mixed view of newer high-rated titles that are rising across the catalog.",
      metric: pluralize(breakoutTitles.length, "title"),
      previewItems: breakoutTitles.slice(0, 3).map((entry) => `${entry.title} · ${entry.year}`),
    },
    {
      id: "releases",
      title: "New Releases",
      kicker: "Fresh drops",
      href: "/new-releases?sort=newest",
      image: newReleases[0]?.image ?? "",
      summary: "Jump into the newest soundtrack-linked songs, movies, and series from one feed.",
      metric: pluralize(newReleases.length, "release"),
      previewItems: newReleases.slice(0, 3).map((entry) => `${entry.title} · ${entry.year}`),
    },
  ];

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Platform rankings"
            leadTitle="SoundScene"
            outlineTitle="Charts"
            description="Pick a chart to explore. Each card takes you to a dedicated listing page instead of mixing every ranked item into one results feed."
          />
          <RouteMeta
            items={[
              pluralize(topSongs.length, "song chart entry", "song chart entries"),
              pluralize(topMovies.length, "movie chart entry", "movie chart entries"),
              pluralize(topSeries.length, "series chart entry", "series chart entries"),
              `${chartCards.length} chart cards`,
            ]}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {chartCards.map((card) => (
          <Link key={card.id} href={card.href} className="hover-card group flex h-full flex-col">
            <div className="relative">
              <div className="aspect-[1.08/1.18] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="hover-card-media h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 rounded-b-[0.4rem] bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex flex-1 flex-col pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="route-kicker text-[0.72rem]">{card.kicker}</p>
                <span className="route-tag">{card.metric}</span>
              </div>

              <h2 className="hover-card-title card-heading clamp-2 mt-3 min-h-[3.5rem] text-[1.55rem] font-semibold leading-tight text-black">
                {card.title}
              </h2>

              <p className="clamp-3 mt-3 min-h-[4.25rem] font-body text-sm font-normal leading-relaxed text-black/64">
                {card.summary}
              </p>

              <div className="mt-4 space-y-2 border-t border-[color:var(--line)] pt-4">
                {card.previewItems.map((item, index) => (
                  <p
                    key={`${card.id}-${index}`}
                    className="clamp-1 font-body text-[0.82rem] font-medium text-black/68"
                  >
                    {String(index + 1).padStart(2, "0")} · {item}
                  </p>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <span className="route-action route-action-primary">Open chart</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
