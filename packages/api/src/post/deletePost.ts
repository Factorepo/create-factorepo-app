import { postRepository } from "@acme/db/repository";
import { postGuards, postLog } from "@acme/service";

import { stage } from "../stage";

export interface DeletePostRequest {
  id: string;
  userId: string;
}

export interface DeletePostResponse {
  id: string;
}

export async function deletePost(
  input: DeletePostRequest,
): Promise<DeletePostResponse> {
  const deletedId = await stage("post.delete", postLog.deleted, () =>
    postRepository.deleteForUser(input.id, input.userId),
  );

  return { id: postGuards.deleted(deletedId, input.id) };
}
