"use client";

import { useMemo, useState } from "react";
import { SoundtrackList } from "@/components/soundtrack-list";
import { SplitHeading } from "@/components/route-heading";
import type { Season } from "@/lib/catalog-types";
import { pluralize } from "@/lib/text";

type SeriesSceneMapProps = {
  seasons: Season[];
};

export function SeriesSceneMap({ seasons }: SeriesSceneMapProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = useMemo(
    () =>
      [
        ...new Set(
          seasons.flatMap((season) =>
            season.episodes.flatMap((episode) =>
              episode.songs.map((song) => song.sceneType).filter(Boolean),
            ),
          ),
        ),
      ].sort((left, right) => left.localeCompare(right)) as string[],
    [seasons],
  );

  const filteredSeasons = useMemo(
    () =>
      seasons
        .map((season) => ({
          ...season,
          episodes: season.episodes
            .map((episode) => ({
              ...episode,
              songs: activeFilter
                ? episode.songs.filter((song) => song.sceneType === activeFilter)
                : episode.songs,
            }))
            .filter((episode) => episode.songs.length > 0),
        }))
        .filter((season) => season.episodes.length > 0),
    [activeFilter, seasons],
  );

  const seasonSummaries = filteredSeasons.map((season) => ({
    seasonNumber: season.seasonNumber,
    episodeCount: season.episodes.length,
    cueCount: season.episodes.reduce((count, episode) => count + episode.songs.length, 0),
  }));

  return (
    <div className="space-y-14">
      {filters.length > 0 ? (
        <section>
          <div className="mb-4">
            <SplitHeading
              kicker="Browse scenes"
              leadTitle="Scene"
              outlineTitle="Filters"
              compact
            />
          </div>
          <div className="route-surface py-5">
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => {
                const isActive = filter === activeFilter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`route-tag focus-ring ${isActive ? "route-tag-accent" : ""}`}
                    aria-pressed={isActive}
                  >
                    {filter}
                  </button>
                );
              })}
              {activeFilter ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter(null)}
                  className="route-action focus-ring ml-2"
                >
                  Clear filter
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {filteredSeasons.length > 0 ? (
        <>
          <section>
            <div className="mb-6">
              <SplitHeading
                kicker="Season navigator"
                leadTitle="Jump To"
                outlineTitle="Seasons"
                compact
              />
            </div>
            <div className="route-surface px-1 py-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {seasonSummaries.map((season) => (
                  <a
                    key={season.seasonNumber}
                    href={`#season-${season.seasonNumber}`}
                    className="route-row-link grid-cols-[1fr]"
                  >
                    <div>
                      <p className="route-kicker">Season {season.seasonNumber}</p>
                      <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                        {pluralize(season.episodeCount, "mapped episode", "mapped episodes")}
                      </h3>
                      <p className="mt-2 font-body text-sm font-normal text-black/54">
                        {pluralize(season.cueCount, "cue")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-7">
              <SplitHeading
                kicker="Episode-level breakdown"
                leadTitle="Season"
                outlineTitle="Map"
                compact
              />
            </div>

            <div className="space-y-14">
              {filteredSeasons.map((season) => (
                <section
                  key={season.seasonNumber}
                  id={`season-${season.seasonNumber}`}
                  className="scroll-mt-28"
                >
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="route-kicker">Season {season.seasonNumber}</p>
                      <h3 className="card-heading mt-2 text-3xl font-semibold leading-tight text-black">
                        {pluralize(season.episodes.length, "mapped episode", "mapped episodes")}
                      </h3>
                    </div>
                    <p className="font-body text-sm font-normal text-black/54">
                      Total{" "}
                      {pluralize(
                        season.episodes.reduce(
                          (count, episode) => count + episode.songs.length,
                          0,
                        ),
                        "cue",
                      )}
                    </p>
                  </div>

                  <div className="route-surface">
                    {season.episodes.map((episode) => (
                      <section
                        key={`${season.seasonNumber}-${episode.episodeNumber}`}
                        className="route-divider pt-6 first:border-t-0 first:pt-0"
                      >
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="route-kicker">
                              Season {season.seasonNumber} · Episode {episode.episodeNumber}
                            </p>
                            <h4 className="card-heading mt-2 text-[1.7rem] font-semibold leading-[1.04] text-black">
                              {episode.title}
                            </h4>
                          </div>
                          <p className="font-body text-sm font-normal text-black/58">
                            {pluralize(episode.songs.length, "cue")} · Lead song:{" "}
                            {episode.songs[0]?.song.title ?? "Soundtrack update"}
                          </p>
                        </div>

                        <p className="mb-6 max-w-3xl font-body text-base font-normal leading-relaxed text-black/62">
                          {episode.summary}
                        </p>

                        <SoundtrackList
                          items={episode.songs.map((song) => ({
                            ...song,
                            seasonNumber: season.seasonNumber,
                            episodeNumber: episode.episodeNumber,
                            episodeTitle: episode.title,
                          }))}
                          showEpisode
                          variant="bulletin"
                        />
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="route-surface py-6">
          <p className="route-kicker">No scene matches</p>
          <p className="body-copy mt-3 max-w-2xl">
            No episode cues match the current scene filter. Clear the filter to restore the full
            season map.
          </p>
        </section>
      )}
    </div>
  );
}
