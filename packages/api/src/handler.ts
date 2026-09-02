import type { Auth } from "@acme/auth";
import {
  AppError,
  authLog,
  httpLog,
  isAppError,
  runWithLogContext,
  setLogContext,
} from "@acme/service";

import type { ApiContext } from "./context";
import { createApiContext } from "./context";
import { errorStatus, toErrorBody } from "./errors";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, GET, POST, DELETE",
  "Access-Control-Allow-Headers": "*",
};

const json = (body: unknown, status: number, traceId?: string): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json",
      ...(traceId && { "x-trace-id": traceId }),
    },
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

const readTraceId = (req: Request): string =>
  req.headers.get("x-trace-id") ??
  req.headers.get("x-request-id") ??
  crypto.randomUUID();

async function readContext(req: Request, auth: Auth): Promise<ApiContext> {
  try {
    return await createApiContext({ headers: req.headers, auth });
  } catch (error) {
    authLog.apiFailed(error);
    throw AppError.internal("auth.session.unavailable", error);
  }
}

export function apiRoute<TParams, TResult>(
  auth: Auth,
  handler: RouteHandler<TParams, TResult>,
) {
  return async (
    req: Request,
    segment?: { params: Promise<TParams> },
  ): Promise<Response> => {
    const traceId = readTraceId(req);
    const route = new URL(req.url).pathname;

    return runWithLogContext(
      { traceId, route, method: req.method },
      async (): Promise<Response> => {
        const startedAt = Date.now();

        httpLog.requestStarted({
          ip: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
          contentLength: req.headers.get("content-length") ?? undefined,
          referer: req.headers.get("referer") ?? undefined,
        });

        const settle = (status: number) => {
          const durationMs = Date.now() - startedAt;
          if (req.signal.aborted) return httpLog.requestAborted(durationMs);
          httpLog.requestCompleted(status, durationMs);
        };

        try {
          const ctx = await readContext(req, auth);
          if (ctx.session) setLogContext({ userId: ctx.session.user.id });

          const params = ((await segment?.params) ?? {}) as TParams;
          const result = await handler({ ctx, req, params });

          settle(200);
          return json(result, 200, traceId);
        } catch (error) {
          const failure = isAppError(error)
            ? error
            : AppError.internal("http.request.unhandled", error);
          const status = errorStatus(failure);

          httpLog.requestFailed(failure, { route, method: req.method, status });
          settle(status);

          return json(toErrorBody(failure), status, traceId);
        }
      },
    );
  };
}

export interface WebhookContext {
  req: Request;
  body: string;
}

export type WebhookHandler<TResult> = (
  args: WebhookContext,
) => Promise<TResult>;

// A webhook carries no session and its signature is checked against the bytes
// as they arrived, so it takes the raw body and never builds a context.
export function webhookRoute<TResult>(handler: WebhookHandler<TResult>) {
  return async (req: Request): Promise<Response> => {
    const traceId = readTraceId(req);
    const route = new URL(req.url).pathname;

    return runWithLogContext(
      { traceId, route, method: req.method },
      async (): Promise<Response> => {
        const startedAt = Date.now();

        try {
          const result = await handler({ req, body: await req.text() });

          httpLog.requestCompleted(200, Date.now() - startedAt);
          return json(result, 200, traceId);
        } catch (error) {
          const failure = isAppError(error)
            ? error
            : AppError.internal("http.webhook.unhandled", error);
          const status = errorStatus(failure);

          httpLog.requestFailed(failure, { route, method: req.method, status });
          httpLog.requestCompleted(status, Date.now() - startedAt);

          return json(toErrorBody(failure), status, traceId);
        }
      },
    );
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
