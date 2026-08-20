"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PostSummary } from "@acme/api";
import { POST_DELETE_FAILED, POST_DELETE_UNAUTHORIZED } from "@acme/constants";
import { toast } from "@acme/ui/toast";

import { api, ApiClientError, postKeys } from "~/api/client";

const toMessage = (error: Error) =>
  error instanceof ApiClientError && error.code === "UNAUTHORIZED"
    ? POST_DELETE_UNAUTHORIZED
    : POST_DELETE_FAILED;

export function useDeletePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.posts.delete,
    onSuccess: (deleted) => {
      queryClient.setQueryData<PostSummary[]>(postKeys.all, (posts) =>
        (posts ?? []).filter((post) => post.id !== deleted.id),
      );
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  return { deletePost: mutation.mutate, isPending: mutation.isPending };
}
