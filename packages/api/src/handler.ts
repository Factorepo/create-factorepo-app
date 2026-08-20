import type { Auth } from "@acme/auth";
import { AppError, httpLog, isAppError } from "@acme/service";

import type { ApiContext } from "./context";
import { createApiContext } from "./context";
import { errorStatus, toErrorBody } from "./errors";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, GET, POST, DELETE",
  "Access-Control-Allow-Headers": "*",
};

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });

export const corsPreflight = (): Response =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export interface RouteContext<TParams = Record<string, never>> {
  ctx: ApiContext;
  req: Request;
  params: TParams;
}

export type RouteHandler<TParams, TResult> = (
  args: RouteContext<TParams>,
) => Promise<TResult>;

export function apiRoute<TParams, TResult>(
  auth: Auth,
  handler: RouteHandler<TParams, TResult>,
) {
  return async (
    req: Request,
    segment?: { params: Promise<TParams> },
  ): Promise<Response> => {
    try {
      const ctx = await createApiContext({ headers: req.headers, auth });
      const params = ((await segment?.params) ?? {}) as TParams;

      return json(await handler({ ctx, req, params }), 200);
    } catch (error) {
      const failure = isAppError(error)
        ? error
        : AppError.internal("http.request.unhandled", error);

      httpLog.requestFailed(failure, {
        route: req.url,
        method: req.method,
        status: errorStatus(failure),
      });

      return json(toErrorBody(failure), errorStatus(failure));
    }
  };
}

export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    const body: unknown = await req.json();
    return body;
  } catch {
    throw AppError.badRequest("Expected a JSON request body.");
  }
}
