# Packages Rules

## 1. Language — every package

1. Write strict TypeScript.
2. Take the TypeScript version from the workspace catalog.
3. Never take the version from a number that another document quotes.
4. Narrow an indexed access, because unchecked indexed access is on.
5. Never assert an indexed access away.
6. Never add a file extension to an import, because the module resolution is bundler-style.
7. Typecheck through the workspace-wide task, which every package exposes under the same name.
8. Write `import` and `export`, because every package is an ES module.
9. Never call `require()`, because there is no CommonJS interop.
10. A `require()` call type-checks cleanly and then fails at runtime.
11. Always import Zod from the versioned subpath.
12. Never import Zod from the bare specifier.
13. Treat the bare specifier as a silent bug.
14. It type-checks, runs, and validates differently, and it does not throw or warn.
15. Write a type-only import as a top-level `import type`.
16. Never write an inline type marker.
17. Split a mixed value and type import into two statements.
18. Import from another workspace package through its scope and its subpath exports.
19. Never import from another package through a deep relative path.
20. Use the path alias of the app for an import inside the app.
21. Never use a relative climb for such an import.
22. Use an indexed loop only when you use the index.
23. Prefer `for...of` in every other case.
24. Never read the raw environment outside an environment module, which lint enforces.
25. Almost never write a comment.
26. Rewrite with better names, smaller functions, and clearer structure first.
27. Keep a comment only when the code cannot hold the reason.

## 2. Dependency direction

1. Keep the dependency arrow in one direction, from an app down to the domain package.
2. Never let the domain package import anything from the workspace, because it sits below everything else.
3. Keep the logger in the domain package for that reason.
4. Re-export the logger elsewhere only for convenience.
5. Put code in the shared service package only when a second app consumes it.
6. Never put code there in anticipation.
7. Keep orchestration that one app needs inside that app.
8. Treat the placement rules above as load-bearing.
9. Shared-only code couples an app to logic that it never runs.
10. App-local code is unreachable from the other app.

## 3. Package boundaries

1. Give every package one responsibility.
2. Never widen the responsibility of a package to avoid a move.
3. Import through the declared subpath exports of a package.
4. Never import through a deep relative path into a package.
5. Export a new module from the entry point of the package.
6. Never let a caller reach into a package by path.

## 4. Adding a dependency

1. Use what is already installed before you add anything.
2. Add a dependency that more than one package shares to the workspace catalog.
3. Reference such a dependency as a catalog entry.
4. Add a dependency that one package uses to the manifest of that package.
5. Write an exact semver range for such a dependency.
6. Declare a forced version in the overrides block of the workspace file.
7. Add a comment that explains the forced version.
8. Never declare an override in the root package manifest.
9. An override in the root manifest is ignored once the workspace file carries an overrides block.
10. Check first which file declares an override when a forced version does not take effect.
11. Nothing errors and nothing warns in that case.

## 5. Domain entities

1. Write an entity as a class that owns its rules.
2. Never write an entity as a data bag.
3. Put the validation logic of the entity on the entity.
4. Put the ownership checks and the permission checks on the entity.
5. Put the parsing and the sanitization of the entity fields on the entity.
6. Put the domain calculations and the derived state on the entity.
7. Never push that logic up into a service, a repository, or a router.
8. Answer an ownership question on the entity.
9. Do this whenever a router asks whether a row belongs to a user.
10. Expose a static factory as the only way to make an entity from a database row.
11. Expose a matching method for the shape that you write back.
12. Register a new entity in the entry point of the package, because nothing is imported by a deep path.

## 6. The application error type

1. Throw the shared application error type from every layer that raises an expected failure.
2. Give the error a stable machine code, which decides the HTTP status.
3. Mark the error as expected for an ordinary client-side outcome.
4. Mark the error as unexpected for a fault that is ours.
5. Put structured, safe-to-log context in the metadata of the error.
6. Wrap the underlying error as the cause, which the logger serializes as a chain.
7. Keep the user-facing display text on the error.
8. Never log the display text.
9. Treat the contract of the error as a dependency of the logger.
10. A change to that contract is never a local edit.
11. Narrow the error with the provided type guard.
12. Fall back to the generic display message when there is nothing safe to show.

