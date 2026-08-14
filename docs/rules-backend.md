# Backend Rules

## 1. Layering

1. Keep a router or a handler thin.
2. Parse the request in the router.
3. Call one service or one repository from the router.
4. Send the response from the router.
5. Write a service only for orchestration.
6. Write a service only when the task uses more than one repository.
7. Make an external connection only in a repository.
8. Keep the rules about the meaning of the data on the domain entity.
9. Keep the dependency arrow in one direction, from the router down to the entity.
10. Never let a repository call a service.
11. Never let a repository call another repository.

## 2. Folder structure

1. Keep all implementation code under the source root.
2. Put every file that holds logic in a sub-folder.
3. Keep only the process-level wiring in the root.

## 3. One file per endpoint

1. Give every endpoint its own file.
2. Never create a router file or a handler file for a sub-domain.
3. Register every endpoint in the single registration module of its transport.
4. Keep the input schemas of the endpoint in the same endpoint file.
5. Keep the response types of the endpoint in the same endpoint file.
6. Create a request module or a response module in an endpoint folder only when it has content.

## 4. Service layer

1. Call the repository directly from the router or the handler when the task uses one repository.
2. A service that forwards one call is noise.
3. Group a service by sub-domain.
4. Treat the placement of code as functional, not as cosmetic.
5. The wrong side of the app boundary couples an app to code it never runs, or puts logic out of reach.

## 5. Mount order

1. Mount CORS first.
2. Mount health second.
3. Mount authentication third.
4. Mount the typed API fourth.
5. Mount the JSON body parser fifth.
6. Mount the REST routes sixth.
7. Mount the global error middleware last.
8. Authentication and the typed API parse their own bodies, and an earlier parser consumes the stream.
9. Never invent a middleware folder or a middleware module that does not exist.

## 6. The typed API

1. Keep a route to three steps.
2. Validate the input.
3. Call one service or one repository.
4. Return the result.
5. Compose the leaf groups as plain records.
6. Type every entry of a leaf group with the shared route-handler type.
7. Compose the leaf records into the exported surface only at the root.
8. Adapt a record entry to a request handler only at its mount point.
9. Keep transport-specific middleware beside the routers.
10. Transport-specific middleware includes the authentication checks and the observability.
11. Resolve the session from the request headers through the auth API.
12. Pass the session down on the context.
13. Return the data directly, because a typed-API response carries no envelope.
14. Throw the shared API error with the correct code.
15. The shared input parser puts the per-field messages on the error.
16. Never wrap a route in a catch block only to rethrow an internal error.
17. An unhandled exception already becomes a 500 response.
18. Catch an error only to translate it into a specific code.

## 7. REST

1. Keep a handler to three steps.
2. Parse the request.
3. Call one service or one repository.
4. Send the response.
5. Wrap every handler in the shared async wrapper, which is `asyncHandler()`.
6. Send a file upload through REST.
7. Handle the multipart body with multer.
8. Never send a file upload through the typed API, which has no multipart support.
9. Return every REST response in the shared success-data-error envelope.
10. The envelope has the shape `{ success, data, error }`.
11. Build the envelope only at the handler boundary.
12. Never build the envelope in a service, a domain, or a repository.

## 8. Request lifecycle

1. Carry the orchestration in the router file or in the handler file.
2. Skip a step that the endpoint does not have.
3. Validate the incoming request first.
4. Check the session and the permissions next.
5. Verify that the database prerequisites exist.
6. Call the model when the endpoint needs it.
7. Publish the queue message when the endpoint has one.
8. Persist the resulting state.
9. Send the response last.

## 9. Error handling

1. Throw the shared application error from a service or a repository for an expected failure.
2. Never return an error object.
3. Never decide an HTTP status in a logic layer.
4. Let an uncaught exception land in the global error middleware, which sends a 500 response.

## 10. Authentication

