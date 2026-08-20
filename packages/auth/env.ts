// oxlint-disable no-restricted-properties -- This is the environment module,
// the one door to the raw environment. Every other file imports from it.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    server: {
      AUTH_DISCORD_ID: z.string().min(1),
      AUTH_DISCORD_SECRET: z.string().min(1),
      AUTH_SECRET:
        process.env.NODE_ENV === "production"
          ? z.string().min(1)
          : z.string().min(1).optional(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI ||
      ["lint", "typegen"].includes(process.env.npm_lifecycle_event ?? ""),
  });
}
