import type { Metadata } from "next";
import { Suspense } from "react";

import { getAllPosts } from "@acme/api";
import { HOME_DESCRIPTION, HOME_TITLE } from "@acme/constants";

import { postKeys } from "~/api/client";
import { HydrateClient, prefetch } from "~/api/server";
import { AuthShowcase } from "~/app/_components/auth/auth-showcase";
import { CreatePostForm } from "~/app/_components/post/create-post-form";
import { PostList } from "~/app/_components/post/post-list";
import { PostListSkeleton } from "~/app/_components/post/post-list-skeleton";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
};

export default function HomePage() {
  prefetch({
    queryKey: postKeys.all,
    queryFn: () => getAllPosts(),
  });

  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Create <span className="text-primary">T3</span> Turbo
          </h1>
          <AuthShowcase />

          <CreatePostForm />
          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense fallback={<PostListSkeleton />}>
              <PostList />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
