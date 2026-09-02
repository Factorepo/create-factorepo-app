import type { z } from "zod/v4";
import { and, eq, sql } from "drizzle-orm";

import type { Database } from "../../client";
import type { CreatePostSchema } from "./post";
import { db as defaultClient } from "../../client";
import { Like } from "../like/like";
import { Post } from "./post";

export type NewPost = z.output<typeof CreatePostSchema>;

export interface PostRow {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface PostSummaryRow extends PostRow {
  likeCount: number;
}

const summaryColumns = {
  id: Post.id,
  title: Post.title,
  content: Post.content,
  createdBy: Post.createdBy,
  updatedBy: Post.updatedBy,
  createdAt: Post.createdAt,
  updatedAt: Post.updatedAt,
  likeCount: sql<number>`cast(count(${Like.id}) as integer)`,
};

export const postRepository = {
  async findAllSummaries(
    db: Database = defaultClient,
  ): Promise<PostSummaryRow[]> {
    return await db
      .select(summaryColumns)
      .from(Post)
      .leftJoin(Like, eq(Post.id, Like.postId))
      .groupBy(Post.id);
  },

  async findSummaryById(
    id: string,
    db: Database = defaultClient,
  ): Promise<PostSummaryRow | null> {
    const [post] = await db
      .select(summaryColumns)
      .from(Post)
      .leftJoin(Like, eq(Post.id, Like.postId))
      .where(eq(Post.id, id))
      .groupBy(Post.id);

    return post ?? null;
  },

  async insert(
    values: NewPost,
    db: Database = defaultClient,
  ): Promise<PostRow> {
    const [created] = await db.insert(Post).values(values).returning();

    if (!created) {
      throw new Error("The database returned no row for the inserted post");
    }
    return created;
  },

  async deleteForUser(
    id: string,
    userId: string,
    db: Database = defaultClient,
  ): Promise<string | null> {
    const [deleted] = await db
      .delete(Post)
      .where(and(eq(Post.id, id), eq(Post.createdBy, userId)))
      .returning({ id: Post.id });

    return deleted?.id ?? null;
  },
};
