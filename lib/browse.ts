export function normalizeParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
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
