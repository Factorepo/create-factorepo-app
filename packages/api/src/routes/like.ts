import type { RouteContext } from "../handler";
import type { LikeSummary } from "../services/like";
import * as likeService from "../services/like";

export const likeRoutes = {
  /** `POST /api/posts/:id/likes` */
  create: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<LikeSummary> =>
    likeService.likePost(ctx, params.id),

  /** `DELETE /api/likes/:id` */
  remove: ({
    ctx,
    params,
  }: RouteContext<{ id: string }>): Promise<{ id: string }> =>
    likeService.unlikePost(ctx, params.id),
};
