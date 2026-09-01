import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_OPEN_GRAPH_URL,
  SITE_PRODUCTION_URL,
} from "@acme/constants";
import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { QueryProvider } from "~/api/react";
import { env } from "~/env";
import "~/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.NODE_ENV === "production"
      ? SITE_PRODUCTION_URL
      : "http://localhost:3000",
  ),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_OPEN_GRAPH_URL,
    siteName: HOME_TITLE,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>{props.children}</QueryProvider>
          <div className="absolute right-4 bottom-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
