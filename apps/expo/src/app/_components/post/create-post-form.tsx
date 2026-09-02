import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  POST_CONTENT_PLACEHOLDER,
  POST_CREATE_SUBMIT,
  POST_CREATE_UNAUTHORIZED,
  POST_TITLE_PLACEHOLDER,
} from "@acme/constants";

import { api, ApiClientError, postKeys } from "~/utils/api";

export function CreatePostForm() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { mutate, error, isPending } = useMutation({
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
        placeholder={POST_TITLE_PLACEHOLDER}
      />
      {fieldErrors?.title && (
        <Text className="text-destructive mb-2">{fieldErrors.title}</Text>
      )}
      <TextInput
        className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
        value={content}
        onChangeText={setContent}
        placeholder={POST_CONTENT_PLACEHOLDER}
      />
      {fieldErrors?.content && (
        <Text className="text-destructive mb-2">{fieldErrors.content}</Text>
      )}
      <Pressable
        className="bg-primary flex items-center rounded-sm p-2"
        disabled={isPending}
        onPress={() => mutate({ title, content })}
      >
        <Text className="text-foreground">{POST_CREATE_SUBMIT}</Text>
      </Pressable>
      {apiError?.code === "UNAUTHORIZED" && (
        <Text className="text-destructive mt-2">
          {POST_CREATE_UNAUTHORIZED}
        </Text>
      )}
    </View>
  );
}
