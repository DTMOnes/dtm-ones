export type ActionResult<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };

export const UNAVAILABLE =
  "This service is temporarily unavailable. Please try again in a moment.";

export const PLEASE_SIGN_IN = "Please sign in to continue.";

export const FORBIDDEN = "You are not allowed to perform this action.";

export const NOT_FOUND = "Resource could not be found.";

export const CONFLICT = "This action conflicts with the current state.";

export const INVALID_CREDENTIALS = "Invalid email or password.";