1. Never run the schema generator of the auth library.
2. The schema is hand-customized, and the generator destroys those customizations.
3. Keep the version of the auth library pinned in the workspace catalog.
4. Generate an identifier through the configured generator of the library.
5. Mount authentication before the typed API.
6. Mount authentication before the JSON body parser.
7. Resolve the session through the auth API.
8. Never read the cookie by hand.
9. Keep a production cookie cross-subdomain, secure, and cross-site.
10. Set the production cookie domain to `.atlashukuk.ai`, and `sameSite` to `"none"`.
11. Take the session types and the auth types from the auth module.
12. Never hand-write those types.
13. Allow a browser-extension origin in CORS, because the companion extension authenticates against this backend.

## 11. Object storage

1. Never expect an object in storage to persist.
2. Every pipeline extracts the text into the database and never reads the object again.
3. Never delete an object from the API.
4. A user can delete an attachment while the worker still extracts from it.
5. Let the bucket lifecycle rule remove the objects that this leaves.
6. Merge the lifecycle configuration.
7. Never replace the lifecycle configuration, because a write overwrites the full configuration of the bucket.
8. This code runs in every process at boot.
9. Keep every rule that another system owns.
10. Write only when our rule is missing or has drifted.
11. Abort on a read failure that is not "no configuration yet".
12. A transient read error that you read as an empty configuration destroys the other rules.
13. Log an error in a startup configuration block.
14. Swallow that error.
15. A misconfigured bucket must not stop the process from booting.
16. `STORAGE_URL` has the format `protocol://accessKey:secretKey@host:port?bucket=name&region=garage`.
17. Set `forcePathStyle` to `true`, which Garage requires.

## 12. Queueing

1. Put the current trace id into every published message payload.
2. Treat a background job as a bug when you cannot join its logs to the request that caused it.

## 13. Model integration

1. Reach the model only through the shared service package, because both apps need it.
2. Route a new model-callable function through the correct repository.
3. Never write a direct query for such a function.
4. Register a new tool in the tool registry.
5. Add a log catalog entry that records the query the tool ran.
6. Record the ids and the counts, never the bodies.
7. Tell the model in the prompt constants when to use a tool.
8. Never rename a tool key without a strong reason.
9. A tool key is model-facing vocabulary, and a rename invalidates the prompt text.

## 14. Testing

1. Treat an endpoint without a test file as unfinished.
2. Keep the tests in a test folder at the package root.
3. Never keep a test inside the source tree.
4. Write one test file per endpoint.
5. Never write one test file per router or per feature.
6. Cover the success path.
7. Cover the failure paths: bad input, missing authentication, wrong owner, and absent row.
8. Run the suite with `pnpm -F @atlas/backend test`.
9. Run the tests against the real services on `localhost`, because there is no mocking layer for them.
10. Import `setup` from `./setup`, and call it at the top of a suite.
11. Expect `setup` to seed a test user, a role, and a credit, and to register the cleanup hooks.
12. Read `ctx.userId` and `ctx.headers` inside a test.
13. Call `setup("admin")` when the endpoint needs the admin role.
14. Create test data with a `randomUUID()` identifier.
15. Clean up everything the test created.
16. Assert the effect, and not only the response.
17. A success status that wrote nothing is a failing test.
18. Assert the status code.
19. Assert `{ success: true, data, error: null }` for a REST response.
20. Assert the data directly for a typed-API response.
21. Assert that the test created, updated, or deleted the row with the values you expect.
22. Assert that the endpoint published the message on the correct queue.
23. Assert that the message carries the trace id.
24. Assert that the stored object exists, or that a worker run removed it.
25. Assert that the API rejects an unauthenticated request.
26. Assert that the API rejects a request from the wrong user.
27. Read a connection error as a stack that is down, not as a broken test.
28. Read a missing-column error as a pending schema push, not as a bug in the test.
29. Run the integration suites on your machine, because continuous integration does not run them.
