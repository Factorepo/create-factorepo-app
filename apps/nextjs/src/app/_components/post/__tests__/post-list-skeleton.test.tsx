import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PostListSkeleton } from "~/app/_components/post/post-list-skeleton";

describe("PostListSkeleton", () => {
  it("renders three placeholder cards", () => {
    const { container } = render(<PostListSkeleton />);

    expect(
      container.querySelectorAll("[data-slot='post-card-skeleton']"),
    ).toHaveLength(3);
  });

  it("passes the pulse it is given to every card", () => {
    const { container } = render(<PostListSkeleton pulse={false} />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(0);
  });
});
