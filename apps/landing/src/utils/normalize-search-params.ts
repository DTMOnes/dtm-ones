type RawSearchParams = {
  q?: string;
  c?: string | string[];
};

type NormalizedSearchParams = {
  q: string | undefined;
  c: string[];
};

function normalizeQ(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized && normalized.length <= 50 ? normalized : undefined;
}

function normalizeC(value?: string | string[]): string[] {
  const categories = Array.isArray(value) ? value : value ? [value] : [];
  return [
    ...new Set(categories.map((category) => category.trim()).filter(Boolean)),
  ];
}

export function normalizeSearchParams(
  params: RawSearchParams,
): NormalizedSearchParams {
  return {
    q: normalizeQ(params.q),
    c: normalizeC(params.c),
  };
}
