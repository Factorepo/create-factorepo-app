import { beforeEach, describe, expect, it, vi } from "vitest";

const initAuth = vi.hoisted(() =>
  vi.fn(() => ({ api: { getSession: vi.fn() } })),
);
const headers = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@acme/auth", () => ({ initAuth }));
vi.mock("next/headers", () => ({ headers }));
const appUrl = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("~/env", () => ({
  env: {
    get APP_URL() {
      return appUrl.value;
    },
    AUTH_SECRET: "a-secret",
    AUTH_DISCORD_ID: "discord-id",
    AUTH_DISCORD_SECRET: "discord-secret",
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  appUrl.value = "https://example.test";
  headers.mockResolvedValue(new Headers({ cookie: "session=abc" }));
});

describe("the auth instance", () => {
  // auth.md § 1.3 — the factory is called exactly once, here. A second instance
  // would hold a second session store and sign users out at random.
  it("is built once, from the environment module", async () => {
    await import("~/auth/server");

    expect(initAuth).toHaveBeenCalledOnce();
    expect(initAuth).toHaveBeenCalledWith({
      baseUrl: "https://example.test",
      secret: "a-secret",
      discordClientId: "discord-id",
      discordClientSecret: "discord-secret",
    });
  });

  // A deployment that forgets APP_URL would otherwise build every OAuth
  // callback against `undefined`, and the provider would reject all of them.
  it("falls back to localhost when no app URL is configured", async () => {
    appUrl.value = undefined;

    await import("~/auth/server");

    expect(initAuth).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: "http://localhost:3000" }),
    );
  });
});

describe("getSession", () => {
  it("forwards the incoming request headers", async () => {
    const { auth, getSession } = await import("~/auth/server");

    await getSession();

    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: await headers(),
    });
  });
});
