import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authClient = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("~/utils/auth", () => ({ authClient }));
vi.mock("~/utils/base-url", () => ({
  getBaseUrl: () => "http://10.0.0.1:3000",
}));

import { api, ApiClientError, postKeys } from "~/utils/api";

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const lastCall = () => {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) throw new Error("fetch was never called");
  return { url: call[0] as string, init: call[1] as RequestInit };
};

beforeEach(() => {
  vi.clearAllMocks();
  authClient.getCookie.mockReturnValue("");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the query keys", () => {
  it("nests a detail key under the list key so one invalidation reaches both", () => {
    expect(postKeys.detail("42")).toEqual([...postKeys.all, "42"]);
  });
});

// Each of these addresses the backend by a string. Nothing type-checks that the
// path matches the route, so the assertion is the only thing holding the link.
describe("the request paths", () => {
  it.each([
    ["posts.list", () => api.posts.list(), "/api/posts", "GET"],
    ["posts.byId", () => api.posts.byId("42"), "/api/posts/42", "GET"],
    ["posts.delete", () => api.posts.delete("42"), "/api/posts/42", "DELETE"],
    [
      "likes.create",
      () => api.likes.create("42"),
      "/api/posts/42/likes",
      "POST",
    ],
    ["likes.delete", () => api.likes.delete("7"), "/api/likes/7", "DELETE"],
  ])("%s calls %s", async (_name, run, path, method) => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await run();

    expect(lastCall().url).toBe(`http://10.0.0.1:3000${path}`);
    expect(lastCall().init.method ?? "GET").toBe(method);
  });

  it("sends the new post as a JSON body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await api.posts.create({ title: "t", content: "c" });

    expect(lastCall().init.body).toBe(
      JSON.stringify({ title: "t", content: "c" }),
    );
  });
});

// The native runtime holds no cookie jar, so the session rides on a header the
// client sets by hand. Losing this silently signs every request out.
describe("the session cookie", () => {
  it("attaches the cookie the auth client holds", async () => {
    authClient.getCookie.mockReturnValue("better-auth.session_token=abc");
    fetchMock.mockResolvedValue(jsonResponse([]));

    await api.posts.list();

    const headers = new Headers(lastCall().init.headers);
    expect(headers.get("Cookie")).toBe("better-auth.session_token=abc");
  });

  it("sends no Cookie header when there is no session", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await api.posts.list();

    expect(new Headers(lastCall().init.headers).has("Cookie")).toBe(false);
  });
});

describe("a failed response", () => {
  it("carries the code and the field errors of the server's error body", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid input.",
            fieldErrors: { title: ["Too short"] },
          },
        },
        400,
      ),
    );

    const error = await api.posts.list().catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).code).toBe("BAD_REQUEST");
    expect((error as ApiClientError).fieldErrors).toEqual({
      title: ["Too short"],
    });
  });

  it("falls back to an internal error when the body is not one we recognise", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>502</html>", { status: 502 }),
    );

    const error = await api.posts.list().catch((thrown: unknown) => thrown);

    expect((error as ApiClientError).code).toBe("INTERNAL_SERVER_ERROR");
    expect((error as ApiClientError).message).toContain("502");
  });
});
