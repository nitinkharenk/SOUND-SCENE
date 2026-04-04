# SoundScene — New Feature Suggestions

> All features below assume admin-only content management (no user login/signup).
> Visitors are read-only. Admin uploads songs, movies, series, and all metadata.

---

## FEAT-01 · Admin Dashboard (Protected Route)

**Type:** Core infrastructure  
**Effort:** High  
**Impact:** Critical — enables all other content management

**Description:**  
A password-protected admin panel at `/admin` (or behind middleware) where you as the sole admin can manage all content without touching the database directly.

**Suggested pages:**
- `/admin` — overview: counts, recently added, quick-add shortcuts
- `/admin/movies` — add / edit / delete movies with full metadata
- `/admin/songs` — add / edit / delete songs, assign appearances
- `/admin/series` — add / edit / delete series + episodes
- `/admin/cues` — map songs to specific timestamps in movies/episodes

**Auth approach (simple, no user system needed):**
```ts
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (token?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

A single secret password stored in env — no auth library, no database users table needed.

---

## FEAT-02 · Full-text Search Page (`/search`)

**Type:** Discovery  
**Effort:** Medium  
**Impact:** High

**Description:**  
A dedicated search results page that queries across all content types simultaneously — movies, series, songs, and artists.

**Features:**
- URL-based: `/search?q=blue+room` (shareable, SEO-friendly)
- Results grouped by type: Movies · Series · Songs · Artists
- Highlighted matching text in results
- "Did you mean X?" fuzzy suggestions
- Empty state with editorial suggestions

**Implementation:**
```ts
// Using PostgreSQL full-text search (if using pg)
const results = await db.query(`
  SELECT 'movie' as type, title, slug, image FROM movies
  WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery($1)
  UNION ALL
  SELECT 'song' as type, title, slug, image FROM songs
  WHERE to_tsvector('english', title || ' ' || artist) @@ plainto_tsquery($1)
  LIMIT 20
`, [query]);
```

---

## FEAT-03 · "What Song Is This?" Scene Timestamp Lookup

**Type:** Unique feature / core value prop  
**Effort:** Medium  
**Impact:** Very High

**Description:**  
Users often know a movie and roughly when a song played ("around the 45-minute mark of Neon Skyline") but not the song name. Add a timestamp lookup tool on movie/series detail pages.

**UI:**
- A time scrubber or manual timestamp input on each movie page
- Returns the closest mapped cue to that timestamp
- Shows song name, artist, and the scene description

```tsx
// On movie detail page
<div className="timestamp-lookup">
  <p>Heard something at a specific moment?</p>
  <input type="text" placeholder="e.g. 45:20" />
  <button>Find the song</button>
</div>

// Returns nearest cue:
// "At 45:20 — City in a Loop by Analog Hearts (Opening scene)"
```

This is SoundScene's most differentiated feature vs. just listing soundtracks.

---

## FEAT-04 · Artist Profile Pages (`/artists/[slug]`)

**Type:** Discovery  
**Effort:** Medium  
**Impact:** High

**Description:**  
Each artist (June Arcade, Paper Satellites, etc.) gets their own page showing all their soundtrack appearances across movies and series.

**Page structure:**
```
/artists/june-arcade

June Arcade
Featured in 3 soundtracks

Songs:
- Blue Room Frequency (Static Hearts, 2026)
- Mirror Fade (Neon Skyline, 2025)

