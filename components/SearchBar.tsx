"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SearchResults from "@/components/SearchResults";
import { useSearchStore } from "@/store/useSearchStore";

const FILTERS = [
  { id: "movies", label: "Movies" },
  { id: "tv", label: "TV Shows" },
  { id: "songs", label: "Songs" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
  { id: "podcasts", label: "Podcasts" },
] as const;

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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon({ className = "" }: { className?: string }) {
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
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
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
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

type SearchBarProps = {
  inline?: boolean;
};

export default function SearchBar({ inline = true }: SearchBarProps) {
  const { isOpen, query, activeFilters, open, close, setQuery, toggleFilter } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSyncedUrl = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navOffset, setNavOffset] = useState(104);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const handleOpen = () => {
    if (!isOpen) {
      open();
    }
  };

  const syncUrl = (nextQuery: string) => {
    if (pathname !== "/") return;

    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  };

  const handleClose = () => {
    close();
    syncUrl("");
  };

  const useInlineMobileLayout = inline && isMobileViewport;

  const commitSearch = (nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
    handleOpen();

    if (trimmedQuery.length >= 3) {
      syncUrl(trimmedQuery);
    } else {
      syncUrl("");
    }

    inputRef.current?.blur();
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      syncUrl(debouncedQuery);
      return;
    }

    if (!debouncedQuery.trim()) {
      syncUrl("");
    }
  }, [debouncedQuery, searchParams]);

  useEffect(() => {
    if (hasSyncedUrl.current) return;

    if (pathname === "/") {
      const q = searchParams.get("q");
      if (q) {
        setQuery(q);
        open();
      }
    }

    hasSyncedUrl.current = true;
  }, [searchParams, open, setQuery, pathname]);

  useEffect(() => {
    const navElement = document.querySelector<HTMLElement>("[data-site-nav]");

    if (!navElement) return;

    const syncNavOffset = () => {
      setNavOffset(Math.ceil(navElement.getBoundingClientRect().height) + 12);
    };

    syncNavOffset();

    const resizeObserver = new ResizeObserver(syncNavOffset);
    resizeObserver.observe(navElement);
    window.addEventListener("resize", syncNavOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncNavOffset);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const syncMobileViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncMobileViewport();
    mediaQuery.addEventListener("change", syncMobileViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncMobileViewport);
    };
  }, []);

  if (!inline && !isOpen) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/12 backdrop-blur-md dark:bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        layoutId="search-bar"
        onClick={() => {
          handleOpen();
        }}
        onPointerDown={(event) => {
          if (isOpen) {
            return;
          }

          const target = event.target as HTMLElement | null;
          if (target?.closest("button")) {
            return;
          }

          inputRef.current?.focus();
          handleOpen();
        }}
        className={[
          isOpen
            ? useInlineMobileLayout
              ? "relative z-[60] mx-auto w-full max-w-2xl"
              : "fixed inset-x-0 z-[60] w-full px-4 pb-0 sm:px-6 lg:px-8"
            : inline
              ? "relative z-10 mx-auto max-w-2xl cursor-pointer"
              : "hidden",
        ].join(" ")}
        style={{
          originX: 0.5,
          originY: 0,
          top: isOpen && !useInlineMobileLayout ? `${navOffset}px` : undefined,
        }}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
          default: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        <div className="mx-auto w-full max-w-none">
          <div role="search">
          <div
            className={[
              "flex items-center gap-3 border-[1.5px] border-accent bg-white text-black shadow-[0_18px_40px_rgba(0,0,0,0.12)] dark:bg-zinc-950/96 dark:text-white",
              isOpen ? "w-full rounded-xl px-5 py-4" : "rounded-xl px-5 py-4",
            ].join(" ")}
          >
            <SearchIcon className="h-[18px] w-[18px] shrink-0 text-accent" />
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={query}
              onChange={(event) => {
                handleOpen();
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  commitSearch(event.currentTarget.value);
                }
              }}
              onFocus={() => handleOpen()}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              placeholder="Search for Movies, TV Shows, Songs or Artists"
              className="min-w-0 flex-1 bg-transparent font-body text-base font-medium text-black placeholder:text-black/48 focus:outline-none dark:text-white dark:placeholder:text-white/42"
            />

            <AnimatePresence>
              {isOpen ? (
                <motion.button
                  key="close"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClose();
                  }}
                  className="shrink-0 text-black/56 transition-colors hover:text-black dark:text-white/56 dark:hover:text-white"
                  aria-label="Close search"
                >
                  <CloseIcon className="h-5 w-5" />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
          </div>

          <AnimatePresence>
            {isOpen ? (
              <motion.div
                key="filters"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex flex-wrap items-center gap-2 px-1 pt-3 pb-4"
              >
                <span className="mr-1 flex items-center gap-1 font-body text-xs font-medium text-black/60 dark:text-white/62">
                  <FilterIcon className="h-[13px] w-[13px]" />
                  Filter by
                </span>

                {FILTERS.map((filter, index) => (
                  <motion.button
                    key={filter.id}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFilter(filter.id);
                    }}
                    className={[
                      "rounded-full px-3 py-1 font-body text-xs font-medium uppercase tracking-wide transition-colors duration-150",
                      activeFilters.includes(filter.id)
                        ? "bg-accent text-white"
                        : "bg-accent-subtle text-accent hover:bg-accent/10 hover:text-accent-hover",
                    ].join(" ")}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isOpen && query.trim().length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="mt-2 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-black/10 bg-[#fffdf9] pb-6 text-foreground shadow-[0_28px_80px_rgba(31,25,21,0.18)] ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-950 dark:ring-white/5"
              >
                <SearchResults query={debouncedQuery} filters={activeFilters} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
