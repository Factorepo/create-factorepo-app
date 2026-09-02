import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "../../auth-schema";
import { Post } from "../post/post";

export const Like = pgTable("like", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  postId: t
    .uuid()
    .notNull()
    .references(() => Post.id, { onDelete: "cascade" }),
  createdBy: t
    .uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateLikeSchema = createInsertSchema(Like, {
  postId: z.uuid().nonempty(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
