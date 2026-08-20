"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";

import {
  POST_CONTENT_LABEL,
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_PLACEHOLDER,
  POST_CONTENT_TOO_LONG,
  POST_CREATE_SUBMIT,
  POST_TITLE_LABEL,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_PLACEHOLDER,
  POST_TITLE_TOO_LONG,
} from "@acme/constants";
import { Button } from "@acme/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";

import { useCreatePost } from "~/app/_components/hooks/use-create-post";

export const CreatePostFormSchema = z.object({
  title: z.string().max(POST_TITLE_MAX_LENGTH, POST_TITLE_TOO_LONG),
  content: z.string().max(POST_CONTENT_MAX_LENGTH, POST_CONTENT_TOO_LONG),
});

export function CreatePostForm() {
  const { createPost, isPending, errorMessage } = useCreatePost();

  const form = useForm({
    defaultValues: {
      content: "",
      title: "",
    },
    validators: {
      onSubmit: CreatePostFormSchema,
    },
    onSubmit: (data) =>
      createPost(data.value, { onSuccess: () => form.reset() }),
  });

  return (
    <form
      className="w-full max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    {POST_TITLE_LABEL}
                  </FieldLabel>
                </FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={POST_TITLE_PLACEHOLDER}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="content">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    {POST_CONTENT_LABEL}
                  </FieldLabel>
                </FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={POST_CONTENT_PLACEHOLDER}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      {errorMessage && <FieldError className="mt-2">{errorMessage}</FieldError>}
      <Button className="mt-2" type="submit" disabled={isPending}>
        {POST_CREATE_SUBMIT}
      </Button>
    </form>
  );
}
