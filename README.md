# SoundScene

A cinematic soundtrack discovery platform for finding songs used in movies and web series — with scene-level notes, timestamps, and editorial curation.

## Features

- **Smart Search** — Real-time search across movies, series, songs, and artists with filters and debounced input
- **Soundtrack Guides** — Scene-by-scene breakdowns with timestamps, moods, and direct links to YouTube/Spotify
- **Charts & Rankings** — Ranked entries across songs, movies, and series with filtering and pagination
- **Episode Maps** — Per-episode soundtrack listings for web series with season navigation
- **Dark / Light Mode** — Full theme toggle with warm off-white light mode and cinematic dark mode
- **Responsive Design** — Optimized layouts for mobile, tablet, and desktop

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com/) with CSS custom properties for theming
- **Animation** — [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/)
- **State** — [Zustand](https://zustand.docs.pmnd.rs/) for global search state
- **Typography** — Inter (body), Cabinet Grotesk (cards/UI), Syne (headings/display)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  layout.tsx          # Root layout with theme initialization
  globals.css         # Design tokens, theme variables, global styles
  page.tsx            # Homepage with discovery sections
  charts/             # Chart rankings page
  movies/             # Movie catalog + detail pages
  series/             # Series catalog + episode detail pages
  songs/              # Song catalog + detail pages

components/
  SearchBar.tsx       # Global search overlay with filters
  SearchResults.tsx   # Search results display
  nav-bar.tsx         # Navigation with mega menu + theme toggle
  home-discovery-sections.tsx  # Homepage trending, popular, latest sections
  soundtrack-list.tsx # Reusable soundtrack row component
  catalog-browse-controls.tsx  # Search/filter/sort controls for catalog pages
  route-heading.tsx   # Split heading + meta + tag list components
  site-footer.tsx     # Site footer

lib/
  catalog.ts          # Content data + search logic
  discovery.ts        # Homepage discovery data
  browse.ts           # URL builder + pagination helpers

store/
  useSearchStore.ts   # Zustand store for search state
```

## Design System

| Token              | Light         | Dark          |
|--------------------|---------------|---------------|
| Background         | `#F5F3EE`     | `#111010`     |
| Surface / Card     | `#FFFFFF`     | `#1A1918`     |
| Foreground         | `#1f1915`     | `#f5f5f5`     |
| Accent             | `#E84528`     | `#E84528`     |
| Border             | `#E8E6E1`     | `#2E2D2B`     |
| Muted Text         | `#6B6965`     | `#9A9895`     |

## License

ISC
