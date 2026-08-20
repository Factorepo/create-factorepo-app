import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./client";

export const authAdapter: ReturnType<typeof drizzleAdapter> = drizzleAdapter(
  db,
  {
    provider: "pg",
    usePlural: false,
  },
);
