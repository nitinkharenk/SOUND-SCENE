"use client";

import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";

export function GlobalSearchMount() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/search") {
    return null;
  }

  return <SearchBar mode="redirect" />;
}
