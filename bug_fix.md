# SoundScene — Bug Fix Report

> Audited routes: `/`, `/movies`, `/songs`, `/series`, `/charts`, `/series/episodes`, `/movies/static-hearts`, `/movies/neon-skyline`, `/songs/blue-room-frequency`, `/series/violet-district`
> Modes tested: Light + Dark (via rendered HTML + visual screenshots context)

---

## BUG-01 · Page `<h1>` text concatenation — ALL detail pages

**Severity:** Critical  
**Affects:** `/songs/[slug]`, `/movies/[slug]`, `/series/[slug]`

**Problem:**  
The page title and the type label are being merged into the `<h1>` with no separator or space:
- Song page renders: `"Blue Room FrequencyTrack"` instead of `"Blue Room Frequency"`
- Movie page renders: `"Static HeartsSoundtrack"` instead of `"Static Hearts"`
- Series page renders: `"Violet DistrictEpisodes"` instead of `"Violet District"`

**Root cause:**  
The eyebrow/subtitle label (e.g. "Track", "Soundtrack", "Episodes") is being placed as a sibling text node directly inside or adjacent to the `<h1>` without a wrapping element or separator, causing concatenation in the DOM text content.

**Fix:**  
Wrap the subtitle label in its own element and move it outside the `<h1>`:

```tsx
// Before (broken)
<h1>{title}Soundtrack</h1>

// After (correct)
<p className="text-xs uppercase tracking-widest text-[#ff4925] mb-2">Movie soundtrack guide</p>
<h1>{title}</h1>
```

---

## BUG-02 · Section heading whitespace collapse — ALL detail pages

**Severity:** Critical  
**Affects:** `/songs/[slug]`, `/movies/[slug]`, `/series/[slug]`

**Problem:**  
Multi-word section headings lose the space between lines and collapse into one word:
- `"Where ItHits"` instead of `"Where It Hits"`
- `"KeepListening"` instead of `"Keep Listening"`
- `"MappedScene Cues"` instead of `"Mapped Scene Cues"`
- `"SeasonMap"` instead of `"Season Map"`
- `"Series-WidePlaylist"` instead of `"Series-Wide Playlist"`
- `"MoreMovies"` instead of `"More Movies"`
- `"SceneFilters"` instead of `"Scene Filters"`
- `"Jump ToSeasons"` instead of `"Jump To Seasons"`

**Root cause:**  
The heading is split across two elements (likely a `<span>` or `<br>` per word or line), and the gap between them is being collapsed. Likely a `flex` or `block` display issue stripping whitespace between inline elements.

**Fix:**  
Either keep headings as a single string, or ensure a space character is present between split elements:

```tsx
// Option A — single string (simplest)
<h2>Mapped Scene Cues</h2>

// Option B — if split intentionally for color styling
<h2>
  <span>Mapped </span>
  <span className="text-[#ff4925]">Scene Cues</span>
</h2>
```

---

## BUG-03 · "1 appearances" — pluralization error

**Severity:** High  
**Affects:** `/songs`, `/songs/[slug]`, `/series/episodes`, homepage trending section

**Problem:**  
Every song with a single appearance shows `"1 appearances"` instead of `"1 appearance"`. Grammatically incorrect and visible on every single song card.

**Fix:**  
```tsx
// Utility function
const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

// Usage
<span>{pluralize(song.appearances, 'appearance')}</span>

// Also fix in episodes:
<span>{pluralize(episode.cues, 'soundtrack cue')}</span>
```

---

## BUG-04 · "1 cues" — same pluralization error

**Severity:** High  
**Affects:** `/series/[slug]` episode breakdown, `/series/episodes`

**Problem:**  
`"1 cuesBrick by Brick"` — two issues: singular "cues" instead of "cue", AND the cue count and lead song title are jammed together with no space or separator.

**Fix:**  
```tsx
<span>{pluralize(episode.cues, 'cue')}</span>
<span className="text-muted"> · Lead song: {episode.leadSong}</span>
```

---

## BUG-05 · Nav active state always shows "New Releases"

**Severity:** High  
**Affects:** All pages — `/charts`, `/songs`, `/movies`, `/series`

**Problem:**  
"New Releases" has a red underline active indicator on every page regardless of the current route. None of the other nav items ever show an active state.

**Fix:**  
```tsx
// In your nav component
const pathname = usePathname();

const navLinks = [
  { href: '/', label: 'New Releases' },
  { href: '/charts', label: 'Charts' },
  { href: '/songs', label: 'Songs' },
  { href: '/movies', label: 'Movies' },
  { href: '/series', label: 'Series' },
];

// Active check
const isActive = (href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

// Apply
<Link
  className={isActive(link.href) ? 'border-b-2 border-[#ff4925]' : ''}
>
```

