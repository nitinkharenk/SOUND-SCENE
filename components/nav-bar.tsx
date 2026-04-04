import { getNavData } from "@/lib/discovery";
import { NavBarClient } from "@/components/nav-bar-client";

export async function NavBar() {
  try {
    const data = await getNavData();
    return <NavBarClient {...data} />;
  } catch {
    return <NavBarClient trendingContent={[]} movieHighlights={[]} seriesHighlights={[]} popularSongs={[]} />;
  }
}
