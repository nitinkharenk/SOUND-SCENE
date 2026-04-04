import { getNavData } from "@/lib/discovery";
import { NavBarClient } from "@/components/nav-bar-client";

export async function NavBar() {
  const data = await getNavData();

  return <NavBarClient {...data} />;
}
