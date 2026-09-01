// oxlint-disable no-restricted-properties -- This is the environment module,
// the one door to the raw environment. Every other file imports from it.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

import { authEnv } from "@acme/auth/env";

export const env = createEnv({
  extends: [authEnv()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    POSTGRES_URL: z.url(),
    APP_URL:
      process.env.NODE_ENV === "production" ? z.url() : z.url().optional(),
  },
  client: {},
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation:
    !!process.env.CI ||
    ["lint", "test", "typegen"].includes(process.env.npm_lifecycle_event ?? ""),
});
