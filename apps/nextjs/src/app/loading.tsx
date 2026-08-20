import { PostListSkeleton } from "~/app/_components/post/post-list-skeleton";

export default function HomeLoading() {
  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-2xl">
          <PostListSkeleton />
        </div>
      </div>
    </main>
  );
}
