import type { RouteContext } from "../handler";
import type { PostSummary } from "../services/post";
import { readJsonBody } from "../handler";
import * as postService from "../services/post";

export const postRoutes = {
  /** `GET /api/posts` */
  list: ({ ctx }: RouteContext): Promise<PostSummary[]> =>
    postService.getAllPosts(ctx),

  /** `GET /api/posts/:id` */
  byId: ({ ctx, params }: RouteContext<{ id: string }>): Promise<PostSummary> =>
    postService.getPost(ctx, params.id),

  /** `POST /api/posts` */
  create: async ({ ctx, req }: RouteContext): Promise<PostSummary> =>
    postService.createPost(ctx, await readJsonBody(req)),

  /** `DELETE /api/posts/:id` */
  remove: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<{ id: string }> =>
    postService.deletePost(ctx, params.id),
};
