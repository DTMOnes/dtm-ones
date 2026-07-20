export type ActionResult<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };

export const UNAVAILABLE =
  "This service is temporarily unavailable. Please try again in a moment.";
