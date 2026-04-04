"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import type { CatalogEntry, SongLibraryItem } from "@/lib/catalog-types";
import { resolveSongArtwork } from "@/lib/song-presentation";
import {
  THEME_PRESETS,
  applyTheme,
  getThemePreset,
  getStoredTheme,
  isThemePresetId,
  type ThemePresetId,
} from "@/lib/theme";

type NavLink = {
  href: string;
  label: "New Releases" | "Charts" | "Songs" | "Movies" | "Series";
  menu?: boolean;
};

const links: NavLink[] = [
  { href: "/new-releases", label: "New Releases", menu: true },
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

type MenuTag = {
  label: string;
  href: string;
};

type MenuConfig = {
  leftTitle: string;
  rightTitle: string;
  leftItems: MegaMenuItem[];
  featureItems: MegaMenuItem[];
  viewAllLabel: string;
  tags: MenuTag[];
  viewAllHref: string;
};

const THEME_FAMILIES = Object.values(
  THEME_PRESETS.reduce<Record<string, {
    id: string;
    name: string;
    preview: [string, string, string];
    variants: { light: ThemePresetId; dark: ThemePresetId };
  }>>((accumulator, preset) => {
    const entry = accumulator[preset.familyId] ?? {
      id: preset.familyId,
      name: preset.name,
      preview: preset.preview,
      variants: {
        light: preset.id,
        dark: preset.id,
      },
    };

    if (preset.mode === "light") {
      entry.variants.light = preset.id;
    } else {
      entry.variants.dark = preset.id;
    }

    accumulator[preset.familyId] = entry;
    return accumulator;
  }, {}),
);

function findPosterForSong(song: SongLibraryItem, fallback: string, trendingContent: CatalogEntry[]): string {
  return (
    trendingContent.find((item) => item.slug === song.appearances[0]?.contentSlug)?.poster ??
    resolveSongArtwork({ artwork: song.artwork, mood: song.mood }) ??
    fallback
  );
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M8 12h11" />
      <path d="M5 17h14" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m19 19-3.6-3.6" />
    </svg>
  );
}

function ThemeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="7" cy="12" r="2.2" />
      <circle cx="12" cy="7" r="2.2" />
      <circle cx="17" cy="12" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
    </svg>
  );
}

function ThemePreviewSwatches({ preview }: { preview: [string, string, string] }) {
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      {preview.map((swatch) => (
        <span
          key={swatch}
          className="h-2.5 w-2.5 rounded-full border"
          style={{ backgroundColor: swatch, borderColor: "rgba(255,255,255,0.16)" }}
        />
      ))}
    </span>
  );
}

type NavBarClientProps = {
  trendingContent: CatalogEntry[];
  movieHighlights: CatalogEntry[];
  seriesHighlights: CatalogEntry[];
  popularSongs: SongLibraryItem[];
};

