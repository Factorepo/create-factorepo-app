import { postRepository } from "@acme/db/repository";
import { postGuards, postLog } from "@acme/service";

import type { PostSummary } from "./postSummary";
import { stage } from "../stage";
import { toPostSummary } from "./postSummary";

export interface GetPostRequest {
  id: string;
}

export type GetPostResponse = PostSummary;

export async function getPost(input: GetPostRequest): Promise<GetPostResponse> {
  const post = await stage("post.read", postLog.read, () =>
    postRepository.findSummaryById(input.id),
  );

  return toPostSummary(postGuards.found(post, input.id));
}
