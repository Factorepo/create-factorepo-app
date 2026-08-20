import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomeLoading from "~/app/loading";

describe("HomeLoading", () => {
  it("holds the place of the post list", () => {
    const { container } = render(<HomeLoading />);

    expect(
      container.querySelectorAll("[data-slot='post-card-skeleton']"),
    ).toHaveLength(3);
  });
});
