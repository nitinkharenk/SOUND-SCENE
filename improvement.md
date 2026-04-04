# SoundScene — Improvements Report

> Improvements to existing features, pages, and UX patterns that are already present but need refinement.

---

## IMP-01 · Homepage hero — search bar is non-functional feedback

**Page:** `/`  
**Priority:** High

**Current state:**  
The search bar is the dominant hero element but shows no feedback when used — no dropdown, no results, no loading state. Users who type something and press Enter get no response, making the hero feel broken rather than interactive.

**Improvement:**  
Add a live search dropdown that appears after 2+ characters:

```tsx
// Debounced search with category results
const [query, setQuery] = useState('');
const [results, setResults] = useState<SearchResult[]>([]);

// Show grouped results: Movies · Songs · Series
// Each result links directly to its detail page
// "Press Enter to see all results for X" at the bottom
```

At minimum, pressing Enter should navigate to `/songs?q=query` or a `/search?q=query` page.

---

## IMP-02 · Movie/Series detail — Scene Filter buttons do nothing

**Page:** `/movies/[slug]`, `/series/[slug]`  
**Priority:** High

**Current state:**  
Each movie detail page has "Scene Filters" buttons: Opening · Montage · Club · Reveal · Finale · Breakup. These appear to be clickable but don't filter the cue list below them.

**Improvement:**  
Wire the filter buttons to filter the visible cue list:

```tsx
const [activeFilter, setActiveFilter] = useState<string | null>(null);

const filteredCues = activeFilter
  ? cues.filter(cue => cue.sceneType === activeFilter)
  : cues;
```

Add an active state style to the pressed button and a "Clear filter" affordance.

---

## IMP-03 · Song cards — all showing the same Unsplash image

**Page:** `/songs`, `/songs/[slug]` related section, homepage  
**Priority:** High

**Current state:**  
The majority of song cards use the exact same image (`photo-1485846234645-a62644f84728` — the clapperboard). On the songs listing page the first 3 cards are visually identical, killing any scan-ability.

**Improvement:**  
Even before real images are available, cycle through a small set of distinct placeholder images per genre/category:

```ts
const GENRE_IMAGES: Record<string, string> = {
  'Ambient': 'photo-1518998053901-5348d3961a04',
  'Dream Pop': 'photo-1511671782779-c97d3d27a1d4',
  'Alt Pop': 'photo-1517604931442-7e0c8ed2963c',
  'Synthwave': 'photo-1536440136628-849c177e76a1',
  'Electronic': 'photo-1470225620780-dba8ba36b745',
  'default': 'photo-1485846234645-a62644f84728',
};

const getImage = (genre: string) =>
  GENRE_IMAGES[genre] ?? GENRE_IMAGES['default'];
```

---

## IMP-04 · Listing pages — filter state not preserved on back navigation

**Page:** `/movies`, `/songs`, `/series`, `/charts`  
**Priority:** Medium

**Current state:**  
If a user sets genre to "Thriller" + year to "2024" on `/movies`, navigates to a movie detail, then hits Back — all filters are reset. Users must re-apply filters every time.

**Improvement:**  
Persist filter state in URL search params so the browser's back/forward and shareable URLs work:

```tsx
// Read from URL
const searchParams = useSearchParams();
const genre = searchParams.get('genre') ?? 'all';

// Write to URL on filter change
const router = useRouter();
router.push(`/movies?genre=${genre}&year=${year}&sort=${sort}`);
```

This also makes filtered views bookmarkable and shareable.

---

## IMP-05 · Listing pages — "Load more" and pagination coexist awkwardly

**Page:** Homepage (Load more), `/movies` (pagination)  
**Priority:** Medium

**Current state:**  
The homepage uses "Load more" buttons at the bottom of movie/episode sections. The full listing pages use numbered pagination. This mixed pattern is fine, but the "Load more" on homepage doesn't show how many items remain.

**Improvement:**  
Add a count to Load more buttons:

```tsx
<button>Load more ({remaining} more movies)</button>
```

---

## IMP-06 · Charts page — rank numbers not visually distinct enough

**Page:** `/charts`  
**Priority:** Medium

**Current state:**  
Rank numbers (01, 02, 03...) appear as plain text to the left of each card. On dark mode they're hard to distinguish from the card content at a glance.

**Improvement:**  
Make rank numbers a visual anchor, not just text:

```tsx
<div className="text-4xl font-black tabular-nums text-[#ff4925]/20 dark:text-[#ff4925]/15 w-12 shrink-0 leading-none">
  {String(rank).padStart(2, '0')}
</div>
```

Large, low-opacity rank numbers behind the title (like Billboard or Spotify charts layout) create instant scannability.

---

## IMP-07 · Song detail — genre tag links nowhere

