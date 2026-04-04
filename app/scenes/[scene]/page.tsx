import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getSceneCollectionData, getSceneCollectionSlugs } from "@/lib/feature-data";
import { pluralize } from "@/lib/text";

type ScenePageProps = {
  params: Promise<{
    scene: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const scenes = await getSceneCollectionSlugs();
    return scenes.map((scene: string) => ({ scene }));
  } catch {
    return [];
  }
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { scene } = await params;
  const page = await getSceneCollectionData(scene);

  if (!page) {
    notFound();
  }

  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Scene taxonomy"
            leadTitle={page.name}
            outlineTitle="Moments"
            mode="detail"
            description={page.description}
          />
          <RouteMeta
            items={[
              pluralize(page.cues.length, "cue"),
              pluralize(page.titles.length, "title"),
              "Scene-type discovery",
            ]}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="route-surface py-5">
          <p className="route-kicker">Scene cues</p>
          <div className="mt-4 space-y-3">
            {page.cues.slice(0, 16).map((cue) => (
              <Link
                key={`${cue.contentSlug}-${cue.timestamp ?? "untimed"}-${cue.song.slug}`}
                href={`/${cue.contentType === "movie" ? "movies" : "series"}/${cue.contentSlug}`}
                className="route-row-link grid-cols-[1fr]"
              >
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {cue.contentTitle}
                    {cue.timestamp ? ` · ${cue.timestamp}` : ""}
                    {cue.episodeTitle ? ` · ${cue.episodeTitle}` : ""}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {cue.song.title}
                  </h2>
                  <p className="mt-2 font-card text-base font-medium text-black/74">
                    {cue.song.artist}
                  </p>
                  <p className="mt-3 font-body text-base leading-relaxed text-[color:var(--muted)]">
                    {cue.sceneDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="route-surface py-5">
          <p className="route-kicker">Related titles</p>
          <div className="mt-4 space-y-3">
            {page.titles.slice(0, 12).map((title) => (
              <Link
                key={title.slug}
                href={`/${title.type === "movie" ? "movies" : "series"}/${title.slug}`}
                className="route-row-link grid-cols-[1fr]"
              >
                <div>
                  <p className="route-kicker text-[0.72rem]">
                    {title.type === "movie" ? "Movie" : "Series"} · {title.year}
                  </p>
                  <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                    {title.title}
                  </h2>
                  <p className="mt-3 font-body text-base leading-relaxed text-[color:var(--muted)]">
                    {title.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
