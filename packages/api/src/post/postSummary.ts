import type { PostSummaryRow } from "@acme/db/repository";

// Timestamps are ISO strings, because JSON has no date type.
export interface PostSummary {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
}

export function toPostSummary(row: PostSummaryRow): PostSummary {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
