import { QueryClient } from "@tanstack/react-query";

import type {
  ApiErrorBody,
  ApiErrorCode,
  FieldErrors,
  LikeSummary,
  PostSummary,
} from "@acme/api";

import { authClient } from "~/utils/auth";
import { getBaseUrl } from "~/utils/base-url";

export type { LikeSummary, PostSummary } from "@acme/api";

export type NewPost = Pick<PostSummary, "title" | "content">;

export const queryClient = new QueryClient();

export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly fieldErrors?: FieldErrors;

  constructor(opts: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  }) {
    super(opts.message);
    this.name = "ApiClientError";
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
  }
}

const isApiErrorBody = (body: unknown): body is ApiErrorBody =>
  typeof body === "object" && body !== null && "error" in body;

async function request<TResult>(
  path: string,
  init?: RequestInit,
): Promise<TResult> {
  const headers = new Headers({ "content-type": "application/json" });

  // The session cookie has to be attached by hand on native.
  const cookies = authClient.getCookie();
  if (cookies) headers.set("Cookie", cookies);

  const res = await fetch(`${getBaseUrl()}${path}`, { ...init, headers });
  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw isApiErrorBody(body)
      ? new ApiClientError(body.error)
      : new ApiClientError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Request to ${path} failed with status ${res.status}`,
        });
  }

  return body as TResult;
}

export const postKeys = {
  all: ["posts"] as const,
  detail: (id: string) => ["posts", id] as const,
};

// `@acme/api` stays a dev dependency so no backend code reaches the bundle.
export const api = {
  posts: {
    list: () => request<PostSummary[]>("/api/posts"),
    byId: (id: string) => request<PostSummary>(`/api/posts/${id}`),
    create: (input: NewPost) =>
      request<PostSummary>("/api/posts", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    delete: (id: string) =>
      request<{ id: string }>(`/api/posts/${id}`, { method: "DELETE" }),
  },
  likes: {
    create: (postId: string) =>
      request<LikeSummary>(`/api/posts/${postId}/likes`, { method: "POST" }),
    delete: (id: string) =>
      request<{ id: string }>(`/api/likes/${id}`, { method: "DELETE" }),
  },
};
