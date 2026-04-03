import Link from "next/link";
import { RouteMeta, SplitHeading } from "@/components/route-heading";
import { weeklyEpisodes } from "@/lib/discovery";

export default function SeriesEpisodesPage() {
  return (
    <div className="route-shell">
      <section className="route-intro">
        <div>
          <SplitHeading
            kicker="Browse web series"
            leadTitle="Series"
            outlineTitle="Episodes"
            description="Every mapped episode currently available in the SoundScene web series catalog, with lead songs and series links."
          />
          <RouteMeta
            items={[`${weeklyEpisodes.length} episodes`, "Newest titles first", "Scene mapped"]}
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="route-surface">
          {weeklyEpisodes.map((episode) => (
            <Link
              key={episode.id}
              href={episode.href}
              className="route-row-link sm:grid-cols-[180px_1fr]"
            >
              <div className="aspect-[1.18/0.74] overflow-hidden rounded-[0.38rem] bg-[#ede5da]">
                <img
                  src={episode.image}
                  alt={episode.seriesTitle}
                  className="hover-card-media h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  {episode.episodeCode} · {episode.seriesTitle}
                </p>
                <h2 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                  {episode.episodeTitle}
                </h2>
                <p className="mt-3 font-body text-base font-normal leading-relaxed text-black/64">
                  {episode.summary}
                </p>
                <p className="mt-3 font-body text-sm font-normal text-black/58">
                  {episode.songsCount} soundtrack cues · Lead song: {episode.leadSong}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
