import type { Auth } from "@acme/auth";
import { db } from "@acme/db/client";

import { ApiError } from "./errors";

type Session = Awaited<ReturnType<Auth["api"]["getSession"]>>;

/**
 * Everything a route handler needs to serve a request: the database, the
 * better-auth server API, and the session belonging to the caller (if any).
 */
export interface ApiContext {
  db: typeof db;
  authApi: Auth["api"];
  session: Session;
}

/** An {@link ApiContext} that is guaranteed to belong to a signed-in user. */
export interface AuthedApiContext extends ApiContext {
  session: NonNullable<Session>;
}

export const createApiContext = async (opts: {
  headers: Headers;
  auth: Auth;
}): Promise<ApiContext> => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({ headers: opts.headers });

  return { db, authApi, session };
};

/**
 * Narrows a context to a signed-in one, or rejects the request. Use this at the
 * top of any handler that must not be reachable anonymously.
 */
export function requireSession(ctx: ApiContext): AuthedApiContext {
  if (!ctx.session) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to do that",
    });
  }
  return { ...ctx, session: ctx.session };
}
