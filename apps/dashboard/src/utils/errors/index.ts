import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";

export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("UNAUTHORIZED", "You need to sign in again.");
  }
}

export class ForbiddenError extends AppError {
  readonly userId?: string;
  readonly role?: string;

  constructor(userId?: string, role?: string) {
    super("FORBIDDEN", "You cannot do this.");
    this.userId = userId;
    this.role = role;
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password.");
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super("NOT_FOUND", `${entity} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}

export type ActionErrorClient = {
  code: string;
  message: string;
};

export type ActionErrorLog = {
  actionName: unknown;
  code: string;
  message: string;
  stack?: string;
  userId?: string;
  role?: string;
};

export type ActionErrorInterpretation = {
  log: ActionErrorLog;
  client: ActionErrorClient;
  navigation: "unauthorized" | "forbidden" | null;
};

export function interpretActionError(
  error: unknown,
  metadata: { actionName?: unknown },
): ActionErrorInterpretation {
  if (error instanceof AppError) {
    const log: ActionErrorLog = {
      actionName: metadata.actionName,
      code: error.code,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof ForbiddenError) {
      log.userId = error.userId;
      log.role = error.role;
    }

    const navigation =
      error instanceof UnauthorizedError
        ? "unauthorized"
        : error instanceof ForbiddenError
          ? "forbidden"
          : null;

    return {
      log,
      client: { code: error.code, message: error.message },
      navigation,
    };
  }

  const fallback =
    error instanceof Error ? error : new Error(DEFAULT_SERVER_ERROR_MESSAGE);

  return {
    log: {
      actionName: metadata.actionName,
      code: "INTERNAL",
      message: fallback.message,
      stack: fallback.stack,
    },
    client: {
      code: "INTERNAL",
      message: DEFAULT_SERVER_ERROR_MESSAGE,
    },
    navigation: null,
  };
}
