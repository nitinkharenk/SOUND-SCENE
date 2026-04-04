import Link from "next/link";
import { getSceneLibrary } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

export default async function AdminCuesPage() {
  const cues = await getSceneLibrary();

  return (
    <section className="route-surface py-5">
      <p className="route-kicker">Admin cues</p>
      <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[0.01em] text-black">
        Scene Mappings
      </h2>
      <p className="mt-3 font-body text-base text-[color:var(--muted)]">
        {pluralize(cues.length, "mapped cue")} across movies and series episodes.
      </p>
      <div className="mt-6 space-y-3">
        {cues.slice(0, 50).map((cue) => (
          <Link
            key={`${cue.contentSlug}-${cue.timestamp ?? "untimed"}-${cue.song.slug}`}
            href={`/${cue.contentType === "movie" ? "movies" : "series"}/${cue.contentSlug}`}
            className="route-row-link grid-cols-[1fr]"
          >
            <div>
              <p className="route-kicker text-[0.72rem]">
                {cue.contentTitle}
                {cue.timestamp ? ` · ${cue.timestamp}` : ""}
              </p>
              <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                {cue.song.title}
              </h3>
              <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
                {cue.song.artist} · {cue.sceneType ?? "Episode scene"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
