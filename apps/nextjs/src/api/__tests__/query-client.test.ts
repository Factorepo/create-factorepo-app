import type { Query } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "~/api/query-client";

const queryWithStatus = (status: string) =>
  ({ state: { status } }) as unknown as Query;

describe("createQueryClient", () => {
  it("holds a fetched query fresh long enough to survive a navigation", () => {
    expect(createQueryClient().getDefaultOptions().queries?.staleTime).toBe(
      30 * 1000,
    );
  });

  // A pending query has to cross the wire too, or a client component that was
  // prefetched on the server starts its own second request on mount.
  it("dehydrates a query that is still pending", () => {
    const dehydrate = createQueryClient().getDefaultOptions().dehydrate;

    expect(dehydrate?.shouldDehydrateQuery?.(queryWithStatus("pending"))).toBe(
      true,
    );
  });

  it("dehydrates a query that has already settled", () => {
    const dehydrate = createQueryClient().getDefaultOptions().dehydrate;

    expect(dehydrate?.shouldDehydrateQuery?.(queryWithStatus("success"))).toBe(
      true,
    );
  });

  it("leaves a failed query behind", () => {
    const dehydrate = createQueryClient().getDefaultOptions().dehydrate;

    expect(dehydrate?.shouldDehydrateQuery?.(queryWithStatus("error"))).toBe(
      false,
    );
  });

  // Next reads its own server error to decide a page is dynamic, so redacting
  // it hides the very thing the framework is looking for.
  it("never redacts an error", () => {
    const dehydrate = createQueryClient().getDefaultOptions().dehydrate;

    expect(dehydrate?.shouldRedactErrors?.(new Error("boom"))).toBe(false);
  });
});
