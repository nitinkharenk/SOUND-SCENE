export function pluralize(
  count: number,
  singular: string,
  pluralForm = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatRuntime(runtime: number | string): string {
  if (typeof runtime === "number" && Number.isFinite(runtime)) {
    return minutesToRuntime(runtime);
  }

  const runtimeText = typeof runtime === "string" ? runtime : String(runtime);
  const normalized = runtimeText.trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  const hoursAndMinutes = normalized.match(/^(\d+)h\s*(\d{1,2})m$/);

  if (hoursAndMinutes) {
    const hours = Number.parseInt(hoursAndMinutes[1] ?? "0", 10);
    const minutes = Number.parseInt(hoursAndMinutes[2] ?? "0", 10);
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  const minutesOnly = normalized.match(/^(\d{1,3})m$/);

  if (minutesOnly) {
    return minutesToRuntime(Number.parseInt(minutesOnly[1] ?? "0", 10));
  }

  return runtimeText;
}

export function youtubeSearchUrl(title: string, artist: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} ${artist}`,
  )}`;
}

export function spotifySearchUrl(title: string, artist: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
}

export function parseTimestampToSeconds(value: string | null | undefined): number | null {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(":").map((part) => part.trim());

  if (parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  if (parts.length === 2) {
    const minutes = Number.parseInt(parts[0] ?? "0", 10);
    const seconds = Number.parseInt(parts[1] ?? "0", 10);

    if (seconds >= 60) {
      return null;
    }

    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const hours = Number.parseInt(parts[0] ?? "0", 10);
    const minutes = Number.parseInt(parts[1] ?? "0", 10);
    const seconds = Number.parseInt(parts[2] ?? "0", 10);

    if (minutes >= 60 || seconds >= 60) {
      return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

export function hasParseableTimestamp(value: string | null | undefined): boolean {
  return parseTimestampToSeconds(value) !== null;
}

export function formatSecondsAsTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function minutesToRuntime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
