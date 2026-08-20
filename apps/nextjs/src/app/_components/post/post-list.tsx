"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { POST_LIST_EMPTY } from "@acme/constants";

import { api, postKeys } from "~/api/client";
import { PostCard } from "~/app/_components/post/post-card";
import { PostListSkeleton } from "~/app/_components/post/post-list-skeleton";

export function PostList() {
  const { data: posts } = useSuspenseQuery({
    queryKey: postKeys.all,
    queryFn: api.posts.list,
  });

  if (posts.length === 0) {
    return (
      <div className="relative w-full">
        <PostListSkeleton pulse={false} />
        <div className="bg-background/80 absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-foreground text-2xl font-bold">
            {POST_LIST_EMPTY}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