**Page:** `/songs/[slug]`  
**Priority:** Medium

**Current state:**  
Genre tags (Ambient, Dream Pop etc.) on song detail pages are rendered as static badges. Clicking them does nothing.

**Improvement:**  
Make genre tags navigation links:

```tsx
<Link href={`/songs?category=${song.category}`}>
  <span className="tag">{song.category}</span>
</Link>
```

Same applies to genre tags on movie and series detail pages.

---

## IMP-08 · Series detail — Series-Wide Playlist duplicates episode cues

**Page:** `/series/[slug]`  
**Priority:** Medium

**Current state:**  
The "Series-Wide Playlist" section at the bottom of a series page lists exactly the same cues already shown in the Season Map section above. On Violet District, each of the 3 cues appears twice on the same page.

**Improvement:**  
Either remove the Series-Wide Playlist section (the Season Map already covers it), or differentiate it by showing only the song without the scene context — a compact music-only view vs the detailed scene-mapped view above.

---

## IMP-09 · Dark mode toggle — no persistence across sessions

**Page:** All pages  
**Priority:** Medium

**Current state:**  
The dark/light mode toggle works per-session but likely resets on page reload (depends on implementation). If using only React state with no localStorage persistence, users see a flash of the wrong theme on load.

**Improvement:**  
```tsx
// In layout.tsx — prevents FOUC (Flash of Unstyled Content)
<script dangerouslySetInnerHTML={{
  __html: `
    const theme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  `
}} />
```

Persist the preference:
```tsx
const toggleTheme = () => {
  const next = theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  localStorage.setItem('theme', next);
  document.documentElement.setAttribute('data-theme', next);
};
```

---

## IMP-10 · Movie detail — "More Movies" section shows dummy entries

**Page:** `/movies/[slug]`  
**Priority:** Low (testing stage)

**Current state:**  
The "More Movies" section always shows the same 4 movies: Static Hearts, Afterlight Casino, Electric Frequency 055, Electric Frequency 111 — regardless of which movie you're viewing.

**Improvement (before launch):**  
Personalise the "More Movies" section by genre/year match, and exclude the currently-viewed movie:

```ts
const related = allMovies
  .filter(m => m.slug !== currentSlug && m.genres.some(g => currentMovie.genres.includes(g)))
  .slice(0, 4);
```

---

## IMP-11 · Homepage "New Releases" section — Movie/TV Shows/Songs tabs

**Page:** `/`  
**Priority:** Low

**Current state:**  
The "Popular This Week" and "Latest Releases" sections have Movies/TV Shows/Songs tab switchers. Visually fine, but if "TV Shows" and "Songs" tabs show no content or error, it feels broken.

**Improvement:**  
Show a count badge on each tab so users know what's available before clicking:

```tsx
<button>Movies <span className="badge">10</span></button>
<button>TV Shows <span className="badge">6</span></button>
<button>Songs <span className="badge">12</span></button>
```

---

## IMP-12 · All listing pages — no empty state UI

**Page:** `/movies`, `/songs`, `/series`, `/charts`  
**Priority:** Low

**Current state:**  
If a user applies filters that return 0 results (e.g. Genre: Noir + Year: 2020), there's likely no empty state message — the list just disappears.

**Improvement:**  
```tsx
{results.length === 0 && (
  <div className="col-span-full py-20 text-center">
    <p className="text-lg font-medium">No results found</p>
    <p className="text-muted mt-1">Try adjusting your filters</p>
    <button onClick={clearFilters} className="mt-4 btn-outline">
      Clear all filters
    </button>
  </div>
)}
```

---

## IMP-13 · SEO — missing Open Graph and Twitter meta tags

**Page:** All pages  
**Priority:** High (before any public sharing)

**Current state:**  
Only `<title>` is set. No `og:title`, `og:description`, `og:image`, `og:type`, `twitter:card`.

**Improvement:**  
In `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: 'SoundScene | Movie & Series Soundtrack Finder',
  description: 'Discover songs used in movies and web series with scene-level notes, timestamps, and editorial curation.',
  openGraph: {
    title: 'SoundScene',
    description: 'Find every song in your favourite movies and series.',
    url: 'https://sound-scene.vercel.app',
    siteName: 'SoundScene',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoundScene',
    description: 'Find every song in your favourite movies and series.',
    images: ['/og-image.png'],
  },
};
```

For dynamic pages, generate per-page metadata:
```tsx
// app/movies/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const movie = await getMovie(params.slug);
  return {
    title: `${movie.title} Soundtrack | SoundScene`,
    description: movie.description,
    openGraph: { images: [{ url: movie.image }] },
  };
}
```

---

*Total improvements: 13 · High: 3 · Medium: 6 · Low: 4*
