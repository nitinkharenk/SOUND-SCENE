import Link from "next/link";
import { getSongLibrary } from "@/lib/content-store";
import { pluralize } from "@/lib/text";

export default async function AdminSongsPage() {
  const songs = await getSongLibrary();

  return (
    <section className="route-surface py-5">
      <p className="route-kicker">Admin songs</p>
      <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[0.01em] text-black">
        Songs
      </h2>
      <p className="mt-3 font-body text-base text-[color:var(--muted)]">
        {pluralize(songs.length, "song")} available for soundtrack mapping and artist linking.
      </p>
      <div className="mt-6 space-y-3">
        {songs.map((song) => (
          <Link key={song.slug} href={`/songs/${song.slug}`} className="route-row-link grid-cols-[1fr]">
            <div>
              <p className="route-kicker text-[0.72rem]">{song.artist}</p>
              <h3 className="card-heading mt-2 text-2xl font-semibold leading-tight text-black">
                {song.title}
              </h3>
              <p className="mt-2 font-body text-sm text-[color:var(--muted)]">
                {song.mood} · {pluralize(song.appearances.length, "appearance")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
