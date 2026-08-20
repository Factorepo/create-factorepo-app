import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, ApiClientError, postKeys } from "~/api/client";

const ORIGIN = "http://localhost:3000";
const POST_ID = "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11";

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse([]));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api", () => {
  it("addresses each post route", async () => {
    await api.posts.list();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${ORIGIN}/api/posts`);

    await api.posts.byId(POST_ID);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`${ORIGIN}/api/posts/${POST_ID}`);

    await api.posts.create({ title: "A title", content: "A content" });
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`${ORIGIN}/api/posts`);
    expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ title: "A title", content: "A content" }),
    });

    await api.posts.delete(POST_ID);
    expect(fetchMock.mock.calls[3]?.[0]).toBe(`${ORIGIN}/api/posts/${POST_ID}`);
    expect(fetchMock.mock.calls[3]?.[1]).toMatchObject({ method: "DELETE" });
  });

  it("addresses each like route", async () => {
    await api.likes.create(POST_ID);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${ORIGIN}/api/posts/${POST_ID}/likes`,
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });

    await api.likes.delete(POST_ID);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`${ORIGIN}/api/likes/${POST_ID}`);
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: "DELETE" });
  });

  it("throws the code the API assigned to a failure", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { code: "UNAUTHORIZED", message: "Sign in first." } },
        401,
      ),
    );

    await expect(api.posts.list()).rejects.toMatchObject({
      name: "ApiClientError",
      code: "UNAUTHORIZED",
      message: "Sign in first.",
    });
  });

  it("throws an internal error when the body carries no API error", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 500 }));

    await expect(api.posts.list()).rejects.toBeInstanceOf(ApiClientError);
    await expect(api.posts.list()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});

describe("postKeys", () => {
  it("keys one post under the list it belongs to", () => {
    expect(postKeys.all).toStrictEqual(["posts"]);
    expect(postKeys.detail(POST_ID)).toStrictEqual(["posts", POST_ID]);
  });
});
