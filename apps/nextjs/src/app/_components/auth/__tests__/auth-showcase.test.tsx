import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_SIGN_IN, AUTH_SIGN_OUT, authSignedInAs } from "@acme/constants";

import { AuthShowcase } from "~/app/_components/auth/auth-showcase";

const getSession = vi.hoisted(() => vi.fn());
const signInSocial = vi.hoisted(() => vi.fn());
const signOut = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());
const headers = vi.hoisted(() => vi.fn());

vi.mock("~/auth/server", () => ({
  getSession,
  auth: { api: { signInSocial, signOut } },
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ headers }));

type WithChildren = ReactElement<{
  children: ReactElement | ReactElement[];
}>;
type WithAction = ReactElement<{ formAction: () => Promise<void> }>;

// The control is a server action, so it never reaches the DOM as a handler.
// Reading it off the returned element is the only way to run it.
const actionOf = (element: ReactElement, path: number[]) => {
  let node = element as WithChildren;
  for (const index of path) {
    const children = node.props.children;
    node = (
      Array.isArray(children) ? children[index] : children
    ) as WithChildren;
  }
  return (node as unknown as WithAction).props.formAction;
};

beforeEach(() => {
  vi.clearAllMocks();
  headers.mockResolvedValue(new Headers());
});

describe("AuthShowcase", () => {
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

describe("signing in", () => {
  beforeEach(() => {
    getSession.mockResolvedValue(null);
  });

  it("sends the reader to the URL the provider returned", async () => {
    signInSocial.mockResolvedValue({ url: "https://discord.test/oauth" });

    await actionOf(await AuthShowcase(), [0])();

    expect(signInSocial).toHaveBeenCalledWith({
      body: { provider: "discord" },
    });
    expect(redirect).toHaveBeenCalledWith("https://discord.test/oauth");
  });

  // Redirecting to `undefined` would land the reader on a 404 with no clue why.
  it("throws when the provider returned no URL", async () => {
    signInSocial.mockResolvedValue({});

    await expect(actionOf(await AuthShowcase(), [0])()).rejects.toThrowError(
      /No URL returned/,
    );
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("signing out", () => {
  it("ends the session and returns the reader to the root", async () => {
    getSession.mockResolvedValue({ user: { name: "Ada" } });
    signOut.mockResolvedValue(undefined);

    await actionOf(await AuthShowcase(), [1, 0])();

    expect(signOut).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
