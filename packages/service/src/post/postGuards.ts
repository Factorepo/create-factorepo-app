import type { PostSummaryRow } from "@acme/db/repository";

import { AppError } from "../error";

export const postGuards = {
  found(post: PostSummaryRow | null, postId: string): PostSummaryRow {
    if (!post) {
      throw AppError.notFound("Post not found.", { postId });
    }
    return post;
  },

  deleted(deletedId: string | null, postId: string): string {
    if (!deletedId) {
      throw AppError.notFound("Post not found.", { postId });
    }
    return deletedId;
  },
};
