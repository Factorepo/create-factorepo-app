import type { ErrorInfo, ReactNode } from "react";
import { Component, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PostSummary } from "@acme/api";
import { POST_LIST_EMPTY } from "@acme/constants";

import { PostList } from "~/app/_components/post/post-list";

const listPosts = vi.fn();
const postCard = vi.fn();

vi.mock("~/api/client", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return { ...actual, api: { posts: { list: () => listPosts() } } };
});

vi.mock("~/app/_components/post/post-card", () => ({
  PostCard: (props: { post: PostSummary }) => {
    postCard(props);
    return <article data-testid="post-card">{props.post.title}</article>;
  },
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
  title: "The build runs twice",
};

const FAILED = "The list failed";
const LOADING = "The list is loading";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    return undefined;
  }

  render() {
    return this.state.failed ? <p>{FAILED}</p> : this.props.children;
  }
}

const renderPostList = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Boundary>
        <Suspense fallback={<p>{LOADING}</p>}>
          <PostList />
        </Suspense>
      </Boundary>
    </QueryClientProvider>,
  );
};

describe("PostList", () => {
  beforeEach(() => {
    listPosts.mockReset();
    postCard.mockReset();
  });

  it("renders one card for each post, and hands the post to it", async () => {
    listPosts.mockResolvedValue([post, other]);
    renderPostList();

    await waitFor(() =>
      expect(screen.getAllByTestId("post-card")).toHaveLength(2),
    );
    expect(postCard).toHaveBeenCalledWith({ post });
    expect(postCard).toHaveBeenCalledWith({ post: other });
  });

  it("tells the reader when no post exists yet", async () => {
    listPosts.mockResolvedValue([]);
    renderPostList();

    expect(await screen.findByText(POST_LIST_EMPTY)).toBeInTheDocument();
    expect(screen.queryAllByTestId("post-card")).toHaveLength(0);
  });

  it("holds the fallback while the posts load", () => {
    listPosts.mockReturnValue(new Promise(() => undefined));
    renderPostList();

    expect(screen.getByText(LOADING)).toBeInTheDocument();
  });

  it("gives the failure to the boundary above it", async () => {
    listPosts.mockRejectedValue(new Error("Network down"));
    renderPostList();

    expect(await screen.findByText(FAILED)).toBeInTheDocument();
  });
});
