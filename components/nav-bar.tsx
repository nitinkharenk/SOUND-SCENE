"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import {
  movieHighlights,
  popularSongs,
  seriesHighlights,
  trendingContent,
  type SongLibraryItem,
} from "@/lib/catalog";

type Theme = "light" | "dark";

type NavLink = {
  href: string;
  label: "New Releases" | "Charts" | "Songs" | "Movies" | "Series";
  active?: boolean;
  menu?: boolean;
};

const links: NavLink[] = [
  { href: "/", label: "New Releases", active: true, menu: true },
  { href: "/charts", label: "Charts", menu: true },
  { href: "/songs", label: "Songs" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
] as const;

type MenuLabel = (typeof links)[number]["label"];

type MegaMenuItem = {
  title: string;
  href: string;
  image: string;
};

type MenuConfig = {
  leftTitle: string;
  rightTitle: string;
  leftItems: MegaMenuItem[];
  featureItems: MegaMenuItem[];
  viewAllLabel: string;
  tags: string[];
  viewAllHref: string;
};

const fallbackPoster =
  trendingContent[0]?.poster ?? movieHighlights[0]?.poster ?? seriesHighlights[0]?.poster ?? "";

function findPosterForSong(song: SongLibraryItem, fallback: string): string {
  return (
    trendingContent.find((item) => item.slug === song.appearances[0]?.contentSlug)?.poster ??
    fallback
  );
}

function MenuIcon({ className = "" }: { className?: string }) {
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
      <path d="M5 7h14" />
      <path d="M8 12h11" />
      <path d="M5 17h14" />
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

function SunIcon({ className = "" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.75v2.1" />
      <path d="M12 19.15v2.1" />
      <path d="m4.93 4.93 1.48 1.48" />
      <path d="m17.59 17.59 1.48 1.48" />
      <path d="M2.75 12h2.1" />
      <path d="M19.15 12h2.1" />
      <path d="m4.93 19.07 1.48-1.48" />
      <path d="m17.59 6.41 1.48-1.48" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
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
      <path d="M18.5 14.2A7 7 0 0 1 9.8 5.5a7.9 7.9 0 1 0 8.7 8.7Z" />
    </svg>
  );
}

export function NavBar() {
  const [activeMenu, setActiveMenu] = useState<MenuLabel | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const { open } = useSearchStore();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((current) => !current);
  };

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  }

  const releaseItems: MegaMenuItem[] = popularSongs.slice(0, 4).map((song, index) => ({
    title:
      ["Fresh Singles", "Coming Soon", "Editors' Picks", "Wildcard Finds"][index] ??
      song.title,
    href: `/songs/${song.slug}`,
    image: findPosterForSong(song, fallbackPoster),
  }));

  const releaseFeatures: MegaMenuItem[] = trendingContent
    .slice(0, 3)
    .map((entry, index) => ({
      title: ["Fresh Singles", "Coming Soon", "Homepage"][index] ?? entry.title,
      href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
      image: entry.poster,
    }));

  const combinedHighlights = [...movieHighlights, ...seriesHighlights];

  const chartItems: MegaMenuItem[] = combinedHighlights.slice(0, 4).map((entry, index) => ({
    title:
      ["Top Movies", "Top Series", "Biggest Climbers", "Most Streamed"][index] ?? entry.title,
    href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
    image: entry.poster,
  }));

  const chartFeatures: MegaMenuItem[] = combinedHighlights.slice(0, 3).map((entry, index) => ({
    title: [entry.title, `${entry.title} Trends`, `Inside ${entry.title}`][index] ?? entry.title,
    href: `/${entry.type === "movie" ? "movies" : "series"}/${entry.slug}`,
    image: entry.poster,
  }));

  const menuContent: Partial<Record<MenuLabel, MenuConfig>> = {
    "New Releases": {
      leftTitle: "Popular",
      rightTitle: "More Releases",
      leftItems: releaseItems,
      featureItems: releaseFeatures,
      viewAllLabel: "View All Releases",
      tags: [
        "Synth-pop",
        "Indie",
        "Electronic",
        "R&B",
        "Ambient",
        "Alt Pop",
        "Upcoming",
        "Singles",
        "Global Pop",
      ],
      viewAllHref: "/charts",
    },
    Charts: {
      leftTitle: "Popular",
      rightTitle: "More Charts",
      leftItems: chartItems,
      featureItems: chartFeatures,
      viewAllLabel: "View All Charts",
      tags: [
        "Most Watched",
        "Most Streamed",
        "Breakout Titles",
        "Fan Favorites",
        "Movie Charts",
        "Series Charts",
        "Top Episodes",
        "Song Charts",
        "Weekend Rankers",
      ],
      viewAllHref: "/charts",
    },
  };

  const currentMenu = activeMenu ? menuContent[activeMenu] ?? null : null;

  return (
    <header
      data-site-nav
      className="sticky top-0 z-30 isolate shadow-[0_10px_30px_rgba(16,16,16,0.04)] backdrop-blur-md"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div
          className="relative flex items-center justify-between gap-3 border-b py-3 pr-14 sm:gap-4 sm:py-4 sm:pr-0"
          style={{ borderColor: "var(--line)" }}
        >
          <Link href="/" className="flex min-w-0 flex-1 items-center pr-2 sm:pr-3">
            <span className="block min-w-0">
              <span className="font-heading block truncate text-[0.84rem] font-extrabold uppercase leading-none tracking-tight sm:text-[1.35rem] lg:text-[1.5rem]">
                SoundScene
              </span>
              <span className="mt-1 hidden font-body text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)] sm:block lg:text-[0.72rem] lg:tracking-[0.28em]">
                Discovery for curious listeners
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onMouseEnter={() => setActiveMenu(link.menu ? link.label : null)}
                className={`focus-ring relative py-2 font-body text-[0.95rem] font-medium text-foreground transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-accent-hover after:transition-all after:duration-200 ${
                  activeMenu === link.label || (!activeMenu && link.active)
                    ? "text-accent after:w-full after:bg-accent"
                    : "hover:after:w-full hover:text-accent-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={open}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-border text-[1.05rem] transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
              aria-label="Open search"
            >
              <SearchIcon className="h-[1.1rem] w-[1.1rem]" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-[0.9rem] border text-[1.05rem] transition hover:opacity-90"
              style={{ borderColor: "var(--line)" }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <SunIcon className="h-[1.1rem] w-[1.1rem]" />
              ) : (
                <MoonIcon className="h-[1.1rem] w-[1.1rem]" />
              )}
            </button>
          </div>

          <div className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="focus-ring flex h-11 w-11 touch-manipulation items-center justify-center rounded-[0.9rem] border border-border bg-[color:var(--background)] text-[1.05rem] transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div
          id="mobile-nav-menu"
          className="border-b lg:hidden"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--background)" }}
        >
          <div className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6">
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  open();
                }}
                className="focus-ring flex h-11 items-center justify-center rounded-[0.9rem] border border-border px-4 font-body text-[0.95rem] font-medium transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
                style={{ backgroundColor: "var(--card)" }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="focus-ring flex h-11 items-center justify-center rounded-[0.9rem] border px-4 font-body text-[0.95rem] font-medium transition-colors hover:border-accent-hover hover:text-accent-hover"
                style={{ borderColor: "var(--line)" }}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-[0.9rem] px-4 py-3 font-body text-[0.95rem] font-medium transition-colors ${
                    link.active ? "bg-accent-subtle text-accent" : "hover:bg-accent-subtle/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

          </div>
        </div>
      ) : null}
      {currentMenu ? (
        <div
          className="absolute inset-x-0 top-full hidden border-b py-5 shadow-[0_18px_40px_rgba(0,0,0,0.08)] lg:block"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--background)" }}
          onMouseEnter={() => {
            if (activeMenu) {
              setActiveMenu(activeMenu);
            }
          }}
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            {/* Keep Syne menu headings at least 14px larger than Cabinet item titles in this panel. */}
            <div className="grid gap-7 xl:grid-cols-[1.45fr_1fr]">
              <div
                className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:border-r xl:pr-8"
                style={{ borderColor: "var(--line)" }}
              >
                <div>
                  <p className="font-heading text-3xl font-bold uppercase tracking-tight">
                    {currentMenu.leftTitle}
                  </p>
                  <div className="mt-4 space-y-3">
                    {currentMenu.leftItems.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-[56px] w-[104px] rounded-[0.32rem] object-cover"
                        />
                        <span className="font-card text-base font-medium tracking-tight">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <Link
                    href={currentMenu.viewAllHref}
                    className="font-body text-sm font-medium uppercase tracking-[0.18em] underline decoration-2 underline-offset-4"
                  >
                    {currentMenu.viewAllLabel || "View All"}
                  </Link>
                  <div className="mt-4 space-y-3">
                    {currentMenu.featureItems.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-[56px] w-[104px] rounded-[0.32rem] object-cover"
                        />
                        <span className="font-card text-base font-medium tracking-tight">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="font-heading text-3xl font-bold uppercase leading-none tracking-tight">
                  {currentMenu.rightTitle}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 2xl:grid-cols-3">
                  {currentMenu.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={currentMenu.viewAllHref}
                      className="flex items-center gap-3 font-body text-xs font-medium uppercase tracking-wide"
                    >
                      <span className="h-3 w-3 rounded-[3px] bg-accent" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
