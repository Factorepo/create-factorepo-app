/**
 * The shared backend for the Next.js app.
 *
 * `services/*` hold the actual data access and can be called directly from a
 * React Server Component; `routes/*` are thin adapters that expose those
 * services over HTTP, which keeps the Next.js route files under
 * `apps/nextjs/src/app/api` down to one line each. Nothing here imports Next.js
 * — only the web `Request`/`Response` types.
 *
 * Client apps should only ever import the *types* from this package; see the
 * "Does this pattern leak backend code to my client applications?" section of
 * the README.
 */
export type { ApiContext, AuthedApiContext } from "./context";
export { createApiContext, requireSession } from "./context";

export type { ApiErrorBody, ApiErrorCode, FieldErrors } from "./errors";
export { ApiError, parseInput } from "./errors";

export type { RouteContext, RouteHandler } from "./handler";
export { apiRoute, corsPreflight, readJsonBody } from "./handler";

export type { PostSummary } from "./services/post";
export type { LikeSummary } from "./services/like";
export * as postService from "./services/post";
export * as likeService from "./services/like";

export { postRoutes } from "./routes/post";
export { likeRoutes } from "./routes/like";
