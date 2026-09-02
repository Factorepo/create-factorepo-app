import { describe, expect, it, vi } from "vitest";

// Each route file is bindings only, so the thing worth testing is which route
// object method landed on which HTTP verb. Nothing type-checks that pairing —
// `postRoutes.remove` on GET compiles perfectly and deletes on a read.
const AUTH = Symbol("auth instance");
const PREFLIGHT = Symbol("corsPreflight");

vi.mock("@acme/api", () => ({
  apiRoute: (auth: unknown, handler: unknown) => ({ auth, handler }),
  corsPreflight: PREFLIGHT,
  postRoutes: {
    list: "postRoutes.list",
    byId: "postRoutes.byId",
    create: "postRoutes.create",
    remove: "postRoutes.remove",
  },
  likeRoutes: {
    create: "likeRoutes.create",
    remove: "likeRoutes.remove",
  },
}));

vi.mock("~/auth/server", () => ({
  auth: AUTH,
  getSession: vi.fn(),
}));

const boundTo = (method: unknown) => (method as { handler: string }).handler;
const authOf = (method: unknown) => (method as { auth: symbol }).auth;

describe("/api/posts", () => {
  it("binds the collection verbs to the collection endpoints", async () => {
    const route = await import("~/app/api/posts/route");

    expect(boundTo(route.GET)).toBe("postRoutes.list");
    expect(boundTo(route.POST)).toBe("postRoutes.create");
    expect(route.OPTIONS).toBe(PREFLIGHT);
  });
});

describe("/api/posts/[id]", () => {
  it("binds the item verbs to the item endpoints", async () => {
    const route = await import("~/app/api/posts/[id]/route");

    expect(boundTo(route.GET)).toBe("postRoutes.byId");
    expect(boundTo(route.DELETE)).toBe("postRoutes.remove");
    expect(route.OPTIONS).toBe(PREFLIGHT);
  });
});

describe("/api/posts/[id]/likes", () => {
  it("binds POST to creating a like", async () => {
    const route = await import("~/app/api/posts/[id]/likes/route");

    expect(boundTo(route.POST)).toBe("likeRoutes.create");
    expect(route.OPTIONS).toBe(PREFLIGHT);
  });
});

describe("/api/likes/[id]", () => {
  it("binds DELETE to removing a like", async () => {
    const route = await import("~/app/api/likes/[id]/route");

    expect(boundTo(route.DELETE)).toBe("likeRoutes.remove");
    expect(route.OPTIONS).toBe(PREFLIGHT);
  });
});

describe("every route", () => {
  it("takes the one auth instance rather than building its own", async () => {
    const posts = await import("~/app/api/posts/route");
    const post = await import("~/app/api/posts/[id]/route");
    const likes = await import("~/app/api/posts/[id]/likes/route");
    const like = await import("~/app/api/likes/[id]/route");

    for (const method of [
      posts.GET,
      posts.POST,
      post.GET,
      post.DELETE,
      likes.POST,
      like.DELETE,
    ]) {
      expect(authOf(method)).toBe(AUTH);
    }
  });
});
