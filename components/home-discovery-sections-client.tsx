"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ContentImage } from "@/components/content-image";
import SearchBar from "@/components/SearchBar";
import {
  filters,
  getBrowseHrefForFilter,
  getBrowseLabelForFilter,
  isSongItem,
  type DiscoveryItem,
  type FilterId,
  type TrendingSongItem,
  type WeeklyEpisodeItem,
} from "@/lib/discovery-types";
import { pluralize } from "@/lib/text";

const POPULAR_INITIAL_COUNT = 10;
const POPULAR_STEP = 5;
const LATEST_INITIAL_COUNT = 7;
const LATEST_STEP = 4;
const EPISODES_INITIAL_COUNT = 7;
const EPISODES_STEP = 4;
const GRID_TILE_IMAGE_SIZES =
  "(min-width: 1280px) 16vw, (min-width: 768px) 34vw, 92vw";
const FEATURE_IMAGE_SIZES =
  "(min-width: 1280px) 42vw, (min-width: 1024px) 46vw, 92vw";
const ROW_IMAGE_SIZES =
  "(min-width: 1280px) 18vw, (min-width: 768px) 22vw, 92vw";
const TRENDING_FEATURE_IMAGE_SIZES =
  "(min-width: 1280px) 38vw, (min-width: 1024px) 44vw, 92vw";
const EPISODE_FEATURE_IMAGE_SIZES =
  "(min-width: 1280px) 24vw, (min-width: 1024px) 28vw, 92vw";

function FilterPills({
  activeFilter,
  onChange,
  counts,
  variant = "default",
}: {
  activeFilter: FilterId;
  onChange: (filter: FilterId) => void;
  counts?: Record<FilterId, number>;
  variant?: "default" | "hero";
}) {
  const sharedLabel = (filter: (typeof filters)[number]) =>
    filter.id === "series" ? "Series" : filter.id === "movies" ? "Movies" : "Songs";

  const sizeClass =
    variant === "hero"
      ? "px-4 py-2 text-sm tracking-wide sm:px-5 sm:py-2.5"
      : "px-4 py-2 text-sm tracking-wide sm:px-4.5 sm:py-2.5";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`focus-ring inline-flex items-center rounded-full border font-body font-medium uppercase transition ${
              isActive
                ? "border-accent bg-accent text-white"
                : "border-black/12 bg-transparent text-black/52 hover:border-accent-hover hover:text-accent-hover"
            } ${sizeClass}`}
          >
            <span>{sharedLabel(filter)}</span>
            {typeof counts?.[filter.id] === "number" ? (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[0.66rem] tracking-[0.08em] ${
                  isActive ? "bg-white/18 text-white" : "bg-accent-subtle text-accent"
                }`}
              >
                {counts[filter.id]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type SectionHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  activeFilter?: FilterId;
  onChange?: (filter: FilterId) => void;
  counts?: Record<FilterId, number>;
  dark?: boolean;
  variant?: "default" | "split-banner";
  leadTitle?: string;
  outlineTitle?: string;
};

function SectionHeader({
  kicker,
  title,
  description,
  activeFilter,
  onChange,
  counts,
  dark = false,
  variant = "default",
  leadTitle,
  outlineTitle,
}: SectionHeaderProps) {
  if (variant === "split-banner") {
    const themeStyles = {
      shell: "",
      kicker: "text-accent",
      solid: dark ? "text-white" : "text-black",
    };

    return (
      <div className={`px-1 py-2 sm:py-3 ${themeStyles.shell}`}>
        <div className="flex flex-col gap-5 sm:gap-8">
          <div>
            <p
              className={`font-body text-xs font-medium uppercase tracking-[0.18em] ${themeStyles.kicker}`}
            >
              {kicker}
            </p>
            <h2 className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1.5 sm:gap-x-4 sm:flex-nowrap">
              <span className={`section-banner-heading whitespace-nowrap ${themeStyles.solid}`}>
                {leadTitle ?? title}
              </span>
              {outlineTitle ? (
                <>
                  {" "}
                  <span
                    className="section-banner-heading section-outline-word whitespace-nowrap"
                    style={{
                      WebkitTextStroke: "1.8px var(--color-accent)",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {outlineTitle}
                  </span>
                </>
              ) : null}
            </h2>
          </div>
          {activeFilter && onChange ? (
            <FilterPills
              activeFilter={activeFilter}
              onChange={onChange}
              counts={counts}
              variant="hero"
            />
          ) : null}
        </div>
      </div>
    );
  }

  const kickerTone = "text-accent";

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-3xl">
        <p className={`font-body text-xs font-medium uppercase tracking-[0.18em] ${kickerTone}`}>
          {kicker}
        </p>
        <h2
          className={`font-heading mt-3 text-3xl font-extrabold uppercase leading-[1.25] tracking-[0.01em] ${
            dark ? "text-white" : "text-black"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl font-body text-base font-normal leading-relaxed text-black/64">
            {description}
          </p>
        ) : null}
      </div>
      {activeFilter && onChange ? (
        <div className="flex justify-start">
          <FilterPills activeFilter={activeFilter} onChange={onChange} counts={counts} />
        </div>
      ) : null}
    </div>
  );
}

