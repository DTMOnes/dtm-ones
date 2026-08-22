type RawSearchParams = {
  q?: string;
  c?: string | string[];
  kind?: string | string[];
};

type NormalizedSearchParams = {
  q: string | undefined;
  c: string[];
  kind: "coach" | undefined;
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

function normalizeKind(
  value?: string | string[],
): "coach" | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "coach" ? "coach" : undefined;
}

export function normalizeSearchParams(
  params: RawSearchParams,
): NormalizedSearchParams {
  const kind = normalizeKind(params.kind);

  return {
    q: normalizeQ(params.q),
    c: kind ? [] : normalizeC(params.c),
    kind,
  };
}
