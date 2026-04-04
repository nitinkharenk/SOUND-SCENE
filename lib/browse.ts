export function normalizeParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export type VisiblePageToken = number | "...";

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
): VisiblePageToken[] {
  const pages = new Set<number>();

  for (const page of [1, 2, 3, currentPage - 1, currentPage, currentPage + 1, totalPages - 2, totalPages - 1, totalPages]) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const visiblePages: VisiblePageToken[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (typeof previousPage === "number" && page - previousPage > 1) {
      visiblePages.push("...");
    }

    visiblePages.push(page);
  });

  return visiblePages;
}

export function buildBrowseHref(
  pathname: string,
  filters: Record<string, string | number | undefined>,
  options?: { defaultSort?: string },
): string {
  const params = new URLSearchParams();
  const defaultSort = options?.defaultSort ?? "newest";

  Object.entries(filters).forEach(([key, rawValue]) => {
    if (typeof rawValue === "number") {
      if (key === "page" && rawValue > 1) {
        params.set(key, String(rawValue));
      }

      return;
    }

    const value = rawValue?.trim();

    if (!value) {
      return;
    }

    if (key === "sort" && value === defaultSort) {
      return;
    }

    params.set(key, value);
  });

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}
