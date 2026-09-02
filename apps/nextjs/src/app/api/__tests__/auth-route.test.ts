import { describe, expect, it, vi } from "vitest";

const handler = vi.fn();

vi.mock("~/auth/server", () => ({
  auth: { handler },
  getSession: vi.fn(),
}));

describe("/api/auth/[...all]", () => {
  // Better Auth owns every method under this path. The file exists to hand both
  // verbs to one handler and nothing else.
  it("mounts the Better Auth handler on GET and POST", async () => {
    const route = await import("~/app/api/auth/[...all]/route");

    expect(route.GET).toBe(handler);
    expect(route.POST).toBe(handler);
  });
});
