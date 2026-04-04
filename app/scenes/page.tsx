export const dynamic = "force-dynamic";

import Link from "next/link";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { getSceneCollectionData, getSceneCollectionSlugs } from "@/lib/feature-data";
import { pluralize } from "@/lib/text";

export default async function SceneIndexPage() {
  const slugs = await getSceneCollectionSlugs();
  const scenes = (
    await Promise.all(slugs.map((slug) => getSceneCollectionData(slug)))
  ).filter((scene): scene is NonNullable<typeof scene> => Boolean(scene));

  return (
    <div className="route-shell">
      <section className="route-intro">
        <SplitHeading
          kicker="Scene taxonomy"
          leadTitle="Browse"
          outlineTitle="Scenes"
          description="Explore soundtrack cues by the kind of scene they shape: openings, montages, reveals, finales, and more."
        />
        <RouteMeta
          items={[
            pluralize(scenes.length, "scene type"),
            "Cross-title cue discovery",
            "Mapped soundtrack moments",
          ]}
        />
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {scenes.map((scene) => (
          <Link
            key={scene.slug}
            href={`/scenes/${scene.slug}`}
            className="hover-card group flex h-full flex-col"
          >
            <div className="route-surface flex flex-1 flex-col py-5">
              <p className="route-kicker">Scene type</p>
              <h2 className="card-heading clamp-2 mt-2 min-h-[3.4rem] text-2xl font-semibold leading-tight text-black">
                {scene.name}
              </h2>
              <p className="clamp-3 mt-3 min-h-[4.8rem] font-body text-base leading-relaxed text-[color:var(--muted)]">
                {scene.description}
              </p>
              <p className="mt-auto pt-4 font-body text-sm text-black/58">
                {pluralize(scene.cues.length, "cue")} · {pluralize(scene.titles.length, "title")}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
