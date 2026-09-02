import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "~/proxy";

const SECURE = "__Secure-better-auth.session_token";
const INSECURE = "better-auth.session_token";

const requestFor = (path: string, cookie?: string) => {
  const request = new NextRequest(new URL(path, "https://example.test"));
  if (cookie) request.cookies.set(cookie, "a-token");
  return request;
};

describe("the page guard", () => {
  // Better Auth names the cookie differently over http and https, so a guard
  // that knows only one name signs every user out on the other protocol.
  it.each([INSECURE, SECURE])("lets a reader holding %s through", (cookie) => {
    const res = proxy(requestFor("/admin", cookie));

    expect(res.headers.get("location")).toBeNull();
  });

  it("sends a reader with no session to sign in", () => {
    const res = proxy(requestFor("/admin"));

    expect(res.headers.get("location")).toBe("https://example.test/login");
  });

  it("leaves an unprotected route alone", () => {
    const res = proxy(requestFor("/"));

    expect(res.headers.get("location")).toBeNull();
  });

  it("guards everything under the protected prefix, not just its root", () => {
    const res = proxy(requestFor("/admin/users/42"));

    expect(res.headers.get("location")).toBe("https://example.test/login");
  });
});

describe("the matcher", () => {
  // The API answers 401 on its own and never redirects, and running the guard
  // over static assets costs a function invocation per image.
  it.each(["api", "_next/static", "_next/image", "favicon.ico"])(
    "keeps the guard away from %s",
    (excluded) => {
      expect(config.matcher[0]).toContain(excluded);
    },
  );
});
