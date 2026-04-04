"use client";

import { useMemo, useState } from "react";
import {
  formatSecondsAsTimestamp,
  hasParseableTimestamp,
  parseTimestampToSeconds,
} from "@/lib/text";

type LookupCue = {
  timestamp: string | null;
  sceneDescription: string;
  sceneType?: string;
  episodeTitle?: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  song: {
    title: string;
    artist: string;
  };
};

type TimestampLookupProps = {
  contentTitle: string;
  items: LookupCue[];
};

export function TimestampLookup({ contentTitle, items }: TimestampLookupProps) {
  const [input, setInput] = useState("");
  const [submittedSeconds, setSubmittedSeconds] = useState<number | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const parseableItems = useMemo(
    () => items.filter((item) => hasParseableTimestamp(item.timestamp)),
    [items],
  );

  const result = useMemo(() => {
    if (submittedSeconds === null) {
      return null;
    }

    let closestCue: LookupCue | null = null;
    let closestDiff = Number.POSITIVE_INFINITY;

    for (const item of parseableItems) {
      const cueSeconds = parseTimestampToSeconds(item.timestamp);

      if (cueSeconds === null) {
        continue;
      }

      const diff = Math.abs(cueSeconds - submittedSeconds);

      if (diff < closestDiff) {
        closestDiff = diff;
        closestCue = item;
      }
    }

    if (!closestCue) {
      return null;
    }

    return {
      cue: closestCue,
      diff: closestDiff,
    };
  }, [parseableItems, submittedSeconds]);

  const hasRealTimestamps = parseableItems.length > 0;

  if (!hasRealTimestamps) {
    return null;
  }

  return (
    <section className="route-surface py-5">
      <p className="route-kicker">Scene timestamp lookup</p>
      <h3 className="font-heading mt-3 text-2xl font-extrabold uppercase tracking-[0.01em] text-black">
        What Song Is This?
      </h3>
      <p className="mt-3 max-w-2xl font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
        Heard something at a specific moment in {contentTitle}? Enter a rough timestamp and
        SoundScene will return the closest mapped cue.
      </p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setHasAttemptedSubmit(true);
          const parsed = parseTimestampToSeconds(input);

          if (parsed === null) {
            setSubmittedSeconds(null);
            setInputError("Enter a valid timestamp like 12:40 or 01:05:10.");
            return;
          }

          setInputError(null);
          setSubmittedSeconds(parsed);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            if (inputError) {
              setInputError(null);
            }
          }}
          placeholder="e.g. 45:20"
          className="focus-ring w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 font-body text-base text-[color:var(--foreground)] outline-none"
        />
        <button type="submit" className="route-action route-action-primary focus-ring">
          Find the song
        </button>
      </form>

      {inputError ? (
        <p className="mt-4 font-body text-sm text-[color:var(--muted)]">
          {inputError}
        </p>
      ) : null}

      {hasAttemptedSubmit && submittedSeconds !== null && !result ? (
        <p className="mt-4 font-body text-sm text-[color:var(--muted)]">
          No mapped cue was found close to that time. Try a nearby timestamp like{" "}
          <span className="text-accent">12:40</span> or{" "}
          <span className="text-accent">01:05:10</span>.
        </p>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-[0.9rem] border border-[color:var(--line)] bg-accent-subtle p-4">
          <p className="route-kicker">
            Closest match · {formatSecondsAsTimestamp(submittedSeconds ?? 0)}
          </p>
          <h4 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
            {result.cue.song.title}
          </h4>
          <p className="mt-2 font-card text-base font-medium text-black/74">
            {result.cue.song.artist}
          </p>
          <p className="mt-3 font-body text-sm font-normal text-black/62">
            {result.cue.timestamp ? result.cue.timestamp : "No timestamp"}
            {result.cue.sceneType ? ` · ${result.cue.sceneType}` : ""}
            {result.cue.episodeTitle
              ? ` · S${result.cue.seasonNumber}E${result.cue.episodeNumber} ${result.cue.episodeTitle}`
              : ""}
          </p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/68">
            {result.cue.sceneDescription}
          </p>
          {result.diff > 0 ? (
            <p className="mt-3 font-body text-sm font-normal text-black/58">
              This cue is about {result.diff} seconds away from your timestamp.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
