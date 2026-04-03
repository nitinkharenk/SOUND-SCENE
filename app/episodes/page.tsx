import { redirect } from "next/navigation";

export default function EpisodesRedirectPage() {
  redirect("/series/episodes");
}
