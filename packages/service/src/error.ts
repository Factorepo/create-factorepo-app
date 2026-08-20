export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "TOO_MANY_REQUESTS"
  | "UPSTREAM_FAILURE"
  | "INTERNAL";

const HTTP_STATUS: Record<AppErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  UPSTREAM_FAILURE: 502,
  INTERNAL: 500,
};

export const GENERIC_USER_MESSAGE = "Something went wrong. Please try again.";

export interface AppErrorOptions {
  userMessage?: string;
  /** ids / counts / stages only — never message content. */
  meta?: Record<string, unknown>;
  /** `true` → warn (ordinary 4xx traffic), `false` → error (alertable). */
  expected?: boolean;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly meta?: Record<string, unknown>;
  readonly expected: boolean;
  override readonly cause?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.userMessage = options.userMessage ?? GENERIC_USER_MESSAGE;
    this.meta = options.meta;
    this.expected = options.expected ?? HTTP_STATUS[code] < 500;
    this.cause = options.cause;
  }

  static badRequest(
    userMessage: string,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("BAD_REQUEST", userMessage, { userMessage, meta });
  }

  static unauthorized(
    userMessage = "You must sign in for this operation.",
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("UNAUTHORIZED", userMessage, { userMessage, meta });
  }

  static forbidden(
    userMessage = "You do not have access to this resource.",
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("FORBIDDEN", userMessage, { userMessage, meta });
  }

  static notFound(
    userMessage: string,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("NOT_FOUND", userMessage, { userMessage, meta });
  }

  static conflict(
    userMessage: string,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("CONFLICT", userMessage, { userMessage, meta });
  }

  static payloadTooLarge(
    userMessage: string,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("PAYLOAD_TOO_LARGE", userMessage, {
      userMessage,
      meta,
    });
  }

  // Always `expected: false`, so an upstream failure drives error-rate alerting.
  static upstream(
    scope: string,
    cause: unknown,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("UPSTREAM_FAILURE", `upstream.${scope}.failed`, {
      userMessage: GENERIC_USER_MESSAGE,
      meta: { ...meta, scope },
      expected: false,
      cause,
    });
  }

  static internal(
    message: string,
    cause?: unknown,
    meta?: Record<string, unknown>,
  ): AppError {
    return new AppError("INTERNAL", message, {
      userMessage: GENERIC_USER_MESSAGE,
      meta,
      expected: false,
      cause,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function appErrorStatus(code: AppErrorCode): number {
  return HTTP_STATUS[code];
}
