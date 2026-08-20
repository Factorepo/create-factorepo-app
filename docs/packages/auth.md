# Auth

The auth package owns the **Better Auth instance and its types**.

## 1. Responsibility

1. Build the auth instance here, in one file, and keep every Better Auth
   configuration file here.
2. Export the instance, the auth type, and the session type from the entry
   point.

## 2. Must not

1. Never hand-write the auth type or the session type.
2. Never build a second auth instance in another package.
