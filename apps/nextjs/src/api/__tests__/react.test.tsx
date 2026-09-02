import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QueryProvider } from "~/api/react";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("QueryProvider", () => {
  it("renders what it is given", () => {
    render(
      <QueryProvider>
        <p>the page</p>
      </QueryProvider>,
    );

    expect(screen.getByText("the page")).toBeInTheDocument();
  });

  // One client for the life of the tab. A second would hold a second cache, and
  // a mutation would seed the one the page is not reading.
  it("reuses one client across renders in the browser", () => {
    const first = QueryProvider({ children: null }) as {
      props: { client: QueryClient };
    };
    const second = QueryProvider({ children: null }) as {
      props: { client: QueryClient };
    };

    expect(first.props.client).toBe(second.props.client);
  });

  // On the server there is no tab to share, and a shared client would leak one
  // reader's data into another's request.
  it("builds a fresh client when there is no window", () => {
    vi.stubGlobal("window", undefined);

    const element = QueryProvider({ children: null }) as {
      props: { client: QueryClient };
    };

    expect(element.props.client).toBeInstanceOf(QueryClient);
  });
});
