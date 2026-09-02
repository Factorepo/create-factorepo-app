import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_DESCRIPTION, HOME_TITLE } from "@acme/constants";

const nodeEnv = vi.hoisted(() => ({ value: "development" }));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));
vi.mock("~/env", () => ({
  env: {
    get NODE_ENV() {
      return nodeEnv.value;
    },
  },
}));
vi.mock("@acme/ui/theme", () => ({
  ThemeProvider: (props: { children: React.ReactNode }) => props.children,
  ThemeToggle: () => null,
}));
vi.mock("@acme/ui/toast", () => ({ Toaster: () => null }));
vi.mock("~/api/react", () => ({
  QueryProvider: (props: { children: React.ReactNode }) => props.children,
}));

afterEach(() => {
  vi.resetModules();
  nodeEnv.value = "development";
});

describe("the root layout", () => {
  it("renders the page it wraps", async () => {
    const { default: RootLayout } = await import("~/app/layout");

    render(
      <RootLayout>
        <p>the page</p>
      </RootLayout>,
    );

    expect(screen.getByText("the page")).toBeInTheDocument();
  });

  // nextjs.md § 5.1 — the root layout supplies every field a page does not, so
  // a page that forgets a title still ships one.
  it("supplies the site title and description", async () => {
    const { metadata } = await import("~/app/layout");

    expect(metadata.title).toBe(HOME_TITLE);
    expect(metadata.description).toBe(HOME_DESCRIPTION);
    expect(metadata.openGraph?.title).toBe(HOME_TITLE);
  });

  it("gives both colour schemes a theme colour", async () => {
    const { viewport } = await import("~/app/layout");

    expect(viewport.themeColor).toHaveLength(2);
  });

  // A relative Open Graph image resolves against this, so pointing it at
  // localhost in production ships previews nobody outside the machine can load.
  it("resolves metadata against localhost outside production", async () => {
    const { metadata } = await import("~/app/layout");

    expect(String(metadata.metadataBase)).toBe("http://localhost:3000/");
  });

  it("resolves metadata against the real site in production", async () => {
    nodeEnv.value = "production";
    vi.resetModules();

    const { metadata } = await import("~/app/layout");

    expect(String(metadata.metadataBase)).not.toBe("http://localhost:3000/");
  });
});
