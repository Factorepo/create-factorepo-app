# Expo

The mobile app owns the **rendering and the interaction on the device**. It owns
no business rule.

Obey [apps/nextjs.md](nextjs.md) § 2, § 4, § 6, § 7 and § 10. This file holds
only what the native app does differently.

## 1. Responsibility

1. Let a screen file compose and render imported components, and do nothing
   else.
2. Give each block of a screen one responsibility.
3. Put every route in Expo Router.

## 2. Layout

1. Keep every route in `src/app/`, and name each file for its route segment.
2. Keep the native entry point at `index.ts`, and keep it to one import.
3. Keep the API client, the auth client, and the base URL in `src/utils/`.
4. Keep the Expo configuration in `app.config.ts`, and the build profiles in
   `eas.json`.
5. Keep the style entry point at `src/styles.css`.
6. Read "page" as "screen" in the layout rules of [nextjs.md](nextjs.md) § 2.
   Every other word of that section applies to this app unchanged.

## 3. May use

1. The typed API client of `src/utils/api.ts`, through a TanStack Query hook.
2. The auth client of `src/utils/auth.ts`.
3. A type of [packages/api](../../packages/api), as a type-only import.
4. A message of [packages/constants](../../packages/constants).
5. A token that `tooling/tailwind/theme.css` defines.

## 4. Must not

1. Never define a component, a hook, a business rule, or a transformation in a
   screen file. [nextjs.md](nextjs.md) § 2 says where each one goes.
2. Never import a value from [packages/api](../../packages/api). Import a type
   only, and keep the package a dev dependency.
3. Never import [packages/ui](../../packages/ui). It builds for the DOM.
4. Never import a package that reads the environment of the server.
5. Never put a secret in this app. The bundle ships to the device, and a reader
   can open it.

> A value import pulls the server code of the API package into the bundle. A
> type import disappears at build time and leaves nothing behind.

## 5. Routes

1. Let Expo Router derive each route from the file name.
2. Keep every provider in the root layout, and keep the root layout free of
   screen markup.
3. Address a route with the typed `href` object, and never build a path with a
   template literal.
4. Read a dynamic parameter with `useGlobalSearchParams`, and give the parameter
   a type.
5. Render nothing until the query of a screen returns data.

> A typed `href` breaks the build when a route moves. A concatenated path breaks
> on the device, in front of the user.

## 6. Data

1. Call the API through `src/utils/api.ts` only.
2. Attach the session cookie by hand, because the native runtime holds no cookie
   jar.
3. Keep every query key of one domain in one keys object, and invalidate with
   that object.
4. Throw `ApiClientError` for a failed response, and read `code` to tell the
   cases apart.
5. Read a field message from `fieldErrors`, and show it next to its field.
6. Point the base URL at the Metro host in development, and at the production
   URL in a build.

## 7. Styling

1. Style with a NativeWind class, and keep custom CSS to a minimum.
2. Give every color a light value and a dark value.
3. Read the scheme with `useColorScheme`, and never test the platform for a
   color.

> A native screen has no cascade to fall back on. A color without a dark value
> stays wrong until somebody opens the app at night.

## 8. Native

1. Store a token with `expo-secure-store`, and never with `AsyncStorage`.
2. Register every native module in the `plugins` array of `app.config.ts`.
3. Ask the user before you add a native module, because the module needs a new
   build.
