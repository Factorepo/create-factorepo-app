import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PostSummary } from "@acme/api";
import { POST_DELETE_SUBMIT } from "@acme/constants";

import { PostCard } from "~/app/_components/post/post-card";

const deletePost = vi.fn();
const createLike = vi.fn();

vi.mock("~/api/client", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    api: {
      likes: { create: (id: string) => createLike(id) },
      posts: { delete: (id: string) => deletePost(id) },
    },
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

const renderPostCard = (props: { post: PostSummary }) => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<PostCard {...props} />, { wrapper: Wrapper });
};

describe("PostCard", () => {
  beforeEach(() => {
    deletePost.mockReset();
    createLike.mockReset();
  });

  it("renders the title, the content, and the like count", () => {
    renderPostCard({ post });

    expect(
      screen.getByRole("heading", { name: post.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(post.content)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders a post nobody liked yet", () => {
    renderPostCard({ post: { ...post, likeCount: 0 } });

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("likes the post it renders", async () => {
    const user = userEvent.setup();
    renderPostCard({ post });

    await user.click(screen.getByRole("button", { name: /3/ }));

    expect(createLike).toHaveBeenCalledWith(post.id);
  });

  it("deletes the post it renders", async () => {
    const user = userEvent.setup();
    renderPostCard({ post });

    await user.click(screen.getByRole("button", { name: POST_DELETE_SUBMIT }));

    expect(deletePost).toHaveBeenCalledWith(post.id);
  });
});
