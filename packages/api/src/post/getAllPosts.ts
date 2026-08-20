import { postRepository } from "@acme/db/repository";
import { postLog } from "@acme/service";

import type { PostSummary } from "./postSummary";
import { stage } from "../stage";
import { toPostSummary } from "./postSummary";

export type GetAllPostsResponse = PostSummary[];

export async function getAllPosts(): Promise<GetAllPostsResponse> {
  const posts = await stage("post.list", postLog.listed, () =>
    postRepository.findAllSummaries(),
  );

  return posts.map(toPostSummary);
}
