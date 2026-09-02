import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PostSummary } from "@acme/api";
import {
  POST_CONTENT_LABEL,
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_TOO_LONG,
  POST_CREATE_SUBMIT,
  POST_CREATE_UNAUTHORIZED,
  POST_TITLE_LABEL,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_TOO_LONG,
} from "@acme/constants";

import { ApiClientError } from "~/api/client";
import { CreatePostForm } from "~/app/_components/post/create-post-form";

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

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<CreatePostForm />, { wrapper: Wrapper });
};

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(POST_TITLE_LABEL), input.title);
  await user.type(screen.getByLabelText(POST_CONTENT_LABEL), input.content);
};

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: POST_CREATE_SUBMIT }));

describe("CreatePostForm", () => {
  beforeEach(() => {
    createPost.mockReset();
    createPost.mockResolvedValue(created);
  });

  it("opens with an empty title and an empty content", () => {
    renderForm();

    expect(screen.getByLabelText(POST_TITLE_LABEL)).toHaveValue("");
    expect(screen.getByLabelText(POST_CONTENT_LABEL)).toHaveValue("");
  });

  it("sends the title and the content it holds", async () => {
    const user = userEvent.setup();
    renderForm();

    await fill(user);
    await submit(user);

    await waitFor(() => expect(createPost).toHaveBeenCalledWith(input));
  });

  it("empties the fields after the post lands", async () => {
    const user = userEvent.setup();
    renderForm();

    await fill(user);
    await submit(user);

    await waitFor(() =>
      expect(screen.getByLabelText(POST_TITLE_LABEL)).toHaveValue(""),
    );
    expect(screen.getByLabelText(POST_CONTENT_LABEL)).toHaveValue("");
  });

  it("refuses a title over the limit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByLabelText(POST_TITLE_LABEL));
    await user.paste("a".repeat(POST_TITLE_MAX_LENGTH + 1));
    await submit(user);

    expect(await screen.findByText(POST_TITLE_TOO_LONG)).toBeInTheDocument();
    expect(createPost).not.toHaveBeenCalled();
  });

  it("refuses a content over the limit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByLabelText(POST_CONTENT_LABEL));
    await user.paste("a".repeat(POST_CONTENT_MAX_LENGTH + 1));
    await submit(user);

    expect(await screen.findByText(POST_CONTENT_TOO_LONG)).toBeInTheDocument();
    expect(createPost).not.toHaveBeenCalled();
  });

  it("holds the submit control while the request runs", async () => {
    createPost.mockReturnValue(new Promise(() => undefined));
    const user = userEvent.setup();
    renderForm();

    await fill(user);
    await submit(user);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: POST_CREATE_SUBMIT }),
      ).toBeDisabled(),
    );
  });

  it("shows the request error and keeps the input after a failure", async () => {
    createPost.mockRejectedValue(
      new ApiClientError({ code: "UNAUTHORIZED", message: "Sign in first." }),
    );
    const user = userEvent.setup();
    renderForm();

    await fill(user);
    await submit(user);

    expect(
      await screen.findByText(POST_CREATE_UNAUTHORIZED),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(POST_TITLE_LABEL)).toHaveValue(input.title);
    expect(screen.getByLabelText(POST_CONTENT_LABEL)).toHaveValue(
      input.content,
    );
  });
});
