import type { ZodError, ZodType } from "zod/v4";
import { z } from "zod/v4";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export type FieldErrors = Record<string, string[] | undefined>;

/**
 * The shape every non-2xx response from this API uses. Clients narrow on
 * `error.code` rather than on the HTTP status so the two stay in sync.
 */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
}

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(opts: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.code = opts.code;
    this.status = STATUS_BY_CODE[opts.code];
    this.fieldErrors = opts.fieldErrors;
  }

  toBody(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fieldErrors && { fieldErrors: this.fieldErrors }),
      },
    };
  }
}

/**
 * Validates `input` against `schema`, turning a failure into a `BAD_REQUEST`
 * carrying per-field messages so forms can render them inline.
 */
export function parseInput<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError({
      code: "BAD_REQUEST",
      message: "Invalid input",
      fieldErrors: z.flattenError(
        result.error as ZodError<Record<string, unknown>>,
      ).fieldErrors,
    });
  }
  return result.data;
}
