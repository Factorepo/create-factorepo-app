# Backend

The backend owns the **request and the response**.

## 1. Responsibility

1. Write every endpoint as three lines: validate the input, call one API
   function, return the result.
2. Return every REST response in the shared `{ success, data, error }` envelope.
3. Build the auth instance in [packages/auth](../../packages/auth), not here.

## 2. Layout

1. Keep the process wiring, the middleware, and `cors.ts` in the source root.
2. Keep every endpoint in `router/`.
3. Give each domain one file there, named after the matching API folder.
4. Compose the domain files in the `index.ts` of that folder.

## 3. May use

1. One function of [packages/api](../../packages/api).
2. The auth instance.
3. The logger and the log events from [packages/service](../../packages/service) package.
4. The application error from [packages/service](../../packages/service) package.

## 4. Must not

1. Never call two API functions from one endpoint.
2. Never call a service or a boundary package.
3. Never put a business rule here.
4. Never put a domain logic here.

## 5. Middleware

Mount in this order: CORS, the log middleware, the health route, the routes, the
error middleware.

1. Send credentials on CORS, and expose the trace-id headers.
2. Add a new origin in `cors.ts` only.
3. Take the trace id from the header or generate one, echo it, and open the log
   context once.
4. Log the start, then the completion or the failure with the status and the
   duration.
5. Read the status from the error code, take a framework status in the 400-599
   range, and fall back to 500.
6. Send the user-facing text of the application error.
