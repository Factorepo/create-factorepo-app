import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from "@acme/constants";

import { user } from "../../auth-schema";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: POST_TITLE_MAX_LENGTH }).notNull(),
  content: t.text().notNull(),
  createdBy: t
    .uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  updatedBy: t.uuid().references(() => user.id, { onDelete: "set null" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(POST_TITLE_MAX_LENGTH),
  content: z.string().max(POST_CONTENT_MAX_LENGTH),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});