function SectionActions({
  canLoadMore,
  onLoadMore,
  remainingCount,
  browseHref,
  browseLabel,
}: {
  canLoadMore: boolean;
  onLoadMore?: () => void;
  remainingCount: number;
  browseHref: string;
  browseLabel: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {canLoadMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="focus-ring rounded-lg border border-border px-4 py-2 font-body text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
        >
          Load more ({remainingCount} more {browseLabel})
        </button>
      ) : null}
      <Link
        href={browseHref}
        className="focus-ring rounded-lg border border-accent bg-accent-subtle px-4 py-2 font-body text-sm font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-white"
      >
        Browse all {browseLabel}
      </Link>
    </div>
  );
}

function PopularTile({ item }: { item: DiscoveryItem }) {
  const image = isSongItem(item) ? item.image : item.poster;
  const eyebrow = isSongItem(item) ? item.category : item.genres[0] ?? item.label;
  const secondary = isSongItem(item)
    ? item.artist
    : item.type === "movie"
      ? `${item.year} · ${item.runtime ?? ""}`
      : `${item.year} · ${pluralize(item.seasonsCount ?? 0, "season")}`;

  return (
    <Link href={item.href} className="hover-card group flex h-full flex-col">
      <div className="relative aspect-[1.18/0.74] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
        <ContentImage
          src={image}
          alt={item.title}
          sizes={GRID_TILE_IMAGE_SIZES}
          className="hover-card-media object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <span className="route-tag">{eyebrow}</span>
        <h3 className="hover-card-title card-heading clamp-2 mt-3 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
          {item.title}
        </h3>
        <p
          className={`mt-2 ${
            isSongItem(item)
              ? "clamp-1 font-card text-base font-medium text-black/74"
              : "clamp-1 font-body text-sm font-normal text-black/62"
          }`}
        >
          {secondary}
        </p>
      </div>
    </Link>
  );
}

