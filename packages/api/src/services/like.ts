import { z } from "zod/v4";

import { and, eq } from "@acme/db";
import { CreateLikeSchema, Like } from "@acme/db/schema";

import type { ApiContext } from "../context";
import { requireSession } from "../context";
import { ApiError, parseInput } from "../errors";

export interface LikeSummary {
  id: string;
  postId: string;
}

const CreateLikeInput = CreateLikeSchema.omit({ userId: true });

export async function likePost(
  ctx: ApiContext,
  postId: string,
): Promise<LikeSummary> {
  const authed = requireSession(ctx);
  const input = parseInput(CreateLikeInput, { postId });

  const [created] = await authed.db
    .insert(Like)
    .values({ ...input, userId: authed.session.user.id })
    .returning({ id: Like.id, postId: Like.postId });

  if (!created) {
    throw new ApiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to like post",
    });
  }
  return created;
}

export async function unlikePost(
  ctx: ApiContext,
  likeId: string,
): Promise<{ id: string }> {
  const authed = requireSession(ctx);
  const id = parseInput(z.uuid(), likeId);

  // Scoped to the caller so one user can't remove another user's like.
  const [deleted] = await authed.db
    .delete(Like)
    .where(and(eq(Like.id, id), eq(Like.userId, authed.session.user.id)))
    .returning({ id: Like.id });

  if (!deleted) {
    throw new ApiError({ code: "NOT_FOUND", message: "Like not found" });
  }
  return deleted;
}
