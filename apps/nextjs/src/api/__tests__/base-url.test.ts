import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appUrl = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("~/env", () => ({
  env: {
    get APP_URL() {
      return appUrl.value;
    },
  },
}));

const fetchMock = vi.fn();

// The client runs on both sides. In the browser it can read the origin; on the
// server there is no origin to read, and a wrong base sends the request to the
// wrong host entirely.
const requestedHost = async () => {
  const { api } = await import("~/api/client");
  await api.posts.list();
  return new URL(fetchMock.mock.calls[0]?.[0] as string).origin;
};

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response("[]", { headers: { "content-type": "application/json" } }),
  );
  vi.stubGlobal("fetch", fetchMock);
  appUrl.value = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
  // oxlint-disable-next-line no-restricted-properties -- PORT is the fallback under test, and client.ts reads it raw for the same reason.
  delete process.env.PORT;
});

describe("the base URL", () => {
  it("uses the browser origin when there is a window", async () => {
    await expect(requestedHost()).resolves.toBe(window.location.origin);
  });

  it("uses the configured app URL on the server", async () => {
    vi.stubGlobal("window", undefined);
    appUrl.value = "https://example.test";

    await expect(requestedHost()).resolves.toBe("https://example.test");
  });

  it("falls back to the dev port when the server has no app URL", async () => {
    vi.stubGlobal("window", undefined);
    // oxlint-disable-next-line no-restricted-properties -- PORT is the fallback under test, and client.ts reads it raw for the same reason.
    process.env.PORT = "4001";

    await expect(requestedHost()).resolves.toBe("http://localhost:4001");
  });

  it("falls back to port 3000 when nothing sets one", async () => {
    vi.stubGlobal("window", undefined);

    await expect(requestedHost()).resolves.toBe("http://localhost:3000");
  });
});
