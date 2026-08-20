import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_DESCRIPTION, HOME_TITLE } from "@acme/constants";

import { postKeys } from "~/api/client";
import HomePage, { metadata } from "~/app/page";

const getAllPosts = vi.fn();
const prefetch = vi.fn();

vi.mock("@acme/api", () => ({ getAllPosts: () => getAllPosts() }));

vi.mock("~/api/server", () => ({
  HydrateClient: (props: { children: React.ReactNode }) => (
    <div data-testid="hydrate-client">{props.children}</div>
  ),
  prefetch: (options: unknown) => prefetch(options),
}));

vi.mock("~/app/_components/auth/auth-showcase", () => ({
  AuthShowcase: () => <div data-testid="auth-showcase" />,
}));

vi.mock("~/app/_components/post/create-post-form", () => ({
  CreatePostForm: () => <div data-testid="create-post-form" />,
}));

vi.mock("~/app/_components/post/post-list", () => ({
  PostList: () => <div data-testid="post-list" />,
}));

describe("HomePage", () => {
  beforeEach(() => {
    getAllPosts.mockReset();
    prefetch.mockReset();
  });

  it("carries a title and a description", () => {
    expect(metadata.title).toBe(HOME_TITLE);
    expect(metadata.description).toBe(HOME_DESCRIPTION);
  });

  it("composes the auth control, the form, and the list", () => {
    render(<HomePage />);

    expect(screen.getByTestId("hydrate-client")).toBeInTheDocument();
    expect(screen.getByTestId("auth-showcase")).toBeInTheDocument();
    expect(screen.getByTestId("create-post-form")).toBeInTheDocument();
    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("warms the key the list reads, from the endpoint of the list", () => {
    render(<HomePage />);

    const options = prefetch.mock.calls[0]?.[0] as {
      queryKey: readonly string[];
      queryFn: () => unknown;
    };

    expect(options.queryKey).toStrictEqual(postKeys.all);

    options.queryFn();
    expect(getAllPosts).toHaveBeenCalledTimes(1);
  });
});
