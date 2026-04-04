import { getHomeDiscoveryData } from "@/lib/discovery";
import { HomeDiscoverySectionsClient } from "@/components/home-discovery-sections-client";

const emptyData = {
  popularCollections: { movies: [], series: [], songs: [] },
  latestCollections: { movies: [], series: [], songs: [] },
  trendingStories: [],
  weeklyEpisodes: [],
} as Awaited<ReturnType<typeof getHomeDiscoveryData>>;

export async function HomeDiscoverySections() {
  try {
    const data = await getHomeDiscoveryData();
    return <HomeDiscoverySectionsClient {...data} />;
  } catch {
    return <HomeDiscoverySectionsClient {...emptyData} />;
  }
}
