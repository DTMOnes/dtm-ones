type BetterAuthLikeError = {
  status?: unknown;
  message?: unknown;
};

export function getBetterAuthErrorStatus(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const status = (error as BetterAuthLikeError).status;
  return typeof status === "string" ? status : null;
}

export function getBetterAuthErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const message = (error as BetterAuthLikeError).message;
  return typeof message === "string" ? message : String(error);
}

export function isDuplicateEmailError(error: unknown): boolean {
  const message = getBetterAuthErrorMessage(error);
  return /already exists|duplicate|unique/i.test(message);
}
