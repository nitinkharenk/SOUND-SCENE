import Link from "next/link";
import type { Song } from "@/lib/catalog";

export type SoundtrackListItem = {
  order: number;
  timestamp: string;
  sceneDescription: string;
  song: Song;
  sceneType?: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string;
};

type SoundtrackListProps = {
  items: SoundtrackListItem[];
  showEpisode?: boolean;
  variant?: "default" | "bulletin";
};

export function SoundtrackList({
  items,
  showEpisode = false,
  variant = "default",
}: SoundtrackListProps) {
  const isBulletin = variant === "bulletin";

  return (
    <div className={isBulletin ? "bulletin-list" : "route-surface"}>
      {items.map((item) => (
        <div
          key={`${item.song.slug}-${item.timestamp}`}
          className={
            isBulletin
              ? "bulletin-card"
              : "soundtrack-row grid gap-5 border-t border-black/10 py-5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]"
          }
        >
          <div className={isBulletin ? "space-y-4" : "space-y-3"}>
            <div
              className={
                isBulletin
                  ? "bulletin-meta"
                  : "flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs font-medium uppercase tracking-[0.16em] text-black/42"
              }
            >
              {isBulletin ? (
                <span className="bulletin-index">{item.order}</span>
              ) : (
                <span>#{item.order}</span>
              )}
              <span>
                {showEpisode
                  ? `S${item.seasonNumber} E${item.episodeNumber}`
                  : item.sceneType}
              </span>
              <span>{item.timestamp}</span>
            </div>
            <div className="space-y-3">
              <div>
                <Link
                  href={`/songs/${item.song.slug}`}
                  className={`soundtrack-title story-link card-heading font-semibold leading-tight ${
                    isBulletin ? "text-[1.7rem]" : "text-2xl"
                  }`}
                >
                  {item.song.title}
                </Link>
                <p className="mt-1 font-card text-base font-medium text-[#4f856d]">
                  {item.song.artist}
                </p>
              </div>
              {showEpisode && item.episodeTitle ? (
                <p className={isBulletin ? "bulletin-note" : "font-body text-sm font-normal text-black/72"}>
                  {item.episodeTitle}
                </p>
              ) : null}
              <p className="body-copy max-w-3xl">
                {item.sceneDescription}
              </p>
            </div>
          </div>

          <div className={isBulletin ? "flex flex-wrap gap-2 pt-1" : "flex flex-wrap gap-2 sm:self-start sm:justify-end"}>
            <a
              href={item.song.youtubeLink}
              className="focus-ring route-action route-action-primary"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
            <a
              href={item.song.spotifyLink}
              className="focus-ring route-action"
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
