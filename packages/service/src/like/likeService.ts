import type { LikeRow } from "@acme/db/repository";
import { likeRepository, postRepository } from "@acme/db/repository";

import { postGuards } from "../post/postGuards";

export interface CreateLikeInput {
  postId: string;
  userId: string;
}

export const likeService = {
  // Dependent work: the insert may only run once the post is known to exist.
  // Without the read, a like on a missing post reaches the foreign key and
  // returns a 502 for what is a 404.
  async createForPost(input: CreateLikeInput): Promise<LikeRow> {
    const post = await postRepository.findSummaryById(input.postId);
    postGuards.found(post, input.postId);

    return await likeRepository.insert({
      postId: input.postId,
      createdBy: input.userId,
    });
  },
};
