import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PostSummary } from "@acme/api";
import { POST_DELETE_FAILED, POST_DELETE_UNAUTHORIZED } from "@acme/constants";
import { toast } from "@acme/ui/toast";

import { ApiClientError, postKeys } from "~/api/client";
import { useDeletePost } from "~/app/_components/hooks/use-delete-post";

const deletePost = vi.fn();

vi.mock("~/api/client", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    api: { posts: { delete: (id: string) => deletePost(id) } },
  };
});

vi.mock("@acme/ui/toast", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const post: PostSummary = {
  id: "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11",
  title: "The install step fails",
  content: "The pipeline stops before it runs a test.",
  createdBy: "8c2f0a51-4d3e-4b9c-8a17-5e6d2c9f0b34",
  updatedBy: null,
  createdAt: "2026-08-19T00:00:00.000Z",
  updatedAt: null,
  likeCount: 3,
};

const other: PostSummary = {
  ...post,
  id: "8c2e1d44-1111-4a4a-9f2a-2f0b6d5f1a22",
};

const renderUseDeletePost = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, ...renderHook(() => useDeletePost(), { wrapper }) };
};

describe("useDeletePost", () => {
  beforeEach(() => {
    deletePost.mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("takes the deleted post out of the list", async () => {
    deletePost.mockResolvedValue({ id: post.id });
    const { result, queryClient } = renderUseDeletePost();
    queryClient.setQueryData<PostSummary[]>(postKeys.all, [post, other]);

    act(() => result.current.deletePost(post.id));

    await waitFor(() =>
      expect(queryClient.getQueryData(postKeys.all)).toStrictEqual([other]),
    );
  });

  it("reports the request while it runs", async () => {
    let settle!: (result: { id: string }) => void;
    deletePost.mockReturnValue(
      new Promise<{ id: string }>((resolve) => (settle = resolve)),
    );
    const { result } = renderUseDeletePost();

    expect(result.current.isPending).toBe(false);

    act(() => result.current.deletePost(post.id));
    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => settle({ id: post.id }));
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it("shows the sign-in message when the request is unauthorized", async () => {
    deletePost.mockRejectedValue(
      new ApiClientError({ code: "UNAUTHORIZED", message: "Sign in first." }),
    );
    const { result } = renderUseDeletePost();

    act(() => result.current.deletePost(post.id));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(POST_DELETE_UNAUTHORIZED),
    );
  });

  it("shows the failure message for any other error", async () => {
    deletePost.mockRejectedValue(new Error("Network down"));
    const { result } = renderUseDeletePost();

    act(() => result.current.deletePost(post.id));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(POST_DELETE_FAILED),
    );
  });
});
