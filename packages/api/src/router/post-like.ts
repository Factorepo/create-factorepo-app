import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { CreateLikeSchema, Like } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

const createLike = protectedProcedure
  .input(CreateLikeSchema.omit({ userId: true }))
  .mutation(({ ctx, input }) => {
    return ctx.db.insert(Like).values({
      ...input,
      userId: ctx.session.user.id,
    });
  });

const deleteLike = protectedProcedure
  .input(z.string())
  .mutation(({ ctx, input }) => {
    return ctx.db.delete(Like).where(eq(Like.id, input));
  });

export const postLikeRouter = {
  create: createLike,
  delete: deleteLike,
} satisfies TRPCRouterRecord;
