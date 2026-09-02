import { z } from "zod/v4";

import { CreatePostSchema } from "@acme/db/schema";

import type { RouteContext } from "../handler";
import type {
  CreatePostResponse,
  DeletePostResponse,
  GetAllPostsResponse,
  GetPostResponse,
} from "../index";
import { requireSession } from "../context";
import { parseInput } from "../errors";
import { readJsonBody } from "../handler";
import { createPost } from "../post/createPost";
import { deletePost } from "../post/deletePost";
import { getAllPosts } from "../post/getAllPosts";
import { getPost } from "../post/getPost";

const PostId = z.uuid();
const CreatePostInput = CreatePostSchema.omit({ createdBy: true });

export const postRoutes = {
  list: (): Promise<GetAllPostsResponse> => getAllPosts(),

  byId: ({ params }: RouteContext<{ id: string }>): Promise<GetPostResponse> =>
    getPost({ id: parseInput(PostId, params.id) }),

  create: async ({ ctx, req }: RouteContext): Promise<CreatePostResponse> => {
    const authed = requireSession(ctx);
    const input = parseInput(CreatePostInput, await readJsonBody(req));

    return createPost({ ...input, userId: authed.session.user.id });
  },

  remove: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<DeletePostResponse> => {
    const authed = requireSession(ctx);

    return deletePost({
      id: parseInput(PostId, params.id),
      userId: authed.session.user.id,
    });
  },
};
