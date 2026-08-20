import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  POST_LIKE_FAILED,
  POST_LIKE_SUCCEEDED,
  POST_LIKE_UNAUTHORIZED,
} from "@acme/constants";
import { toast } from "@acme/ui/toast";

import { ApiClientError, postKeys } from "~/api/client";
import { useLikePost } from "~/app/_components/hooks/use-like-post";

const createLike = vi.fn();

vi.mock("~/api/client", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    api: { likes: { create: (postId: string) => createLike(postId) } },
  };
});

vi.mock("@acme/ui/toast", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const POST_ID = "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11";

const renderUseLikePost = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, ...renderHook(() => useLikePost(), { wrapper }) };
};

describe("useLikePost", () => {
  beforeEach(() => {
    createLike.mockReset();
    vi.mocked(toast.error).mockReset();
    vi.mocked(toast.success).mockReset();
  });

  it("reads the post list again after the like lands", async () => {
    createLike.mockResolvedValue({ id: "a-like", postId: POST_ID });
    const { result, queryClient } = renderUseLikePost();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    act(() => result.current.likePost(POST_ID));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(POST_LIKE_SUCCEEDED),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: postKeys.all });
  });

  it("reports the request while it runs", async () => {
    let settle!: (result: { id: string; postId: string }) => void;
    createLike.mockReturnValue(
      new Promise<{ id: string; postId: string }>(
        (resolve) => (settle = resolve),
      ),
    );
    const { result } = renderUseLikePost();

    expect(result.current.isPending).toBe(false);

    act(() => result.current.likePost(POST_ID));
    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => settle({ id: "a-like", postId: POST_ID }));
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it("shows the sign-in message when the request is unauthorized", async () => {
    createLike.mockRejectedValue(
      new ApiClientError({ code: "UNAUTHORIZED", message: "Sign in first." }),
    );
    const { result } = renderUseLikePost();

    act(() => result.current.likePost(POST_ID));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(POST_LIKE_UNAUTHORIZED),
    );
  });

  it("shows the failure message for any other error", async () => {
    createLike.mockRejectedValue(new Error("Network down"));
    const { result } = renderUseLikePost();

    act(() => result.current.likePost(POST_ID));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(POST_LIKE_FAILED),
    );
  });
});
