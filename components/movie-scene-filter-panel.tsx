"use client";

import { useMemo, useState } from "react";
import { SoundtrackList, type SoundtrackListItem } from "@/components/soundtrack-list";

type MovieSceneFilterPanelProps = {
  items: SoundtrackListItem[];
};

export function MovieSceneFilterPanel({ items }: MovieSceneFilterPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = useMemo(
    () =>
      [
        ...new Set(
          items
            .map((item) => item.sceneType)
            .filter((sceneType): sceneType is string => Boolean(sceneType)),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [items],
  );

  const filteredItems = activeFilter
    ? items.filter((item) => item.sceneType === activeFilter)
    : items;

  return (
    <div className="space-y-6">
      {filters.length > 0 ? (
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
      ) : null}

      <SoundtrackList items={filteredItems} />
    </div>
  );
}
