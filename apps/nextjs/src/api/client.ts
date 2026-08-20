import type { z } from "zod/v4";

import type {
  ApiErrorBody,
  ApiErrorCode,
  FieldErrors,
  LikeSummary,
  PostSummary,
} from "@acme/api";
import type { CreatePostSchema } from "@acme/db/schema";

import { env } from "~/env";

export type NewPost = z.infer<typeof CreatePostSchema>;

/** An error response from the API, carrying the code the server assigned it. */
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

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  // oxlint-disable-next-line no-restricted-properties -- PORT is read before the env module loads, during local dev only.
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

async function request<TResult>(
  path: string,
  init?: RequestInit,
): Promise<TResult> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });

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
