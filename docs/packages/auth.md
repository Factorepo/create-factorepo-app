# Auth

The auth package owns the **Better Auth instance and its types**.

## 1. Responsibility

1. Keep the auth factory here, in one file, and keep every Better Auth configuration here.
2. Export the factory, the auth type, and the session type from the entry point.
3. Let `apps/nextjs` call the factory exactly once, in `src/auth/server.ts`.

## 2. Must not

1. Never hand-write the auth type or the session type.
2. Never call the factory from a second place, and never build a second instance.
