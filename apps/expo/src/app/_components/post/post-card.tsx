import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";

import { POST_DELETE_SUBMIT } from "@acme/constants";

import type { PostSummary } from "~/utils/api";

export function PostCard(props: { post: PostSummary; onDelete: () => void }) {
  return (
    <View className="bg-muted flex flex-row rounded-lg p-4">
      <View className="grow">
        <Link
          asChild
          href={{
            pathname: "/post/[id]",
            params: { id: props.post.id },
          }}
        >
          <Pressable>
            <Text className="text-primary text-xl font-semibold">
              {props.post.title}
            </Text>
            <Text className="text-foreground mt-2">{props.post.content}</Text>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={props.onDelete}>
        <Text className="text-primary font-bold uppercase">
          {POST_DELETE_SUBMIT}
        </Text>
      </Pressable>
    </View>
  );
}
