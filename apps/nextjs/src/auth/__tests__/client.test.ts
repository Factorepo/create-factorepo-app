import { describe, expect, it, vi } from "vitest";

const createAuthClient = vi.hoisted(() => vi.fn(() => ({ signIn: vi.fn() })));

vi.mock("better-auth/react", () => ({ createAuthClient }));

describe("the browser auth client", () => {
  // nextjs.md § 8.1 — no base URL, because the API is served from this origin.
  // Passing one here is how a preview deployment starts authenticating against
  // production.
  it("is created with no base URL", async () => {
    const { authClient } = await import("~/auth/client");

    expect(createAuthClient).toHaveBeenCalledWith();
    expect(authClient).toBeDefined();
  });
});
