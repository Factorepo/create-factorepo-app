import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_SIGN_IN, AUTH_SIGN_OUT, authSignedInAs } from "@acme/constants";

import { AuthShowcase } from "~/app/_components/auth/auth-showcase";

const getSession = vi.fn();

vi.mock("~/auth/server", () => ({
  getSession: () => getSession(),
  auth: { api: { signInSocial: vi.fn(), signOut: vi.fn() } },
}));

describe("AuthShowcase", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("offers the sign-in control to a reader without a session", async () => {
    getSession.mockResolvedValue(null);

    render(await AuthShowcase());

    expect(
      screen.getByRole("button", { name: AUTH_SIGN_IN }),
    ).toBeInTheDocument();
  });

  it("names the reader who holds a session, and offers the sign-out control", async () => {
    getSession.mockResolvedValue({ user: { name: "Ada" } });

    render(await AuthShowcase());

    expect(screen.getByText(authSignedInAs("Ada"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: AUTH_SIGN_OUT }),
    ).toBeInTheDocument();
  });
});
