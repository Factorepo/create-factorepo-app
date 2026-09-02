import { likeRepository } from "@acme/db/repository";
import { likeGuards, likeLog } from "@acme/service";

import { stage } from "../stage";

export interface UnlikePostRequest {
  likeId: string;
  userId: string;
}

export interface UnlikePostResponse {
  id: string;
}

export async function unlikePost(
  input: UnlikePostRequest,
): Promise<UnlikePostResponse> {
  const deletedId = await stage("like.delete", likeLog.deleted, () =>
    likeRepository.deleteForUser(input.likeId, input.userId),
  );

  return { id: likeGuards.deleted(deletedId, input.likeId) };
}
