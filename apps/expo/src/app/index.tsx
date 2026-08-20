import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { MobileAuth } from "~/app/_components/auth/mobile-auth";
import { CreatePostForm } from "~/app/_components/post/create-post-form";
import { PostList } from "~/app/_components/post/post-list";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="text-foreground pb-2 text-center text-5xl font-bold">
          Create <Text className="text-primary">T3</Text> Turbo
        </Text>

        <MobileAuth />

        <View className="py-2">
          <Text className="text-primary font-semibold italic">
            Press on a post
          </Text>
        </View>

        <PostList />

        <CreatePostForm />
      </View>
    </SafeAreaView>
  );
}
