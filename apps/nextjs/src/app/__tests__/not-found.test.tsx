import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  PAGE_NOT_FOUND_DESCRIPTION,
  PAGE_NOT_FOUND_HOME,
  PAGE_NOT_FOUND_TITLE,
} from "@acme/constants";

import NotFound from "~/app/not-found";

describe("NotFound", () => {
  it("tells the reader that the page does not exist", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: PAGE_NOT_FOUND_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(PAGE_NOT_FOUND_DESCRIPTION)).toBeInTheDocument();
  });

  it("sends the reader back to the home page", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("link", { name: PAGE_NOT_FOUND_HOME }),
    ).toHaveAttribute("href", "/");
  });
});
