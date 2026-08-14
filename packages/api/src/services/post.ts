import { z } from "zod/v4";

import { eq, sql } from "@acme/db";
import { CreatePostSchema, Like, Post } from "@acme/db/schema";

import type { ApiContext } from "../context";
import { requireSession } from "../context";
import { ApiError, parseInput } from "../errors";

/**
 * A post as it goes over the wire. Timestamps are ISO strings because JSON has
 * no date type — parse them on the client if you need `Date` instances.
 */
export interface PostSummary {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
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

const toSummary = (row: {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  likeCount: number;
}): PostSummary => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt?.toISOString() ?? null,
});

const PostId = z.uuid();

export async function getAllPosts(ctx: ApiContext): Promise<PostSummary[]> {
  const posts = await ctx.db
    .select(summaryColumns)
    .from(Post)
    .leftJoin(Like, eq(Post.id, Like.postId))
    .groupBy(Post.id);

  return posts.map(toSummary);
}

export async function getPost(
  ctx: ApiContext,
  id: string,
): Promise<PostSummary> {
  const postId = parseInput(PostId, id);

  const [post] = await ctx.db
    .select(summaryColumns)
    .from(Post)
    .leftJoin(Like, eq(Post.id, Like.postId))
    .where(eq(Post.id, postId))
    .groupBy(Post.id);

  if (!post) {
    throw new ApiError({ code: "NOT_FOUND", message: "Post not found" });
  }
  return toSummary(post);
}

export async function createPost(
  ctx: ApiContext,
  input: unknown,
): Promise<PostSummary> {
  const authed = requireSession(ctx);
  const values = parseInput(CreatePostSchema, input);

  const [created] = await authed.db.insert(Post).values(values).returning();

  if (!created) {
    throw new ApiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create post",
    });
  }
  return toSummary({ ...created, likeCount: 0 });
}

export async function deletePost(
  ctx: ApiContext,
  id: string,
): Promise<{ id: string }> {
  const authed = requireSession(ctx);
  const postId = parseInput(PostId, id);

  const [deleted] = await authed.db
    .delete(Post)
    .where(eq(Post.id, postId))
    .returning({ id: Post.id });

  if (!deleted) {
    throw new ApiError({ code: "NOT_FOUND", message: "Post not found" });
  }
  return deleted;
}
