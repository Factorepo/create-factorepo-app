"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PostSummary } from "@acme/api";
import { POST_CREATE_FAILED, POST_CREATE_UNAUTHORIZED } from "@acme/constants";

import { api, ApiClientError, postKeys } from "~/api/client";

const toMessage = (error: Error) =>
  error instanceof ApiClientError && error.code === "UNAUTHORIZED"
    ? POST_CREATE_UNAUTHORIZED
    : POST_CREATE_FAILED;

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.posts.create,
    onSuccess: (created) => {
      queryClient.setQueryData<PostSummary[]>(postKeys.all, (posts) => [
        ...(posts ?? []),
        created,
      ]);
    },
  });

  return {
    createPost: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toMessage(mutation.error) : null,
  };
}