## 7. Where validation lives

1. Validate the request shape with a schema in the endpoint file.
2. Validate the row shape on insert with the generated insert schema in the schema file.
3. Validate the business invariants, the ownership, and the state on the entity.
4. Never treat the three validations as interchangeable.
5. A well-formed field does not prove that the row belongs to the caller.

## 8. Never push

1. Edit the schema file.
2. List exactly what the user must apply.
3. State the failure mode with that list.
4. The failure mode tells the user whether a red test is the pending push or a real bug.

## 9. The two databases

1. Keep the application database and the legal corpus in separate packages.
2. Give each package its own schema, client, and push script.
3. The `db:push` script in the root manifest runs both push scripts.
4. Never add an application table to the corpus.
5. Never reach into the corpus from the application database package.

## 10. Column conventions

1. Declare a column in camelCase.
2. Let the ORM map the column to the configured database casing.
3. Give every table a random UUID primary key.
4. Use an integer identity key only for a lookup table or for the corpus.
5. Never use a text primary key.
6. Give every table a created-at timestamp and an updated-at timestamp.
7. Make both timestamps non-null, and give both a default.
8. Apply the two rules above with no exceptions.
9. Cascade on delete for a required owner relation.
10. Set null on delete for an optional reference.

## 11. Schema files

1. Keep one schema file per domain.
2. Re-export every schema file from the schema entry point of the package.
3. Add a new table as a new file and one re-export line.
4. Never append a new table to an unrelated file.
5. Derive the insert schema from the table with `createInsertSchema()` from `drizzle-zod`.
6. Never hand-write an insert schema.
7. Refine the fields that need it.
8. Omit the auto-generated fields.

## 12. Repositories

1. Make every connection to something outside the process in a repository.
2. Never make such a connection anywhere else.
3. Reach PostgreSQL through postgres.js, and never import `pg` or node-postgres.
4. Import `db` from `@atlas/db/client`, the tables from `@atlas/db/schema`, and the query helpers from `@atlas/db`.
5. Name a repository file `<domain>Repository.ts`.
6. Keep a repository to building a query and returning the result.
7. Put no domain logic, no API logic, and no business branching in a repository.
8. Never let a repository use another repository.
9. Orchestrate a task that spans two repositories in the service layer.
10. Return entities, not rows.
11. Map a row through the factory of the entity.
12. Never write a query in a service, a router, or a handler.
13. This rule keeps the data layer swappable and testable.
14. Move an `if` about the meaning of the data onto the entity or into a service.
15. Group the repositories by domain, one file per repository.
16. Export a helper that is not a repository beside them, and never call it a repository.
17. Let the search engine rank on a read that spans two stores.
18. Let the database supply the text on such a read.
19. Re-order the loaded rows into the ranking that the search engine returned.
20. Skip the search for a direct lookup by identifier.
21. Leave a knowingly simple query simple until the planned replacement lands.
22. Never improve such a query piecemeal.
23. Tell the model in the prompt text what such a query can match and cannot match.

## 13. Logging — the rule that shapes the others

1. Never build a log line in flow code.
2. Call a named event from the catalog instead.
3. Call the logger directly only from the catalog.
4. Add a step by adding a function to the correct catalog group.
5. Call that function in one line.
6. Never add an ad-hoc log call to flow code.
7. Keep the catalog on primitives and small structural types.
8. The catalog sits below every app and must not import the types of an app.
9. Follow this document when the code and this document disagree.

## 14. The shape of a log line

