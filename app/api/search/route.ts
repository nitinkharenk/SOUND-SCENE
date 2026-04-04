import { NextResponse } from "next/server";
import { getSearchCoreResults, getSearchExperienceData } from "@/lib/feature-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const includeEditorial = searchParams.get("includeEditorial") === "1";

  if (query.trim().length < 3) {
    if (includeEditorial && query.trim().length === 0) {
      return NextResponse.json(await getSearchExperienceData(""), {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({
      movies: [],
      series: [],
      songs: [],
      artists: [],
      ...(includeEditorial
        ? {
            editorialSuggestions: {
              movies: [],
              series: [],
              songs: [],
              artists: [],
            },
          }
        : {}),
    });
  }

  const results = includeEditorial
    ? await getSearchExperienceData(query)
    : await getSearchCoreResults(query);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
