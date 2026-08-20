import type { Auth } from "@acme/auth";
import { AppError } from "@acme/service";

type Session = Awaited<ReturnType<Auth["api"]["getSession"]>>;

export interface ApiContext {
  authApi: Auth["api"];
  session: Session;
}

export interface AuthedApiContext extends ApiContext {
  session: NonNullable<Session>;
}

export const createApiContext = async (opts: {
  headers: Headers;
  auth: Auth;
}): Promise<ApiContext> => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({ headers: opts.headers });

  return { authApi, session };
};

export function requireSession(ctx: ApiContext): AuthedApiContext {
  if (!ctx.session) {
    throw AppError.unauthorized();
  }
  return { ...ctx, session: ctx.session };
}