1. Emit one JSON object per line in production.
2. Emit one delimited line per event in development.
3. Carry a UTC timestamp on every line, because only the timestamp orders a trace.
4. Carry a level on every line.
5. Carry a dotted event code on every line.
6. Carry the identity fields on every line, because they join a trace.
7. Promote a measured duration out of the payload, so that a query needs no JSON path.
8. Put everything else in the payload.
9. Normalize and redact the payload.
10. Serialize the error on a failure line.
11. Include the code, the metadata, and the cause chain of the error.
12. Never add a free-text message field, because every event already has a code.

## 15. Log context

1. Keep an identifier and a routing detail only in the log context.
2. Emit the identity keys on every line.
3. Emit the transport keys only on a transport line, because they describe the transport and not the work.
4. Never repeat a context field in the payload.
5. The context value wins, and the logger strips the duplicate.
6. Pass a transport value in its own metadata when a boundary needs one.
7. Never put free text, a file name, a message body, or a document in the context.
8. Open the context at the request boundary.
9. Take the trace id from the incoming header, or generate one.
10. Echo the trace id back on the response.
11. Enrich the context with the user at the authentication boundary.
12. Enrich the context with the route at the API boundary.
13. Promote a deeper identifier onto the open context when you resolve it.
14. Register a new context field in the context type, in the correct key set, and in this document.

## 16. Event naming

1. Name an event as the area, then the subject, then the action.
2. Write lower snake_case segments, dot-separated, in ASCII.
3. Never write an event name as a sentence.
4. Never write an event name in another language.
5. Treat an event code as an API for the dashboards and the alerts.
6. Treat a rename of an event code as a breaking change.
7. Make a code specific enough to grep on its own.
8. Suffix a query or a command that ran with `.executed`, which is the default.
9. Suffix long work that began with `.started`, and use this suffix rarely.
10. Suffix that work when it finishes with `.completed`, and carry the duration.
11. Suffix a throw with `.failed`, and carry the error.
12. Suffix input that you refused before any work with `.rejected`.
13. Never invent another action suffix.

## 17. Log levels

1. Use error for a fault that is ours, because it drives the alerting.
2. Use warn for an expected bad outcome, which must not drive the alerting.
3. Use info for a step of a request, which is the default.
4. Use debug for local-only detail that is noise in production.
5. Default the threshold to info in production and to debug elsewhere.
6. Let the environment override the threshold.
7. Fall back to the default on an unrecognized value.
8. Never choose a failure level by hand.
9. Let the failure helper read the expected flag of the error.
10. Go by the resolved HTTP status only in a handler that can receive a bare framework error.
11. The status is the only reliable signal in that handler.

## 18. What you may log and may not log

1. Log every meaningful step with its full detail, because volume is not a constraint here.
2. Prefer an id list to a bare count, because a list answers which records the step used.
3. Never log corpus body text, and log its identifier and its score instead.
4. Never log a vector, and log the row id instead.
5. Never log message content or document text.
6. Log a character length and the document id instead.
7. Never log a prompt, resolved prompt text, or chat history.
8. Log the character counts and the turn counts instead.
9. Never log a file name that a user wrote.
10. Log the attachment id, type, size, and status instead.
11. Never log user-facing display text, and log the technical message and the code instead.
12. Never log credentials, cookies, or an authorization header.
13. Treat the redaction, the truncation, and the depth caps of the logger as a safety net.
14. Never treat them as a licence, because the catalog entry picks the fields.
15. A whole row never reaches the logger.

## 19. Adding a logged step

1. Add a step only when a human would name it while narrating the request.
2. Make every other step debug, or do not add it.
3. Pick an area-subject-action code, and reuse an existing area.
4. Add a function to the matching catalog group.
5. Check the never-log rules before you add a field that can carry text.
6. Call the function in one line from the flow.
7. Pass no metadata object at the call site.
8. Never pass a field that the context already carries.
9. Build a catch on the failure helper.
10. Never build a catch on a hand-picked level.
11. Record the event in the canonical trace when it is part of a documented flow.