export function NavBarClient({
  trendingContent,
  movieHighlights,
  seriesHighlights,
  popularSongs,
}: NavBarClientProps) {
  const [activeMenu, setActiveMenu] = useState<MenuLabel | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemePresetId>("current-light");
  const pathname = usePathname();
  const { open } = useSearchStore();
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const fallbackPoster =
    trendingContent[0]?.poster ?? movieHighlights[0]?.poster ?? seriesHighlights[0]?.poster ?? "";

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = document.documentElement.dataset.theme;
      const nextTheme =
        currentTheme && isThemePresetId(currentTheme) ? currentTheme : getStoredTheme();
      setThemeId(nextTheme);
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectTheme(nextThemeId: ThemePresetId) {
    applyTheme(nextThemeId);
    setThemeId(nextThemeId);
    setThemeMenuOpen(false);
  }

  const releaseItems: MegaMenuItem[] = popularSongs.slice(0, 4).map((song, index) => ({
    title:
      ["Fresh Singles", "Coming Soon", "Editors' Picks", "Wildcard Finds"][index] ??
      song.title,
    href: `/songs/${song.slug}`,
    image: findPosterForSong(song, fallbackPoster, trendingContent),
  }));

  const releaseFeatures: MegaMenuItem[] = trendingContent.slice(0, 3).map((entry, index) => ({
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
        { label: "Singles", href: "/songs" },
        { label: "Soundtracks", href: "/songs" },
        { label: "New Tracks", href: "/new-releases" },
        { label: "Editorial Picks", href: "/new-releases" },
        { label: "Fresh Drops", href: "/new-releases" },
        { label: "Popular Songs", href: "/songs?sort=appearances" },
      ],
      viewAllHref: "/new-releases",
    },
    Charts: {
      leftTitle: "Popular",
      rightTitle: "More Charts",
      leftItems: chartItems,
      featureItems: chartFeatures,
      viewAllLabel: "View All Charts",
      tags: [
        { label: "Most Watched", href: "/charts" },
        { label: "Most Streamed", href: "/charts" },
        { label: "Breakout Titles", href: "/charts" },
        { label: "Movie Charts", href: "/movies" },
        { label: "Series Charts", href: "/series" },
        { label: "Song Charts", href: "/songs?sort=appearances" },
      ],
      viewAllHref: "/charts",
    },
  };

  const currentMenu = activeMenu ? menuContent[activeMenu] ?? null : null;
  const currentTheme = getThemePreset(themeId);
  const currentThemeFamily = THEME_FAMILIES.find((family) => family.id === currentTheme.familyId);

  return (
    <header
      data-site-nav
      className="sticky top-0 z-30 isolate shadow-[0_10px_30px_rgba(16,16,16,0.04)] backdrop-blur-md"
      style={{ backgroundColor: "var(--nav-background)", color: "var(--nav-foreground)" }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div
          className="relative flex items-center justify-between gap-3 border-b py-3 pr-14 sm:gap-4 sm:py-4 sm:pr-0"
          style={{ borderColor: "var(--nav-border)" }}
        >
          <Link href="/" className="flex min-w-0 flex-1 items-center pr-2 sm:pr-3">
            <span className="block min-w-0">
              <span className="font-heading block truncate text-[0.84rem] font-extrabold uppercase leading-[1.2] tracking-[0.01em] sm:text-[1.35rem] lg:text-[1.5rem]">
                SoundScene
              </span>
              <span
                className="mt-1 hidden font-body text-[0.68rem] font-medium uppercase tracking-[0.22em] sm:block lg:text-[0.72rem] lg:tracking-[0.28em]"
                style={{ color: "var(--nav-muted)" }}
              >
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
                className={`focus-ring relative py-2 font-body text-[0.95rem] font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-accent-hover after:transition-all after:duration-200 ${
                  activeMenu === link.label || (!activeMenu && isActivePath(link.href))
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
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-[0.9rem] border text-[1.05rem] transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
              style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-surface)" }}
              aria-label="Open search"
            >
              <SearchIcon className="h-[1.1rem] w-[1.1rem]" />
            </button>
            <div ref={themeMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setThemeMenuOpen((current) => !current)}
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-[0.9rem] border transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
                style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-surface)" }}
                aria-label={`Open theme picker. Current theme: ${currentThemeFamily?.name ?? currentTheme.name}`}
                aria-expanded={themeMenuOpen}
                aria-haspopup="menu"
                title={`${currentThemeFamily?.name ?? currentTheme.name}`}
              >
                <ThemeIcon className="h-[1rem] w-[1rem]" />
              </button>

              {themeMenuOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[22rem] rounded-[1rem] border p-3 shadow-[0_22px_55px_rgba(0,0,0,0.18)]"
                  style={{
                    borderColor: "var(--nav-border)",
                    backgroundColor: "var(--nav-surface)",
                    color: "var(--nav-foreground)",
                  }}
                >
                  <p className="px-2 pb-2 font-body text-[0.72rem] font-medium uppercase tracking-[0.18em]" style={{ color: "var(--nav-muted)" }}>
                    Theme presets
                  </p>
                  <div className="space-y-2">
                    {THEME_FAMILIES.map((family) => {
                      const lightId = family.variants.light;
                      const darkId = family.variants.dark;
                      const lightPreset = getThemePreset(lightId);
                      const darkPreset = getThemePreset(darkId);
                      const isLightActive = themeId === lightId;
                      const isDarkActive = themeId === darkId;

                      return (
                        <div key={family.id} className="flex items-center justify-between gap-3 rounded-[0.85rem] px-3 py-3 transition-colors hover:bg-accent-subtle/40">
                          <div className="min-w-0">
                            <span className="block font-body text-sm font-medium">{family.name}</span>
                            <div className="mt-1 flex items-center gap-3">
                              <ThemePreviewSwatches preview={family.preview} />
                              <span className="font-body text-[0.72rem] uppercase tracking-[0.16em]" style={{ color: "var(--nav-muted)" }}>
                                {isLightActive ? "light active" : isDarkActive ? "dark active" : "pick mode"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => selectTheme(lightPreset.id)}
                              className={`focus-ring rounded-full border px-3 py-1.5 font-body text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                                isLightActive ? "border-accent bg-accent-subtle text-accent" : "hover:border-accent-hover hover:text-accent-hover"
                              }`}
                              style={{ borderColor: isLightActive ? "var(--color-accent)" : "var(--nav-border)" }}
                            >
                              Light
                            </button>
                            <button
                              type="button"
                              onClick={() => selectTheme(darkPreset.id)}
                              className={`focus-ring rounded-full border px-3 py-1.5 font-body text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                                isDarkActive ? "border-accent bg-accent-subtle text-accent" : "hover:border-accent-hover hover:text-accent-hover"
                              }`}
                              style={{ borderColor: isDarkActive ? "var(--color-accent)" : "var(--nav-border)" }}
                            >
                              Dark
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="focus-ring flex h-11 w-11 touch-manipulation items-center justify-center rounded-[0.9rem] border text-[1.05rem] transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              style={{
                WebkitTapHighlightColor: "transparent",
                borderColor: "var(--nav-border)",
                backgroundColor: "var(--nav-surface)",
              }}
            >
              {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div id="mobile-nav-menu" className="border-b lg:hidden" style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-background)" }}>
          <div className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6">
            <div className="mb-5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  open();
                }}
                className="focus-ring flex h-11 w-full items-center justify-center rounded-[0.9rem] border px-4 font-body text-[0.95rem] font-medium transition-colors duration-200 hover:border-accent-hover hover:text-accent-hover"
                style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-surface)" }}
              >
                Search
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-[0.9rem] px-4 py-3 font-body text-[0.95rem] font-medium transition-colors ${
                    isActivePath(link.href) ? "bg-accent-subtle text-accent" : "hover:bg-accent-subtle/70"
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
          style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-surface)" }}
          onMouseEnter={() => {
            if (activeMenu) {
              setActiveMenu(activeMenu);
            }
          }}
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-7 xl:grid-cols-[1.45fr_1fr]">
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:border-r xl:pr-8" style={{ borderColor: "var(--nav-border)" }}>
                <div>
                  <p className="font-heading text-3xl font-extrabold uppercase tracking-[0.01em]">
                    {currentMenu.leftTitle}
                  </p>
                  <div className="mt-4 space-y-3">
                    {currentMenu.leftItems.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="h-[56px] w-[104px] rounded-[0.32rem] object-cover" />
                        <span className="font-card text-base font-medium tracking-normal">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <Link href={currentMenu.viewAllHref} className="font-body text-sm font-medium uppercase tracking-[0.18em] underline decoration-2 underline-offset-4">
                    {currentMenu.viewAllLabel || "View All"}
                  </Link>
                  <div className="mt-4 space-y-3">
                    {currentMenu.featureItems.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="h-[56px] w-[104px] rounded-[0.32rem] object-cover" />
                        <span className="font-card text-base font-medium tracking-normal">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="font-heading text-3xl font-extrabold uppercase leading-[1.25] tracking-[0.01em]">
                  {currentMenu.rightTitle}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 2xl:grid-cols-3">
                  {currentMenu.tags.map((tag) => (
                    <Link key={`${tag.label}-${tag.href}`} href={tag.href} className="flex items-center gap-3 font-body text-xs font-medium uppercase tracking-wide">
                      <span className="h-3 w-3 rounded-[3px] bg-accent" />
                      <span>{tag.label}</span>
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