Appears in:
- Static Hearts (Movie, 2026)
- Neon Skyline (Movie, 2025)
```

**Why this adds value:**  
Fans of a specific artist can see all their film/TV work in one place. Helps with SEO too — "June Arcade soundtrack appearances" is a real search people do.

---

## FEAT-05 · Genre/Mood Discovery Pages (`/discover/[genre]`)

**Type:** Editorial / Discovery  
**Effort:** Low-Medium  
**Impact:** Medium-High

**Description:**  
Curated landing pages per genre/mood that act as editorial hubs — not just a filtered list but a proper page with a description, featured soundtrack, and top songs of that genre.

**Examples:**
- `/discover/synthwave` — "The neon-soaked, retro-futuristic soundscapes of modern cinema"
- `/discover/ambient` — "Slow-burn atmospheric tracks that define a scene's mood"
- `/discover/dream-pop` — "Shimmering, melancholic songs for the film's emotional peaks"

**Structure:**
```tsx
// Static or ISR-generated per genre
// Admin sets: genre description, featured movie, featured song
// System auto-pulls: top songs, top movies in that genre
```

---

## FEAT-06 · "Copy Scene Description" & Share Card

**Type:** Sharing / Engagement  
**Effort:** Low  
**Impact:** Medium

**Description:**  
On each song cue entry (e.g. "Maya passes Noah a handwritten playlist through the studio glass..."), add a share button that generates a shareable card — great for Twitter/Instagram.

**Share card format:**
```
┌─────────────────────────────────┐
│ 🎬 Static Hearts (2026)         │
│                                 │
│ "Blue Room Frequency"           │
│  June Arcade                    │
│                                 │
│ 00:22:30 · Meet-cute scene      │
│ "Maya passes Noah a handwritten │
│  playlist through the studio    │
│  glass while the city loses     │
│  power."                        │
│                                 │
│ soundscene.vercel.app           │
└─────────────────────────────────┘
```

Use the Vercel OG image generation API to create dynamic share cards:
```ts
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const movie = searchParams.get('movie');
  // ... render the card
}
```

---

## FEAT-07 · Weekly Editorial Newsletter / RSS Feed

**Type:** Content / Retention  
**Effort:** Low  
**Impact:** Medium

**Description:**  
Since there's no user account system, offer a simple RSS feed or email newsletter for "This Week's Trending Soundtracks." Visitors who love the site can subscribe without needing an account.

**Implementation:**
- RSS feed at `/feed.xml` — standard Next.js route handler, generates XML from latest releases
- Optional: Integrate with Resend or Buttondown for email — single opt-in, no user database

```ts
// app/feed.xml/route.ts
export async function GET() {
  const releases = await getLatestReleases();
  const xml = generateRSS(releases);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

---

## FEAT-08 · "Scene Type" Taxonomy + Browse by Scene

**Type:** Discovery / Navigation  
**Effort:** Medium  
**Impact:** Medium-High

**Description:**  
SoundScene already tags some scenes (Opening, Montage, Club, Reveal, Finale, Breakup). Build this out into a browsable taxonomy — let visitors discover soundtracks by scene type across all content.

**New browse page:**
```
/scenes/opening    — "First-impression songs that define a film's tone"
/scenes/breakup    — "Heartbreak soundtracks across cinema"
/scenes/montage    — "Driving, building, transformative sequences"
/scenes/finale     — "Climactic songs that close the story"
```

This is a very unique content angle no other platform offers.

---

## FEAT-09 · Keyboard Shortcut Navigation

**Type:** Power-user UX  
**Effort:** Low  
**Impact:** Low-Medium

**Description:**  
For a cinephile/music-nerd audience, keyboard shortcuts add personality and power:

```
/ — Focus search bar
G M — Go to Movies
G S — Go to Songs
G C — Go to Charts
D — Toggle dark mode
? — Show shortcuts panel
```

Implementation using a simple hook:
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('search')?.focus();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

Show a small `⌨ Shortcuts` hint in the footer.

---

## FEAT-10 · Custom 404 Page

**Type:** Polish / UX  
**Effort:** Very Low  
**Impact:** Medium

**Description:**  
Replace the default Next.js/Vercel 404 with a branded SoundScene 404 page that keeps users engaged.

```
app/not-found.tsx

┌──────────────────────────────────┐
│  404 — Track Not Found           │
│                                  │
│  The soundtrack you're looking   │
│  for might have been removed or  │
│  never made it to our catalog.   │
│                                  │
│  [Search SoundScene]             │
│  [Browse Movies]  [Browse Songs] │
└──────────────────────────────────┘
```

---

## FEAT-11 · "Heard In" Breadcrumb on Song Pages

**Type:** Navigation / Context  
**Effort:** Low  
**Impact:** Medium

**Description:**  
Song detail pages currently show the movie/scene at the bottom. Add a prominent "Heard in" section near the top — before the streaming links — so users who land on a song page from Google immediately understand the context.

```
Blue Room Frequency
June Arcade

✦ Heard in Static Hearts (2026) — Scene: Meet-cute, 00:22:30
✦ Ambient · Warm lo-fi soul

[Watch on YouTube]  [Open Spotify]
```

---

## FEAT-12 · Sitemap & Robots.txt Generation

**Type:** SEO infrastructure  
**Effort:** Very Low  
**Impact:** High (SEO)

**Description:**  
With 153 movies, 666 songs, 52 series, each with their own detail pages, automated sitemap generation is essential for Google indexing.

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const movies = await getAllMovies();
  const songs = await getAllSongs();
  const series = await getAllSeries();

  return [
    { url: 'https://sound-scene.vercel.app', priority: 1 },
    { url: 'https://sound-scene.vercel.app/movies', priority: 0.9 },
    ...movies.map(m => ({
      url: `https://sound-scene.vercel.app/movies/${m.slug}`,
      lastModified: m.updatedAt,
      priority: 0.8,
    })),
    ...songs.map(s => ({
      url: `https://sound-scene.vercel.app/songs/${s.slug}`,
      priority: 0.7,
    })),
  ];
}
```

Also add `app/robots.ts` to allow crawling and point to the sitemap.

---

*Total suggestions: 12*
*Quick wins (Low effort, High impact): FEAT-10, FEAT-12, FEAT-06*
*Highest impact overall: FEAT-01 (Admin Dashboard), FEAT-02 (Search), FEAT-03 (Timestamp Lookup)*
