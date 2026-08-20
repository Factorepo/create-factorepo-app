# Gemini

Read [../../boundary-rules.md](../../boundary-rules.md) first.

## 1. Responsibility

1. Translate the Google Vertex AI protocol into the neutral model surface of
   this package.
2. Keep the package free of the prompt text.

## 2. Layout

1. Keep the client, the session, the translation, and the environment at the
   source root.
2. Build the client in `geminiClient.ts`.

## 3. May use

1. `@google/genai`, as the SDK of this package.

## 4. Must not

1. Never let a type of `@google/genai` cross the entry point.
2. Never hold a prompt, a system instruction, or a model name that a caller
   must choose.
3. Never retry a failed call here.
