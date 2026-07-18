const Q_MAX_LENGTH = 50;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function normalizeRosterQ(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === undefined) {
    return undefined;
  }

  const trimmed = raw.trim();

  if (trimmed === "" || trimmed.length > Q_MAX_LENGTH) {
    return undefined;
  }

  return trimmed;
}

export function normalizeRosterCategories(
  value: string | string[] | undefined,
): string[] {
  if (value === undefined) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const entry of values) {
    if (typeof entry !== "string") {
      continue;
    }

    const trimmed = entry.trim();

    if (!isValidUuid(trimmed)) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}
