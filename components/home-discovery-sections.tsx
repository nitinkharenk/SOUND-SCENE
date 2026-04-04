import { getHomeDiscoveryData } from "@/lib/discovery";
import { HomeDiscoverySectionsClient } from "@/components/home-discovery-sections-client";

export async function HomeDiscoverySections() {
  const data = await getHomeDiscoveryData();

  return <HomeDiscoverySectionsClient {...data} />;
}
