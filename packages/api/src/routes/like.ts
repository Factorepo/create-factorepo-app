import { z } from "zod/v4";

import { CreateLikeSchema } from "@acme/db/schema";

import type { RouteContext } from "../handler";
import type { LikePostResponse, UnlikePostResponse } from "../index";
import { requireSession } from "../context";
import { parseInput } from "../errors";
import { likePost } from "../like/likePost";
import { unlikePost } from "../like/unlikePost";

const LikeId = z.uuid();
const CreateLikeInput = CreateLikeSchema.omit({ createdBy: true });

export const likeRoutes = {
  create: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<LikePostResponse> => {
    const authed = requireSession(ctx);
    const input = parseInput(CreateLikeInput, { postId: params.id });

    return likePost({ ...input, userId: authed.session.user.id });
  },

  remove: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<UnlikePostResponse> => {
    const authed = requireSession(ctx);

    return unlikePost({
      likeId: parseInput(LikeId, params.id),
      userId: authed.session.user.id,
    });
  },
};
