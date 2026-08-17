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
