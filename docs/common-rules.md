# Common Rules

## 1. The compiler

1. Write strict TypeScript.
2. Take the TypeScript version from the workspace catalog.

## 2. Modules

1. Write `import` and `export`, never `require()`.
2. Never add a file extension to an import.
3. Write a type-only import as a top-level `import type`.
4. Use the path alias of the app inside the app, never a relative climb.
5. Import through the declared subpath exports of a package, never by path.
6. Export a new module from the entry point of the package.

## 3. Coding Style

1. Never read the raw environment outside an environment module.
2. Keep the environment module at the root
3. Almost never write a comment.
4. Keep a comment only when the code cannot hold the reason.

## 4. The linter

1. Keep the lint rules in `tooling/lint`.
2. Silence one line with a disable comment, and write the reason on the comment.
3. Silence a whole file with a file-level disable comment at the top, and write
   the reason.
4. Never add a folder-scoped exemption. Put every exception in the file it
   applies to.

## 5. The quality gate

1. Treat `pnpm check` as the canonical gate, and run it yourself.
2. Know that it runs lint, `typecheck`, then the nextjs
   suites.
3. Never run `pnpm format`; normalize your own files with
   `pnpm exec oxfmt <paths>`.
4. Never hide a failure with a widened type or a swallowed catch.
5. Never loosen the tsconfig or the oxlint config. Name the cause instead.

## 6. Tests

1. Treat a feature without tests as unfinished.
2. Test through a public surface, never through a private internal.
3. Never change production code to make a test pass, and never weaken an
   assertion.

## 7. Logging

1. Log in the API package only.
2. Log in another package only when the user asks, and mark it `// Justification: User request`.
3. Keep the logger, the log events, and the error at the root of the service package.

## 8. Never push

1. Never start a push, a migration, or a generate command on a database for any reason. Examples include `pnpm db:push` and `@better-auth/cli generate`.
2. Never write code or documents that tell an agent to start these commands.
3. List exactly what the user must apply, and what breaks until they do.
