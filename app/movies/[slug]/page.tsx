import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieSceneFilterPanel } from "@/components/movie-scene-filter-panel";
import { TimestampLookup } from "@/components/timestamp-lookup";
import { RouteMeta, RouteTagList, SplitHeading } from "@/components/route-heading";
import { getMovieBySlug, getRelatedMovies, getStaticMovieParams } from "@/lib/content-store";
import { hasParseableTimestamp } from "@/lib/text";

type MovieDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  try {
    return await getStaticMovieParams();
  } catch {
    return [];
  }
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const relatedMovies = await getRelatedMovies(movie.slug);
  const hasTimestampLookup = movie.soundtrack.some((item) => hasParseableTimestamp(item.timestamp));

  return (
    <div className="route-shell">
      <section className="route-intro lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
        <div>
          <SplitHeading
            kicker="Movie soundtrack guide"
            leadTitle={movie.title}
            outlineTitle="Soundtrack"
            mode="detail"
            description={movie.description}
          />
          <RouteMeta
            items={[movie.year, movie.runtime, movie.platform, `Rating ${movie.rating}`]}
          />
          <div className="mt-6">
            <RouteTagList
              items={movie.genres.map((genre) => ({
                label: genre,
                href: `/movies?genre=${encodeURIComponent(genre)}`,
              }))}
              tone="accent"
            />
          </div>
        </div>

        <div className="route-thumb aspect-[1.28/0.86] lg:mt-3">
          <img src={movie.backdrop} alt={movie.title} />
        </div>
      </section>

      <section className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-6">
            <SplitHeading
              kicker="Complete soundtrack list"
              leadTitle="Mapped"
              outlineTitle="Scene Cues"
              compact
            />
          </div>
          {/* Keep Syne section headings at least 12px larger than nearby Cabinet soundtrack titles. */}
          <MovieSceneFilterPanel items={movie.soundtrack} />
        </div>

        <aside className="space-y-10">
          {hasTimestampLookup ? (
            <TimestampLookup contentTitle={movie.title} items={movie.soundtrack} />
          ) : null}

          <section>
          <div className="mb-4">
              <SplitHeading
                kicker="Keep exploring"
                leadTitle="More"
                outlineTitle="Movies"
                compact
              />
            </div>
            {/* Keep Syne section headings at least 12px larger than nearby Cabinet movie titles. */}
            <div className="route-surface">
              {relatedMovies.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/movies/${item.slug}`}
                    className="route-row-link sm:grid-cols-[110px_1fr]"
                  >
                    <div className="route-thumb aspect-[1.1/0.82]">
                      <img src={item.poster} alt={item.title} />
                    </div>
                    <div>
                      <p className="route-kicker text-[0.72rem]">{item.year}</p>
                      <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                        {item.title}
                      </h3>
                      <p className="mt-2 font-body text-base font-normal leading-relaxed text-black/62">
                        {item.tagline}
                      </p>
                    </div>
                  </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
