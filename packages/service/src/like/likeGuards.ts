import { AppError } from "../error";

export const likeGuards = {
  // A like the caller does not own reads as absent, never as forbidden.
  deleted(deletedId: string | null, likeId: string): string {
    if (!deletedId) {
      throw AppError.notFound("Like not found.", { likeId });
    }
    return deletedId;
  },
};
