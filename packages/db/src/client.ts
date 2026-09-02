import type { PgDatabase } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./schema";

const client = postgres(env.POSTGRES_URL);

export const db = drizzle(client, {
  schema,
  casing: "snake_case",
});

// A transaction handle satisfies this too, which is how a transaction file
// hands one repository call the same handle as the next.
export type Database = PgDatabase<PostgresJsQueryResultHKT, typeof schema>;
