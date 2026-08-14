# Rules

Read this file first. Then read the rule file that this table routes to the path you change.

## By path

| Path                              | Read                                   |
| --------------------------------- | -------------------------------------- |
| [apps/backend](../apps/backend)   | [rules-backend.md](rules-backend.md)   |
| [apps/consumer](../apps/consumer) | [rules-consumer.md](rules-consumer.md) |
| [apps/nextjs](../apps/nextjs)     | [rules-nextjs.md](rules-nextjs.md)     |
| [packages/*](../packages/)        | [rules-packages.md](rules-packages.md) |
| [tooling/*](../tooling/)          | [rules-packages.md](rules-packages.md) |

## 1. How to communicate

1. Write every rule in ASD-STE100 Simplified Technical English.
2. Give each word one meaning.
3. Never make the reader take a meaning from the context.
4. Keep an instruction to twenty words.
5. Keep a description to twenty-five words.
6. Write in the active voice.
7. Write in the imperative or in the simple present.
8. Never put more than three nouns in a row.
9. Write one instruction per sentence.

## 2. How these rules work

1. Never write the same rule twice.
2. Never change a rule before you ask for confirmation.
3. Treat every rule here as a hard constraint.
4. Take the stricter reading when you can read a rule two ways.
5. Stop and ask for confirmation when a requested change disagrees with these documents.
6. Report the conflict when a document and the code disagree.
7. Never follow the code in silence in that case.
8. Never read or change `docs/archive/`, for any reason.

## 3. Design principles

1. Never add backward compatibility, because there are no legacy consumers.
2. Remove the obsolete path instead.
3. Write the simplest sufficient implementation.
4. Solve the current requirement fully and no more.
5. Grow the system in layers.
6. Add each capability on top of something that already works.
7. Never trade a working product for unfinished complexity.
8. Keep a component small.
9. Keep the concerns clearly separate.
10. Prefer an established, maintained library to a reimplementation when it reduces the total complexity.
11. Use what is already installed before you add a dependency.
12. Read the types or the documentation of a library before you decide that it cannot do the task.
13. Decide for the long term.
14. Never ship a stopgap that you plan to replace later.

## 4. Agent behavior

1. Read the code before you write code.
2. Understand the existing pattern before you add code.
3. Change only what the user requested.
4. Never do a drive-by refactor.
5. Never add a comment that the user did not ask for.
6. Never add an abstraction for a one-time operation.
7. Match the style, the naming, and the structure of the code around you.
8. Ask when a dependency, a component, or a configuration does not exist.
9. Never stub or guess in that case.
10. Keep one concern per change.
11. Explain the connection when a task covers unrelated files.

## 5. Tests ship with the change

1. Treat a feature without tests as unfinished.
2. Never plan to write the tests later.
3. Test the behavior through a public surface, never through a private internal.
4. Never change production code to make a test pass.
5. Report the bug instead when the code under test is broken.
6. Never weaken an assertion, and never delete a failing test.

## 6. The quality gate

1. Treat `pnpm check` as the canonical gate.
2. Know that the gate runs `pnpm lint --no-cache`, then `pnpm check-types`, then `pnpm test:nextjs`, then `pnpm test:backend`, then `pnpm test:consumer`.
3. Expect the backend leg and the consumer leg to need PostgreSQL, RabbitMQ, and storage on `localhost`.
4. Never run `pnpm format`, because it rewrites the whole repository.
5. Normalize only the files you touched with `pnpm exec prettier --write <paths>`.
6. Run the gate yourself when you work inline, which is the default.
7. Never silence a failure with an `eslint-disable`, a `@ts-ignore`, or a `@ts-expect-error`.
8. Never loosen the tsconfig or the ESLint config to make the gate pass.
9. Never swallow an error in a `catch` block to hide a symptom.
10. Never widen a type to hide a symptom.
11. Name the cause instead.

## 7. Never push

1. Never run a push, a migrate, or a generate command against a database, for any reason.
2. This covers `pnpm db:push`, every drizzle push and migrate command, and `@better-auth/cli generate`.
3. The user applies every schema change to the database.
4. Never write code that tells an agent to run one of these commands.
5. Never write a document that tells an agent to run one of these commands.
6. Treat the `db:push` script in the root manifest as legitimate, because the user runs it.
7. Report only a new agent-facing instruction to run one of these commands.
