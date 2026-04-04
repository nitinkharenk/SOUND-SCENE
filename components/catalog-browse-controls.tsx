"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildBrowseHref } from "@/lib/browse";

export type BrowseFilterConfig = {
  param: string;
  label: string;
  allLabel: string;
  options: string[];
};

export type BrowseSortOption = {
  value: string;
  label: string;
};

type CatalogBrowseControlsProps = {
  activeLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  filters: BrowseFilterConfig[];
  sortOptions: BrowseSortOption[];
  defaultSort?: string;
};

type BrowseState = {
  q: string;
  sort: string;
  page?: number;
} & Record<string, string | number | undefined>;

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m19 19-3.6-3.6" />
    </svg>
  );
}

function readFilterValues(
  filters: BrowseFilterConfig[],
  searchParams: ReturnType<typeof useSearchParams>,
): Record<string, string> {
  return Object.fromEntries(filters.map((filter) => [filter.param, searchParams.get(filter.param) ?? ""]));
}

export function CatalogBrowseControls({
  activeLabel,
  searchLabel,
  searchPlaceholder,
  filters,
  sortOptions,
  defaultSort = "newest",
}: CatalogBrowseControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const fieldIdBase = activeLabel.toLowerCase().replace(/\s+/g, "-");

  const queryParam = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort") ?? defaultSort;
  const filterParams = readFilterValues(filters, searchParams);

  const [query, setQuery] = useState(queryParam);
  const [sort, setSort] = useState(sortParam);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(filterParams);

  useEffect(() => {
    setQuery(queryParam);
    setSort(sortParam);
    setSelectedFilters(filterParams);
  }, [searchKey, queryParam, sortParam, filters]);

  const replaceFilters = (next: BrowseState) => {
    const href = buildBrowseHref(pathname, next, { defaultSort });
    const currentHref = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    if (href !== currentHref) {
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    }
  };

  useEffect(() => {
    if (query === queryParam) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      replaceFilters({
        q: query,
        sort,
        page: 1,
        ...selectedFilters,
      });
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [query, queryParam, sort, selectedFilters, pathname, searchParams, defaultSort]);

  const activeFilters = filters
    .map((filter) =>
      selectedFilters[filter.param]
        ? { label: filter.label, value: selectedFilters[filter.param] }
        : null,
    )
    .filter(Boolean) as Array<{ label: string; value: string }>;

  const activeSortLabel = sortOptions.find((option) => option.value === sort)?.label ?? sort;

  return (
    <div className="max-w-5xl">
      <form
        action={pathname}
        method="GET"
        onSubmit={(event) => {
          event.preventDefault();
          replaceFilters({
            q: query,
            sort,
            page: 1,
            ...selectedFilters,
          });
        }}
      >
        <label htmlFor={`${fieldIdBase}-catalog-search`} className="sr-only">
          {searchLabel}
        </label>

        <div className="rounded-[0.72rem] border-[1.5px] border-accent bg-white px-5 py-4 shadow-[0_14px_32px_rgba(0,0,0,0.06)] dark:bg-zinc-950 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <SearchIcon className="h-[1.05rem] w-[1.05rem] text-accent" />
            <input
              id={`${fieldIdBase}-catalog-search`}
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              placeholder={searchPlaceholder}
              className="w-full border-none bg-transparent px-0 py-0 font-body text-lg font-medium text-foreground outline-none placeholder:text-[color:var(--muted)] sm:text-xl"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filters.map((filter) => (
            <label key={filter.param} className="flex flex-col gap-2">
              <span className="route-kicker">{filter.label}</span>
              <select
                name={filter.param}
                value={selectedFilters[filter.param] ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  const nextFilters = { ...selectedFilters, [filter.param]: nextValue };
                  setSelectedFilters(nextFilters);
                  replaceFilters({
                    q: query,
                    sort,
                    page: 1,
                    ...nextFilters,
                  });
                }}
                className="rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 font-body text-sm font-medium text-foreground outline-none"
              >
                <option value="">{filter.allLabel}</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="flex flex-col gap-2">
            <span className="route-kicker">Sort</span>
            <select
              name="sort"
              value={sort}
              onChange={(event) => {
                const nextSort = event.target.value;
                setSort(nextSort);
                replaceFilters({
                  q: query,
                  sort: nextSort,
                  page: 1,
                  ...selectedFilters,
                });
              }}
              className="rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 font-body text-sm font-medium text-foreground outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="route-tag route-tag-accent">{activeLabel}</span>
        {activeFilters.map((filter) => (
          <span key={`${filter.label}-${filter.value}`} className="route-tag">
            {filter.label}: {filter.value}
          </span>
        ))}
        {query ? <span className="route-tag">Query: {query}</span> : null}
        {sort !== defaultSort ? <span className="route-tag">Sort: {activeSortLabel}</span> : null}
        {query || activeFilters.length > 0 || sort !== defaultSort ? (
          <Link href={pathname} className="route-action">
            Reset filters
          </Link>
        ) : null}
      </div>
    </div>
  );
}
