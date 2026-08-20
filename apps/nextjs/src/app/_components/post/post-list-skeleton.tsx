import { PostCardSkeleton } from "~/app/_components/post/post-card-skeleton";

export function PostListSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="flex w-full flex-col gap-4">
      <PostCardSkeleton pulse={pulse} />
      <PostCardSkeleton pulse={pulse} />
      <PostCardSkeleton pulse={pulse} />
    </div>
  );
}
