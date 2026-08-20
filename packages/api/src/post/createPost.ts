import { postRepository } from "@acme/db/repository";
import { postLog } from "@acme/service";

import type { PostSummary } from "./postSummary";
import { stage } from "../stage";
import { toPostSummary } from "./postSummary";

export interface CreatePostRequest {
  title: string;
  content: string;
}

export type CreatePostResponse = PostSummary;

export async function createPost(
  input: CreatePostRequest,
): Promise<CreatePostResponse> {
  const created = await stage("post.create", postLog.created, () =>
    postRepository.insert(input),
  );

  return toPostSummary({ ...created, likeCount: 0 });
}
