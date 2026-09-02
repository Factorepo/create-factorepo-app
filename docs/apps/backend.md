# Backend

The backend owns the **request and the response**. It lives inside the Next.js
app, under `src/app/api/`, and it owns no business rule.

Read [nextjs.md](nextjs.md) for the app around it, and
[packages/api.md](../packages/api.md) § 6 and § 7 for the route adapters and
the handler that this layer binds to.

## 1. Responsibility

1. Write every route file as bindings only. Export each method as
   `apiRoute(auth, <domain>Routes.<name>)`, and export
   `OPTIONS = corsPreflight`.
2. Let the route adapter parse the input, call one endpoint function, and
   return the result.
3. Take the auth instance from `src/auth/server.ts`, and never build one here.

## 2. Layout

1. Keep every route handler under `src/app/api/`, one folder per REST path.
2. Bind one domain per route file, and take its methods from one route object.
3. Mount Better Auth at `src/app/api/auth/[...all]/route.ts`, and keep that
   file to the handler export.
4. Keep the health route at `src/app/api/health/route.ts`, and return a static
   200 body. This is one of the two exemptions to § 1.1, because the deployment
   probes it and it must not touch the context, the database, or the log.
5. Bind an inbound callback with `webhookRoute`, and never with `apiRoute`. This
   is the second exemption to § 1.1, because the sender holds no session and the
   signature is checked against the bytes as they arrived.
6. Keep every inbound callback under `src/app/api/webhooks/`, one folder per
   provider.

## 3. May use

1. `apiRoute`, `webhookRoute`, `corsPreflight`, and a route object of
   [packages/api](../../packages/api).
2. The auth instance of `src/auth/server.ts`.

## 4. Must not

1. Never parse, validate, authorize, transform, or log in a route file.
2. Never import a service, a boundary package, or the database from a route
   file.
3. Never put a business rule or a domain logic here.
4. Never call an endpoint function directly from a route file. Bind a route
   object method instead.

## 5. The request lifecycle

`apiRoute` owns the lifecycle, in this order: the CORS headers, the context,
the parameters, the route adapter, then the error mapping.
[packages/api.md](../packages/api.md) § 7 holds its rules.

> A route file with logic splits the endpoint between the app and the API
> package, and the mobile app gets only half of it.
