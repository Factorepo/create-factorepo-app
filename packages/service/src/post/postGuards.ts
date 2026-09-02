import type { PostSummaryRow } from "@acme/db/repository";

import { AppError } from "../error";

export const postGuards = {
  found(post: PostSummaryRow | null, postId: string): PostSummaryRow {
    if (!post) {
      throw AppError.notFound("Post not found.", { postId });
    }
    return post;
  },

  // A post the caller does not own reads as absent, never as forbidden. The
  // repository deletes scoped to the caller and cannot tell the two apart.
  deleted(deletedId: string | null, postId: string): string {
    if (!deletedId) {
      throw AppError.notFound("Post not found.", { postId });
    }
    return deletedId;
  },
};
