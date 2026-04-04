import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getArtistProfiles, getDiscoverGenreSlugs, getSceneCollectionSlugs } from "@/lib/feature-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundscene.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [titles, songs, artists, genres, scenes] = await Promise.all([
    prisma.title.findMany({
      select: {
        slug: true,
        updatedAt: true,
        type: true,
      },
    }),
    prisma.song.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    getArtistProfiles(),
    getDiscoverGenreSlugs(),
    getSceneCollectionSlugs(),
  ]);

  return [
    {
      url: siteUrl,
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/movies`,
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/series`,
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/songs`,
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/charts`,
      priority: 0.8,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/search`,
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/discover`,
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/scenes`,
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/series/episodes`,
      priority: 0.7,
      lastModified: new Date(),
    },
    ...titles.map((title) => ({
      url: `${siteUrl}/${title.type === "movie" ? "movies" : "series"}/${title.slug}`,
      lastModified: title.updatedAt,
      priority: 0.8,
    })),
    ...songs.map((song) => ({
      url: `${siteUrl}/songs/${song.slug}`,
      lastModified: song.updatedAt,
      priority: 0.75,
    })),
    ...artists.map((artist) => ({
      url: `${siteUrl}/artists/${artist.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
    ...genres.map((genre) => ({
      url: `${siteUrl}/discover/${genre}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
    ...scenes.map((scene) => ({
      url: `${siteUrl}/scenes/${scene}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  ];
}
