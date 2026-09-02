import { likeLog, likeService } from "@acme/service";

import type { LikeSummary } from "./likeSummary";
import { stage } from "../stage";

export interface LikePostRequest {
  postId: string;
  userId: string;
}

export type LikePostResponse = LikeSummary;

export async function likePost(
  input: LikePostRequest,
): Promise<LikePostResponse> {
  return await stage("like.create", likeLog.created, () =>
    likeService.createForPost(input),
  );
}
