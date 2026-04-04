import { SearchExperience } from "@/components/search-experience";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function normalizeParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeParam(params.q).trim();
  return <SearchExperience initialQuery={query} />;
}
