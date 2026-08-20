import type { z } from "zod/v4";
import { eq, sql } from "drizzle-orm";

import type { CreatePostSchema } from "./post";
import { db } from "../../client";
import { Like } from "../like/like";
import { Post } from "./post";

export type NewPost = z.output<typeof CreatePostSchema>;

export interface PostRow {
  id: string;
  title: string;
  content: string;
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
  createdAt: Post.createdAt,
  updatedAt: Post.updatedAt,
  likeCount: sql<number>`cast(count(${Like.id}) as integer)`,
};

export const postRepository = {
  async findAllSummaries(): Promise<PostSummaryRow[]> {
    return await db
      .select(summaryColumns)
      .from(Post)
      .leftJoin(Like, eq(Post.id, Like.postId))
      .groupBy(Post.id);
  },

  async findSummaryById(id: string): Promise<PostSummaryRow | null> {
    const [post] = await db
      .select(summaryColumns)
      .from(Post)
      .leftJoin(Like, eq(Post.id, Like.postId))
      .where(eq(Post.id, id))
      .groupBy(Post.id);

    return post ?? null;
  },

  async insert(values: NewPost): Promise<PostRow> {
    const [created] = await db.insert(Post).values(values).returning();

    if (!created) {
      throw new Error("The database returned no row for the inserted post");
    }
    return created;
  },

  async deleteById(id: string): Promise<string | null> {
    const [deleted] = await db
      .delete(Post)
      .where(eq(Post.id, id))
      .returning({ id: Post.id });

    return deleted?.id ?? null;
  },
};
