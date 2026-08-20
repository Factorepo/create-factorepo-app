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

export const postRoutes = {
  list: (): Promise<GetAllPostsResponse> => getAllPosts(),

  byId: ({ params }: RouteContext<{ id: string }>): Promise<GetPostResponse> =>
    getPost({ id: parseInput(PostId, params.id) }),

  create: async ({ ctx, req }: RouteContext): Promise<CreatePostResponse> => {
    requireSession(ctx);
    return createPost(parseInput(CreatePostSchema, await readJsonBody(req)));
  },

  remove: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<DeletePostResponse> => {
    requireSession(ctx);
    return deletePost({ id: parseInput(PostId, params.id) });
  },
};
