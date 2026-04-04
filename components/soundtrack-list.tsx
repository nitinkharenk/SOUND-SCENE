import Link from "next/link";
import type { Song } from "@/lib/catalog-types";

export type SoundtrackListItem = {
  order: number;
  timestamp: string | null;
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
      {items.length === 0 ? (
        <div className={isBulletin ? "bulletin-card" : "py-5"}>
          <p className="route-kicker">No soundtrack cues yet</p>
          <p className="body-copy mt-3 max-w-2xl">
            This title is in the catalog, but we do not have mapped soundtrack moments for this section yet.
          </p>
        </div>
      ) : null}
      {items.map((item) => (
        <div
          key={`${item.song.slug}-${item.order}-${item.timestamp ?? "untimed"}`}
          className={
            isBulletin
              ? "bulletin-card"
              : "soundtrack-row grid gap-5 border-t border-black/10 py-5 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[72px_minmax(0,1fr)_max-content] md:items-start"
          }
        >
          {!isBulletin ? (
            <div className="hidden md:block font-heading text-4xl font-bold leading-none tracking-tight text-black/22">
              {String(item.order).padStart(2, "0")}
            </div>
          ) : null}

          <div className={isBulletin ? "space-y-4" : "space-y-4"}>
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
              {item.timestamp ? <span>{item.timestamp}</span> : null}
            </div>

            <div className="space-y-3">
              <div>
                <Link
                  href={`/songs/${item.song.slug}`}
                  className={`soundtrack-title story-link card-heading font-semibold leading-tight ${
                    isBulletin ? "text-[1.7rem]" : "text-[2rem]"
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
              <p className="body-copy max-w-3xl">{item.sceneDescription}</p>
            </div>
          </div>

          <div
            className={
              isBulletin
                ? "flex flex-wrap gap-2 pt-1"
                : "flex flex-wrap gap-2 md:grid md:w-max md:auto-rows-max md:justify-self-end md:self-start md:justify-items-stretch"
            }
          >
            <a
              href={item.song.youtubeLink}
              className="focus-ring route-action route-action-primary md:min-w-[10.5rem]"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
            <a
              href={item.song.spotifyLink}
              className="focus-ring route-action md:min-w-[10.5rem]"
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
