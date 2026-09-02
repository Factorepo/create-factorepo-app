import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PostSummary } from "@acme/api";
import { POST_CREATE_FAILED, POST_CREATE_UNAUTHORIZED } from "@acme/constants";

import { ApiClientError, postKeys } from "~/api/client";
import { useCreatePost } from "~/app/_components/hooks/use-create-post";

const createPost = vi.fn();

vi.mock("~/api/client", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    api: { posts: { create: (input: unknown) => createPost(input) } },
  };
});

const input = { title: "The install step fails", content: "It stops early." };

const created: PostSummary = {
  id: "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11",
  title: input.title,
  content: input.content,
  createdBy: "8c2f0a51-4d3e-4b9c-8a17-5e6d2c9f0b34",
  updatedBy: null,
  createdAt: "2026-08-19T00:00:00.000Z",
  updatedAt: null,
  likeCount: 0,
};

const renderUseCreatePost = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, ...renderHook(() => useCreatePost(), { wrapper }) };
};

describe("useCreatePost", () => {
  beforeEach(() => {
    createPost.mockReset();
  });

  it("seeds the post list with the created post", async () => {
    createPost.mockResolvedValue(created);
    const { result, queryClient } = renderUseCreatePost();
    queryClient.setQueryData<PostSummary[]>(postKeys.all, []);

    act(() => result.current.createPost(input));

    await waitFor(() =>
      expect(queryClient.getQueryData(postKeys.all)).toStrictEqual([created]),
    );
    expect(createPost).toHaveBeenCalledWith(input);
  });

  it("reports the request while it runs", async () => {
    let settle!: (post: PostSummary) => void;
    createPost.mockReturnValue(
      new Promise<PostSummary>((resolve) => (settle = resolve)),
    );
    const { result } = renderUseCreatePost();

    expect(result.current.isPending).toBe(false);

    act(() => result.current.createPost(input));
    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => settle(created));
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it("reports the sign-in message when the request is unauthorized", async () => {
    createPost.mockRejectedValue(
      new ApiClientError({ code: "UNAUTHORIZED", message: "Sign in first." }),
    );
    const { result } = renderUseCreatePost();

    act(() => result.current.createPost(input));

    await waitFor(() =>
      expect(result.current.errorMessage).toBe(POST_CREATE_UNAUTHORIZED),
    );
  });

  it("reports the failure message for any other error", async () => {
    createPost.mockRejectedValue(new Error("Network down"));
    const { result } = renderUseCreatePost();

    act(() => result.current.createPost(input));

    await waitFor(() =>
      expect(result.current.errorMessage).toBe(POST_CREATE_FAILED),
    );
  });
});
