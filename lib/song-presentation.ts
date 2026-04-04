export const SONG_CATEGORY_MAP: Record<string, string> = {
  Soundtrack: "Soundtrack",
  Pop: "Pop",
  Alternative: "Alt Pop",
  Rock: "Rock",
  Instrumental: "Ambient",
  Electronic: "Electronic",
  "TV Soundtrack": "Soundtrack",
  Ambient: "Ambient",
  "Dream Pop": "Dream Pop",
  "Alt Pop": "Alt Pop",
  Synthwave: "Synthwave",
};

export const SONG_CATEGORY_IMAGES: Record<string, string> = {
  Ambient:
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
  "Dream Pop":
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
  "Alt Pop":
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
  Synthwave:
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
  Electronic:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
  Pop:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
  Rock:
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  Soundtrack:
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
};

export function getSongCategory(mood?: string): string {
  if (!mood) {
    return "Soundtrack";
  }

  return SONG_CATEGORY_MAP[mood] ?? mood;
}

export function getSongPlaceholderImage(categoryOrMood?: string): string {
  const category = getSongCategory(categoryOrMood);
  return SONG_CATEGORY_IMAGES[category] ?? SONG_CATEGORY_IMAGES.default;
}

export function resolveSongArtwork({
  artwork,
  category,
  mood,
}: {
  artwork?: string | null;
  category?: string;
  mood?: string;
}): string {
  const trimmedArtwork = artwork?.trim();

  if (trimmedArtwork) {
    return trimmedArtwork;
  }

  return getSongPlaceholderImage(category ?? mood);
}
