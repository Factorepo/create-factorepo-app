import type { ZodError, ZodType } from "zod/v4";
import { z } from "zod/v4";

import type { AppErrorCode } from "@acme/service";
import { AppError, appErrorStatus } from "@acme/service";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export type FieldErrors = Record<string, string[] | undefined>;

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
}

// The application error carries nine codes and the wire carries five, so the
// ones a client cannot act on differently collapse. The HTTP status stays the
// accurate one, read from the application error itself.
const WIRE_CODE: Record<AppErrorCode, ApiErrorCode> = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "BAD_REQUEST",
  PAYLOAD_TOO_LARGE: "BAD_REQUEST",
  TOO_MANY_REQUESTS: "BAD_REQUEST",
  UPSTREAM_FAILURE: "INTERNAL_SERVER_ERROR",
  INTERNAL: "INTERNAL_SERVER_ERROR",
};

function readFieldErrors(error: AppError): FieldErrors | undefined {
  const fieldErrors = error.meta?.fieldErrors;
  return fieldErrors as FieldErrors | undefined;
}

export function toErrorBody(error: AppError): ApiErrorBody {
  const fieldErrors = readFieldErrors(error);

  return {
    error: {
      code: WIRE_CODE[error.code],
      message: error.userMessage,
      ...(fieldErrors && { fieldErrors }),
    },
  };
}

export const errorStatus = (error: AppError): number =>
  appErrorStatus(error.code);

export function parseInput<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const fieldErrors = z.flattenError(
      result.error as ZodError<Record<string, unknown>>,
    ).fieldErrors;

    throw AppError.badRequest("Invalid input.", { fieldErrors });
  }
  return result.data;
}
