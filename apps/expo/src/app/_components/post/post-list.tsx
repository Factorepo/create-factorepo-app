import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PostCard } from "~/app/_components/post/post-card";
import { api, postKeys } from "~/utils/api";

function PostSeparator() {
  return <View className="h-2" />;
}

export function PostList() {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: postKeys.all,
    queryFn: api.posts.list,
  });

  const deletePost = useMutation({
    mutationFn: api.posts.delete,
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });

  return (
    <LegendList
      data={postQuery.data ?? []}
      estimatedItemSize={20}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={PostSeparator}
      renderItem={(p) => (
        <PostCard post={p.item} onDelete={() => deletePost.mutate(p.item.id)} />
      )}
    />
  );
}
