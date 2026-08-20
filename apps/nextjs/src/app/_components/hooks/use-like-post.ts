"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  POST_LIKE_FAILED,
  POST_LIKE_SUCCEEDED,
  POST_LIKE_UNAUTHORIZED,
} from "@acme/constants";
import { toast } from "@acme/ui/toast";

import { api, ApiClientError, postKeys } from "~/api/client";

const toMessage = (error: Error) =>
  error instanceof ApiClientError && error.code === "UNAUTHORIZED"
    ? POST_LIKE_UNAUTHORIZED
    : POST_LIKE_FAILED;

export function useLikePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.likes.create,
    onSuccess: async () => {
      toast.success(POST_LIKE_SUCCEEDED);
      await queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  return { likePost: mutation.mutate, isPending: mutation.isPending };
}
