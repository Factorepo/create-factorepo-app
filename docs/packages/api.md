# API

## 1. Responsibility

1. Keep one file for every endpoint, exporting one function named after it.
2. Declare the request interface and the response interface in that file.
3. Take an input that the route adapter parsed already, and return the result.
4. Orchestrate the task stage by stage in that one function.

## 2. Layout

1. Group the endpoints by sub-domain, one folder each.
2. Export every endpoint function from the entry point.
3. Keep one stage helper, at the root, in `stage.ts`.

## 3. May use

1. A service function, for a one unit of work.
2. A guard function, for a business check.
3. A boundary package, for an external system.
4. The logger and the log events from [packages/service](../../packages/service) package.
5. The application error from [packages/service](../../packages/service) package.

## 4. Must not

1. Never call another endpoint function.
2. Never put a business rule here.
3. Never put a domain logic here.
4. Never perform a unit of work here, as [service.md](service.md) defines it.
5. Never wrap a guard function in a stage. A service function that guards inside itself is not a guard call, and it belongs in a stage.
6. Never nest a stage.

## 5. The stage helper

1. Each call to a service function, or a boundary package function is a step.
2. Enclose each step in the stage helper.
3. Provide a stage name, a log event, and one function for each stage.
4. Change an exception at the boundary to an upstream error inside the stage.
5. Write a success log entry or a failure log entry inside the stage.

## 6. Route adapters

1. Keep one route-adapter file for each sub-domain in `routes/`, and export one `<domain>Routes` object from it.
2. Give the object one method for each endpoint, and take the `RouteContext`.
3. Parse every parameter and every body with `parseInput` and a Zod schema before the endpoint call.
4. Call `requireSession` before the endpoint call when the endpoint needs a user.
5. Call exactly one endpoint function, and return its result without a change.
6. Never catch, never log, and never shape a response here. The handler owns that.

## 7. The handler

1. Keep `apiRoute`, the CORS headers, and the JSON response in `handler.ts`.
2. Keep the context and `requireSession` in `context.ts`.
3. Keep the wire codes, the error body, and `parseInput` in `errors.ts`.
4. Return the result of the adapter as the JSON body with status 200.
5. Change an application error to `{ error: { code, message, fieldErrors } }`, and read the status from the error code.
6. Change an unknown exception to an internal application error, and log the failure with the route, the method, and the status.
7. Never send credentials over CORS, and never narrow the wildcard origin without an instruction from the user.
8. Keep `webhookRoute` in `handler.ts`, beside `apiRoute`.
9. Give `webhookRoute` the raw body and the request, and never a session context.
10. Verify the signature in the boundary package of that provider, and never here.
11. Answer 200 on a verified event, and 400 on a rejected signature.
