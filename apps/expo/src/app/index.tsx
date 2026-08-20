import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { LegendList } from "@legendapp/list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PostSummary } from "~/utils/api";
import { api, ApiClientError, postKeys } from "~/utils/api";
import { authClient } from "~/utils/auth";

function PostSeparator() {
  return <View className="h-2" />;
}

function PostCard(props: { post: PostSummary; onDelete: () => void }) {
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
          <Pressable className="">
            <Text className="text-primary text-xl font-semibold">
              {props.post.title}
            </Text>
            <Text className="text-foreground mt-2">{props.post.content}</Text>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={props.onDelete}>
        <Text className="text-primary font-bold uppercase">Delete</Text>
      </Pressable>
    </View>
  );
}

function CreatePost() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { mutate, error } = useMutation({
    mutationFn: api.posts.create,
    async onSuccess() {
      setTitle("");
      setContent("");
      await queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const apiError = error instanceof ApiClientError ? error : null;
  const fieldErrors = apiError?.fieldErrors;

  return (
    <View className="mt-4 flex gap-2">
      <TextInput
        className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      {fieldErrors?.title && (
        <Text className="text-destructive mb-2">{fieldErrors.title}</Text>
      )}
      <TextInput
        className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
        value={content}
        onChangeText={setContent}
        placeholder="Content"
      />
      {fieldErrors?.content && (
        <Text className="text-destructive mb-2">{fieldErrors.content}</Text>
      )}
      <Pressable
        className="bg-primary flex items-center rounded-sm p-2"
        onPress={() => {
          mutate({
            title,
            content,
          });
        }}
      >
        <Text className="text-foreground">Create</Text>
      </Pressable>
      {apiError?.code === "UNAUTHORIZED" && (
        <Text className="text-destructive mt-2">
          You need to be logged in to create a post
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <Text className="text-foreground pb-2 text-center text-xl font-semibold">
        {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
      </Text>
      <Pressable
        onPress={() =>
          session
            ? authClient.signOut()
            : authClient.signIn.social({
                provider: "discord",
                callbackURL: "/",
              })
        }
        className="bg-primary flex items-center rounded-sm p-2"
      >
        <Text>{session ? "Sign Out" : "Sign In With Discord"}</Text>
      </Pressable>
    </>
  );
}

export default function Index() {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: postKeys.all,
    queryFn: api.posts.list,
  });

  const deletePostMutation = useMutation({
    mutationFn: api.posts.delete,
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
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

        <LegendList
          data={postQuery.data ?? []}
          estimatedItemSize={20}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={PostSeparator}
          renderItem={(p) => (
            <PostCard
              post={p.item}
              onDelete={() => deletePostMutation.mutate(p.item.id)}
            />
          )}
        />

        <CreatePost />
      </View>
    </SafeAreaView>
  );
}
