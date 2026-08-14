import type { Auth } from "@acme/auth";

import type { ApiContext } from "./context";
import { createApiContext } from "./context";
import { ApiError } from "./errors";

/**
 * Basic CORS headers so the Expo app can talk to the API.
 * You should extend this to match your needs.
 */
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

/** Handler for the CORS preflight request. Re-export as `OPTIONS` from a route. */
export const corsPreflight = (): Response =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

/** The arguments every route handler in this package receives. */
export interface RouteContext<TParams = Record<string, never>> {
  ctx: ApiContext;
  req: Request;
  params: TParams;
}

export type RouteHandler<TParams, TResult> = (
  args: RouteContext<TParams>,
) => Promise<TResult>;

/**
 * Adapts one of this package's route handlers into a web-standard request
 * handler, which is exactly the signature a Next.js App Router route file
 * expects:
 *
 * ```ts
 * export const GET = apiRoute(auth, postRoutes.byId);
 * ```
 */
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
      if (error instanceof ApiError) {
        return json(error.toBody(), error.status);
      }

      console.error(`>>> API error on '${req.method} ${req.url}'`, error);
      const unexpected = new ApiError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
      return json(unexpected.toBody(), unexpected.status);
    }
  };
}

/** Reads a JSON request body, rejecting anything that isn't parseable. */
export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    const body: unknown = await req.json();
    return body;
  } catch {
    throw new ApiError({
      code: "BAD_REQUEST",
      message: "Expected a JSON request body",
    });
  }
}
