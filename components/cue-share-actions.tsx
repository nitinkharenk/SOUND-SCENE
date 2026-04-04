"use client";

import { useState } from "react";

type CueShareActionsProps = {
  contentTitle: string;
  contentSlug: string;
  contentType: "movie" | "series";
  songTitle: string;
  artist: string;
  timestamp: string | null;
  sceneDescription: string;
  year?: number;
};

export function CueShareActions({
  contentTitle,
  contentSlug,
  contentType,
  songTitle,
  artist,
  timestamp,
  sceneDescription,
  year,
}: CueShareActionsProps) {
  const [copied, setCopied] = useState<"scene" | "card" | null>(null);
  const timestampLabel = timestamp ?? "Timestamp unavailable";
  const shareCardUrl = `/api/og?title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(
    artist,
  )}&movie=${encodeURIComponent(contentTitle)}&timestamp=${encodeURIComponent(
    timestampLabel,
  )}&scene=${encodeURIComponent(sceneDescription)}&year=${encodeURIComponent(
    year ? String(year) : "",
  )}`;
  const detailUrl = `/${contentType === "movie" ? "movies" : "series"}/${contentSlug}`;

  async function copyText(value: string, kind: "scene" | "card") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <>
      <button
        type="button"
        className="focus-ring route-action md:min-w-[10.5rem]"
        onClick={() =>
          copyText(
            `${contentTitle}${year ? ` (${year})` : ""}\n"${songTitle}" — ${artist}\n${timestampLabel}\n${sceneDescription}\n${detailUrl}`,
            "scene",
          )
        }
      >
        {copied === "scene" ? "Copied" : "Copy Scene"}
      </button>
      <button
        type="button"
        className="focus-ring route-action md:min-w-[10.5rem]"
        onClick={() => {
          window.open(shareCardUrl, "_blank", "noopener,noreferrer");
          void copyText(`${window.location.origin}${shareCardUrl}`, "card");
        }}
      >
        {copied === "card" ? "Card URL Copied" : "Share Card"}
      </button>
    </>
  );
}
