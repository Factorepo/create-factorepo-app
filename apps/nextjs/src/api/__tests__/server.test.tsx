import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createApiContext = vi.hoisted(() => vi.fn());
const headers = vi.hoisted(() => vi.fn());
const prefetchQuery = vi.hoisted(() => vi.fn());

vi.mock("@acme/api", () => ({ createApiContext }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("~/auth/server", () => ({ auth: { api: {} }, getSession: vi.fn() }));
// A real client, because `dehydrate` reads its caches. Only the prefetch is a
// spy, so the assertion can see what the page asked for.
vi.mock("~/api/query-client", async () => {
  const { QueryClient: RealQueryClient } =
    await import("@tanstack/react-query");

  return {
    createQueryClient: () => {
      const client = new RealQueryClient();
      client.prefetchQuery = prefetchQuery;
      return client;
    },
  };
});

import { createContext, HydrateClient, prefetch } from "~/api/server";

beforeEach(() => {
  vi.clearAllMocks();
  headers.mockResolvedValue(new Headers({ cookie: "session=abc" }));
  createApiContext.mockResolvedValue({ session: null });
});

describe("createContext", () => {
  // nextjs.md § 8.2 — a server component runs inside the request, so the
  // caller's headers have to be carried over by hand or every read is anonymous.
  it("forwards the incoming headers into the API context", async () => {
    await createContext();

    expect(createApiContext).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      auth: expect.anything(),
    });

    const passed = createApiContext.mock.calls[0]?.[0] as { headers: Headers };
    expect(passed.headers.get("cookie")).toBe("session=abc");
  });
});

describe("prefetch", () => {
  it("warms the cache the client component will read", () => {
    prefetch({ queryKey: ["posts"], queryFn: () => Promise.resolve([]) });

    expect(prefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["posts"] }),
    );
  });
});

describe("HydrateClient", () => {
  it("renders its children inside the hydration boundary", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <HydrateClient>
          <p>the list</p>
        </HydrateClient>
      </QueryClientProvider>,
    );

    expect(screen.getByText("the list")).toBeInTheDocument();
  });
});