function LatestFeature({ item }: { item: DiscoveryItem }) {
  const image = isSongItem(item) ? item.image : item.backdrop;
  const byline = isSongItem(item) ? item.relatedTitle : item.meta;
  const subcopy = isSongItem(item)
    ? `Leading track from ${item.relatedType.toLowerCase()} ${item.relatedTitle}.`
    : item.description;

  return (
    <Link href={item.href} className="hover-card group flex h-full flex-col">
      <div className="grid gap-6 lg:grid-cols-[minmax(420px,1.1fr)_minmax(0,0.9fr)] xl:grid-cols-[minmax(520px,1.2fr)_minmax(0,0.8fr)]">
        <div className="relative aspect-[1.42/0.8] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
          <ContentImage
            src={image}
            alt={item.title}
            sizes={FEATURE_IMAGE_SIZES}
            className="hover-card-media object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {item.label}
            </p>
            <h3 className="hover-card-title font-card mt-3 text-2xl font-semibold leading-tight text-black sm:text-[2.15rem]">
              {item.title}
            </h3>
            <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
              {subcopy}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 font-body text-sm font-normal text-black/54">
            <span>{byline}</span>
            <span>{isSongItem(item) ? "New this week" : item.year}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LatestListItem({ item }: { item: DiscoveryItem }) {
  const image = isSongItem(item) ? item.image : item.poster;
  const detail = isSongItem(item)
    ? `${item.relatedTitle} · ${item.meta}`
    : `${item.year} · ${item.meta}`;

  return (
    <Link href={item.href} className="route-row-link group sm:grid-cols-[150px_1fr]">
      <div className="relative aspect-[1.15/0.72] overflow-hidden rounded-[0.38rem] bg-[#ede5da]">
        <ContentImage
          src={image}
          alt={item.title}
          sizes={ROW_IMAGE_SIZES}
          className="hover-card-media object-cover"
        />
      </div>
      <div>
        <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {item.label}
        </p>
        <h4 className="hover-card-title font-card mt-2 text-2xl font-semibold leading-tight text-black">
          {item.title}
        </h4>
        <p className="mt-2 font-body text-sm font-normal text-black/58">{detail}</p>
      </div>
    </Link>
  );
}

function EpisodeFeature({ item }: { item: WeeklyEpisodeItem }) {
  return (
    <Link href={item.href} className="hover-card group block">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="relative aspect-[1.18/0.72] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
          <ContentImage
            src={item.image}
            alt={item.seriesTitle}
            sizes={EPISODE_FEATURE_IMAGE_SIZES}
            className="hover-card-media object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {item.label}
            </p>
            <h3 className="hover-card-title font-card mt-3 text-2xl font-semibold leading-tight text-black">
              {item.episodeTitle}
            </h3>
            <p className="mt-2 font-card text-base font-medium text-black/72">
              {item.seriesTitle} · {item.episodeCode}
            </p>
            <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
              {item.summary}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 font-body text-sm font-normal text-black/52">
            <span>{pluralize(item.songsCount, "soundtrack cue")}</span>
            <span>Lead song: {item.leadSong}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EpisodeListItem({ item }: { item: WeeklyEpisodeItem }) {
  return (
    <Link href={item.href} className="route-row-link group">
      <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {item.episodeCode}
      </p>
      <h4 className="hover-card-title font-card mt-2 text-2xl font-semibold leading-tight text-black">
        {item.episodeTitle}
      </h4>
      <p className="mt-2 font-body text-sm font-normal text-black/58">
        {item.seriesTitle} · {item.leadSong}
      </p>
    </Link>
  );
}

function TrendingFeature({ item }: { item: TrendingSongItem }) {
  return (
    <Link href={item.href} className="hover-card group block">
      <div className="grid gap-6 lg:grid-cols-[minmax(420px,0.95fr)_1fr] xl:grid-cols-[minmax(520px,1.08fr)_1fr]">
        <div className="relative aspect-[1.24/0.78] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
          <ContentImage
            src={item.image}
            alt={item.title}
            sizes={TRENDING_FEATURE_IMAGE_SIZES}
            className="hover-card-media object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#6B6965] dark:text-[#9A9895]">
              <span className="text-[#E84528]">#{item.rank}</span> Trending This Week
            </p>
            <h3 className="hover-card-title card-heading mt-3 text-2xl font-semibold leading-tight text-black">
              {item.title}
            </h3>
            <span className="route-tag mt-3">{item.category}</span>
            <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/62">
              {item.artist} is driving one of the most clicked soundtrack moments on the platform
              this week.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 font-body text-sm font-normal text-black/52">
            <span>{item.relatedTitle}</span>
            <span>{pluralize(item.appearances.length, "appearance")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrendingListItem({ item }: { item: TrendingSongItem }) {
  return (
    <Link href={item.href} className="hover-card group block">
      <div className="relative aspect-[1.18/0.72] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
        <ContentImage
          src={item.image}
          alt={item.title}
          sizes={GRID_TILE_IMAGE_SIZES}
          className="hover-card-media object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#6B6965] dark:text-[#9A9895]">
          <span className="text-[#E84528]">#{item.rank}</span> Trending
        </p>
        <h4 className="hover-card-title card-heading clamp-2 mt-3 min-h-[3rem] text-xl font-semibold leading-tight text-black">
          {item.title}
        </h4>
        <span className="route-tag mt-3 w-fit">{item.category}</span>
        <p className="clamp-1 mt-3 font-card text-sm font-medium text-black/74">{item.artist}</p>
        <p className="clamp-2 mt-auto min-h-[2.9rem] pt-3 font-body text-sm font-normal leading-relaxed text-black/62">
          Trending from {item.relatedTitle} with{" "}
          {pluralize(item.appearances.length, "soundtrack appearance")} this week.
        </p>
      </div>
    </Link>
  );
}

type HomeDiscoverySectionsClientProps = {
  popularCollections: Record<FilterId, DiscoveryItem[]>;
  latestCollections: Record<FilterId, DiscoveryItem[]>;
  trendingStories: TrendingSongItem[];
  weeklyEpisodes: WeeklyEpisodeItem[];
};

export function HomeDiscoverySectionsClient({
  popularCollections,
  latestCollections,
  trendingStories,
  weeklyEpisodes,
}: HomeDiscoverySectionsClientProps) {
  const [popularFilter, setPopularFilter] = useState<FilterId>("movies");
  const [latestFilter, setLatestFilter] = useState<FilterId>("movies");
  const [popularVisibleCount, setPopularVisibleCount] = useState(POPULAR_INITIAL_COUNT);
  const [latestVisibleCount, setLatestVisibleCount] = useState(LATEST_INITIAL_COUNT);
  const [episodesVisibleCount, setEpisodesVisibleCount] = useState(EPISODES_INITIAL_COUNT);
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const syncThemeMode = () => {
      setMode(document.documentElement.dataset.mode === "dark" ? "dark" : "light");
    };

    syncThemeMode();

    const observer = new MutationObserver(syncThemeMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPopularVisibleCount(POPULAR_INITIAL_COUNT);
  }, [popularFilter]);

  useEffect(() => {
    setLatestVisibleCount(LATEST_INITIAL_COUNT);
  }, [latestFilter]);

  const popularItems = popularCollections[popularFilter].slice(0, popularVisibleCount);
  const latestItems = latestCollections[latestFilter].slice(0, latestVisibleCount);
  const featuredLatest = latestItems[0];
  const supportingLatest = latestItems.slice(1);
  const featuredTrending = trendingStories[0];
  const supportingTrending = trendingStories.slice(1);
  const featuredEpisode = weeklyEpisodes[0];
  const visibleEpisodes = weeklyEpisodes.slice(0, episodesVisibleCount);
  const supportingEpisodes = visibleEpisodes.slice(1);
  const canLoadMorePopular = popularVisibleCount < popularCollections[popularFilter].length;
  const canLoadMoreLatest = latestVisibleCount < latestCollections[latestFilter].length;
  const canLoadMoreEpisodes = episodesVisibleCount < weeklyEpisodes.length;
  const popularRemainingCount = Math.max(
    popularCollections[popularFilter].length - popularVisibleCount,
    0,
  );
  const latestRemainingCount = Math.max(
    latestCollections[latestFilter].length - latestVisibleCount,
    0,
  );
  const episodesRemainingCount = Math.max(weeklyEpisodes.length - episodesVisibleCount, 0);
  const popularBrowseHref = getBrowseHrefForFilter(popularFilter);
  const latestBrowseHref = getBrowseHrefForFilter(latestFilter);
  const popularCounts = {
    movies: popularCollections.movies.length,
    series: popularCollections.series.length,
    songs: popularCollections.songs.length,
  } satisfies Record<FilterId, number>;
  const latestCounts = {
    movies: latestCollections.movies.length,
    series: latestCollections.series.length,
    songs: latestCollections.songs.length,
  } satisfies Record<FilterId, number>;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1360px] space-y-14 sm:space-y-16">
        <section className="hero-stage relative overflow-hidden px-2 py-10 sm:px-4 sm:py-20 lg:py-22">
          <div className="relative mx-auto flex min-h-[22rem] max-w-6xl flex-col justify-between text-center sm:min-h-0">
            <div className="order-1 mx-auto w-full max-w-5xl sm:order-3 sm:mt-10">
              <Suspense fallback={null}>
                <SearchBar mode="inline" />
              </Suspense>
            </div>

            <div className="order-2 mt-2 sm:order-1 sm:mt-0">
              <h1 className="hero-search-title font-heading mx-auto max-w-5xl font-extrabold uppercase text-black">
                <span className="block text-[clamp(2rem,10vw,2.8rem)] leading-[1.1] tracking-[0.01em] sm:text-6xl sm:leading-[1.15] lg:text-7xl">
                  Discover
                </span>
                <span
                  className="block py-1 text-[clamp(1.05rem,6.5vw,1.45rem)] leading-[1.15] tracking-[0.01em] sm:py-0 sm:text-6xl sm:leading-[1.15] lg:text-7xl"
                  style={{
                    WebkitTextStroke: "1.8px var(--color-accent)",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Soundtracks
                </span>
              </h1>

              <p className="hero-tagline mx-auto mt-5 max-w-3xl px-2 font-body text-sm font-normal leading-relaxed text-black/74 sm:mt-6 sm:px-0 sm:text-lg">
                Search songs, movies, series, and artists in one place.
              </p>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            kicker="Weekly momentum"
            title="Trending This Week"
            description=""
            variant="split-banner"
            leadTitle="Trending"
            outlineTitle="This Week"
            dark={mode === "dark"}
          />
          <div className="mt-8 space-y-8">
            <div>{featuredTrending ? <TrendingFeature item={featuredTrending} /> : null}</div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {supportingTrending.map((item) => (
                <TrendingListItem key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            kicker="Weekly charts"
            title="Popular This Week"
            description="A flat editorial shelf for the titles and tracks getting the most attention right now."
            activeFilter={popularFilter}
            onChange={setPopularFilter}
            counts={popularCounts}
            variant="split-banner"
            leadTitle="Popular"
            outlineTitle="This Week"
            dark={mode === "dark"}
          />
          <div className="mt-8 grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-5">
            {popularItems.map((item) => (
              <PopularTile key={item.slug} item={item} />
            ))}
          </div>
          <SectionActions
            canLoadMore={canLoadMorePopular}
            onLoadMore={() =>
              setPopularVisibleCount((current) =>
                Math.min(current + POPULAR_STEP, popularCollections[popularFilter].length),
              )
            }
            remainingCount={popularRemainingCount}
            browseHref={popularBrowseHref}
            browseLabel={getBrowseLabelForFilter(popularFilter)}
          />
        </section>

        <section>
          <SectionHeader
            kicker="Fresh drops"
            title="Latest Releases"
            description="Latest arrivals laid out like a magazine feed instead of boxed cards."
            activeFilter={latestFilter}
            onChange={setLatestFilter}
            counts={latestCounts}
            variant="split-banner"
            leadTitle="Latest"
            outlineTitle="Releases"
            dark={mode === "dark"}
          />
          <div className="mt-8 space-y-8">
            <div>{featuredLatest ? <LatestFeature item={featuredLatest} /> : null}</div>
            <div className="grid gap-5 md:grid-cols-2">
              {supportingLatest.map((item) => (
                <LatestListItem key={item.slug} item={item} />
              ))}
            </div>
          </div>
          <SectionActions
            canLoadMore={canLoadMoreLatest}
            onLoadMore={() =>
              setLatestVisibleCount((current) =>
                Math.min(current + LATEST_STEP, latestCollections[latestFilter].length),
              )
            }
            remainingCount={latestRemainingCount}
            browseHref={latestBrowseHref}
            browseLabel={getBrowseLabelForFilter(latestFilter)}
          />
        </section>

        <section>
          <SectionHeader
            kicker="Newly mapped episodes"
            title="Episodes This Week"
            description="Scene-by-scene episode breakdowns from newly featured series entries."
            variant="split-banner"
            leadTitle="Episodes"
            outlineTitle="This Week"
            dark={mode === "dark"}
          />
          <div className="mt-8 space-y-8">
            <div className="xl:max-w-5xl">
              {featuredEpisode ? <EpisodeFeature item={featuredEpisode} /> : null}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {supportingEpisodes.map((item) => (
                <EpisodeListItem key={item.id} item={item} />
              ))}
            </div>
          </div>
          <SectionActions
            canLoadMore={canLoadMoreEpisodes}
            onLoadMore={() =>
              setEpisodesVisibleCount((current) =>
                Math.min(current + EPISODES_STEP, weeklyEpisodes.length),
              )
            }
            remainingCount={episodesRemainingCount}
            browseHref="/series/episodes"
            browseLabel="episodes"
          />
        </section>
      </div>
    </div>
  );
}
