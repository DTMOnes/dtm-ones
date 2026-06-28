export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: ApiFieldErrors;

  constructor(message: string, status: number, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type FastApiDetailEntry = {
  loc?: Array<string | number>;
  msg?: string;
};

type FastApiDetail = string | FastApiDetailEntry[] | null | undefined;

function normalizeFieldName(loc?: Array<string | number>): string | null {
  if (!loc || loc.length === 0) return null;
  const field = loc[loc.length - 1];
  if (typeof field !== "string") return null;
  return field;
}

function parseFieldErrors(detail: FastApiDetail): ApiFieldErrors | undefined {
  if (!Array.isArray(detail)) return undefined;
  const mapped: ApiFieldErrors = {};

  for (const item of detail) {
    const field = normalizeFieldName(item.loc);
    if (!field || !item.msg) continue;
    mapped[field] = [...(mapped[field] ?? []), item.msg];
  }

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

export async function buildApiError(response: Response): Promise<ApiError> {
  let detail: FastApiDetail;
  try {
    const payload = (await response.json()) as { detail?: FastApiDetail };
    detail = payload.detail;
  } catch {
    detail = undefined;
  }

  const fallbackMessage = `Request failed (${response.status})`;
  const message = typeof detail === "string" ? detail : fallbackMessage;
  const fieldErrors = parseFieldErrors(detail);

  return new ApiError(message, response.status, fieldErrors);
}
