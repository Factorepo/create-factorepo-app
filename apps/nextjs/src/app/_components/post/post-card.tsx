"use client";

import type { PostSummary } from "@acme/api";
import { POST_DELETE_SUBMIT } from "@acme/constants";
import { Button } from "@acme/ui/button";

import { useDeletePost } from "~/app/_components/hooks/use-delete-post";
import { useLikePost } from "~/app/_components/hooks/use-like-post";

export function PostCard(props: { post: PostSummary }) {
  const { deletePost, isPending: isDeleting } = useDeletePost();
  const { likePost, isPending: isLiking } = useLikePost();

  return (
    <div className="bg-muted flex flex-row rounded-lg p-4">
      <div className="grow">
        <h2 className="text-primary text-2xl font-bold">{props.post.title}</h2>
        <p className="mt-2 text-sm">{props.post.content}</p>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10 flex items-center gap-1 px-3 py-1"
            onClick={() => likePost(props.post.id)}
            disabled={isLiking}
          >
            <span className="text-lg">❤️</span>
            <span className="font-semibold">{props.post.likeCount}</span>
          </Button>
        </div>
      </div>
      <div>
        <Button
          variant="ghost"
          className="text-primary hover:text-foreground cursor-pointer text-sm font-bold uppercase hover:bg-transparent"
          onClick={() => deletePost(props.post.id)}
          disabled={isDeleting}
        >
          {POST_DELETE_SUBMIT}
        </Button>
      </div>
    </div>
  );
}
