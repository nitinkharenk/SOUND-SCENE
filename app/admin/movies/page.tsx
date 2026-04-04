import Link from "next/link";
import { getCatalog } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

export default async function AdminMoviesPage() {
  const catalog = await getCatalog();
  const movies = catalog.filter((entry) => entry.type === "movie");

  return (
    <section className="route-surface py-5">
      <p className="route-kicker">Admin movies</p>
      <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[0.01em] text-black">
        Movies
      </h2>
      <p className="mt-3 font-body text-base text-[color:var(--muted)]">
        {pluralize(movies.length, "movie")} currently in the catalog. This page is the protected
        management surface for movie metadata and soundtrack mapping.
      </p>
      <div className="mt-6 space-y-3">
        {movies.map((movie) => (
          <Link key={movie.slug} href={`/movies/${movie.slug}`} className="route-row-link grid-cols-[1fr]">
            <div>
              <p className="route-kicker text-[0.72rem]">{movie.year} · {movie.platform}</p>
              <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                {movie.title}
              </h3>
              <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
                {movie.runtime} · {pluralize(movie.soundtrack.length, "cue")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
