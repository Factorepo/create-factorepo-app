import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  PAGE_ERROR_DESCRIPTION,
  PAGE_ERROR_RETRY,
  PAGE_ERROR_TITLE,
} from "@acme/constants";

import HomeError from "~/app/error";

describe("HomeError", () => {
  it("tells the reader that the page failed", () => {
    render(<HomeError error={new Error("Network down")} reset={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: PAGE_ERROR_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(PAGE_ERROR_DESCRIPTION)).toBeInTheDocument();
  });

  it("runs the retry the framework handed it", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<HomeError error={new Error("Network down")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: PAGE_ERROR_RETRY }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
