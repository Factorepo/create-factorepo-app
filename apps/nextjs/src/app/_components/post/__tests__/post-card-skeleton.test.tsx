import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PostCardSkeleton } from "~/app/_components/post/post-card-skeleton";

describe("PostCardSkeleton", () => {
  it("renders one placeholder card", () => {
    const { container } = render(<PostCardSkeleton />);

    expect(
      container.querySelectorAll("[data-slot='post-card-skeleton']"),
    ).toHaveLength(1);
  });

  it("pulses by default, and holds still when it is asked to", () => {
    const { container: pulsing } = render(<PostCardSkeleton />);
    expect(pulsing.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );

    const { container: still } = render(<PostCardSkeleton pulse={false} />);
    expect(still.querySelectorAll(".animate-pulse")).toHaveLength(0);
  });
});