---

## BUG-06 · Movie detail page — duration format inconsistency

**Severity:** Medium  
**Affects:** `/movies/[slug]` detail pages, movie cards

**Problem:**  
Duration is displayed in two different formats across the site:
- `"2h 15m"` on Static Hearts detail page
- `"116m"` on dummy movie cards
- `"2h 08m"` on Neon Skyline detail page

**Fix:**  
Normalize all durations at the data layer:

```ts
// Utility
const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
```

---

## BUG-07 · `/series/episodes` — no pagination

**Severity:** Medium  
**Affects:** `/series/episodes`

**Problem:**  
The episodes page loads all 105 episodes at once with no pagination, no "Load more", and no page controls — despite every other listing page (songs, movies, series, charts) having pagination. At 105 items this causes a very long page with no navigation affordance.

**Fix:**  
Add the same pagination pattern used on `/movies` and `/songs`. Either SSR-based `?page=N` or a client-side "Load more" button. Recommended page size: 12 or 24 items.

---

## BUG-08 · Footer "Smart Search" links to homepage `/`

**Severity:** Medium  
**Affects:** Footer — all pages

**Problem:**  
The footer has a "Smart Search" link under the Browse section that resolves to `/` (the homepage), not to a search page. This creates a dead/misleading link.

**Fix (Option A — feature not yet built):**
```tsx
<span className="text-muted cursor-not-allowed opacity-50">
  Smart Search <span className="text-xs">(coming soon)</span>
</span>
```

**Fix (Option B — wire to search):**  
Point it to `/search` or make the homepage search bar focusable via a hash: `href="/#search"`.

---

## BUG-09 · Pagination — missing middle pages

**Severity:** Medium  
**Affects:** `/movies`, `/songs`, `/charts`

**Problem:**  
Pagination shows only: `Previous · 1 · 2 · [last page] · Next`  
No middle pages are shown at all. On songs (56 pages) and charts (73 pages) this means you can jump directly to page 2 or the final page only — no way to navigate to page 10, 20, etc.

**Fix:**  
Standard windowed pagination pattern:

```tsx
// Show: 1 · 2 · 3 · ... · 27 · 28 · 29 · ... · 56
const getPageRange = (current: number, total: number) => {
  const delta = 2;
  const range: (number | '...')[] = [];
  
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }
  return range;
};
```

---

## BUG-10 · Series detail — "1 seasons" pluralization

**Severity:** Low  
**Affects:** `/series/[slug]`

**Problem:**  
Series pages show `"1 seasons"` in the metadata strip instead of `"1 season"`. Same root cause as BUG-03.

**Fix:**  
Apply the same `pluralize()` utility from BUG-03 fix to the seasons count.

---

## BUG-11 · YouTube links are placeholder rickroll URLs

**Severity:** Low (testing stage)  
**Affects:** All song cue entries on movie/series detail pages, song detail pages

**Problem:**  
Every YouTube button links to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`. Fine for testing, but worth tracking.

**Fix (before going live):**  
Replace with real YouTube search links as a fallback if no direct link exists:
```ts
const youtubeSearchUrl = (title: string, artist: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`;
```

---

## BUG-12 · Spotify links go to homepage, not track/search

**Severity:** Low (testing stage)  
**Affects:** All song cue entries

**Problem:**  
Every Spotify button links to `https://open.spotify.com/` with no track context.

**Fix (before going live):**  
```ts
const spotifySearchUrl = (title: string, artist: string) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
```

---

## BUG-13 · Footer — "Web Series" vs "Series" label mismatch

**Severity:** Low  
**Affects:** Footer, all pages

**Problem:**  
Top navigation uses "Series". Footer Browse section uses "Web Series". Inconsistent labelling for the same route (`/series`).

**Fix:**  
Pick one label and use it everywhere. Recommended: **"Series"** (shorter, matches nav).

---

## BUG-14 · Footer missing "Charts" and "Songs" links

**Severity:** Low  
**Affects:** Footer, all pages

**Problem:**  
Footer only links to: Home, Smart Search, Web Series, Movies, Episodes.  
Missing: Charts, Songs — both of which are primary navigation items.

**Fix:**  
Add to footer nav:
```tsx
<Link href="/charts">Charts</Link>
<Link href="/songs">Songs</Link>
```

---

*Total bugs found: 14 · Critical: 2 · High: 3 · Medium: 4 · Low: 5*
