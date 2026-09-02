import type { z } from "zod/v4";
import { and, eq } from "drizzle-orm";

import type { Database } from "../../client";
import type { CreateLikeSchema } from "./like";
import { db as defaultClient } from "../../client";
import { Like } from "./like";

export type NewLike = z.output<typeof CreateLikeSchema>;

export interface LikeRow {
  id: string;
  postId: string;
}

export const likeRepository = {
  async insert(
    values: NewLike,
    db: Database = defaultClient,
  ): Promise<LikeRow> {
    const [created] = await db
      .insert(Like)
      .values(values)
      .returning({ id: Like.id, postId: Like.postId });

    if (!created) {
      throw new Error("The database returned no row for the inserted like");
    }
    return created;
  },

  async deleteForUser(
    id: string,
    userId: string,
    db: Database = defaultClient,
  ): Promise<string | null> {
    const [deleted] = await db
      .delete(Like)
      .where(and(eq(Like.id, id), eq(Like.createdBy, userId)))
      .returning({ id: Like.id });

    return deleted?.id ?? null;
  },
};
