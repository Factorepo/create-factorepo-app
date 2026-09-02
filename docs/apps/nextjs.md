# Next.js

The frontend owns the **rendering and the interaction**. It owns no business
rule. [backend.md](backend.md) owns the API routes inside this app.

## 1. Responsibility

1. Let a page file compose and render imported components, and do nothing else.
2. Give each block of a page one responsibility.
3. Put every route in the App Router.

## 2. Layout

1. Put a shared component in `src/app/_components/`, grouped in a folder named
   for its feature.
2. Put every hook in `src/app/_components/hooks/`.
3. Keep a form in its own component, with its Zod schema beside it.
4. Keep the tests in a `__tests__/` folder beside the code.
5. Name every file in kebab-case, and start a hook file with `use`.
6. Name a component in PascalCase, and a hook or utility in camelCase.
7. Default-export a page, and named-export a shared component.

## 3. May use

1. The typed API client of `src/api/client.ts`, in a client component, through a
   TanStack Query hook.
2. An endpoint function of [packages/api](../../packages/api), called directly
   in a server component. Build the request context of `src/api/server.tsx`
   first when the endpoint needs a session, and pass what it needs as an
   argument.
3. The auth client, directly from a client component.
4. A token that `tooling/tailwind/theme.css` defines.
5. A component of [packages/ui](../../packages/ui), through its subpath.
6. A message of [packages/constants](../../packages/constants).

## 4. Must not

1. Never define a component, a hook, a business rule, or a transformation in a
   page file.
2. Never ship a monolithic component. Extract nested markup, a complex
   conditional, and a distinct section.
3. Never add a legacy pages directory.
4. Never hand-type an API response. Import the type of the endpoint from
   [packages/api](../../packages/api).
5. Never write an ad-hoc style value or a raw palette color such as `slate-*`.
6. Never put a domain component in [packages/ui](../../packages/ui).

> A hand-typed response drifts from the endpoint, and the compiler stops helping
> you at the moment you need it most.

## 5. Routes

1. Keep a page file a server component, and export `metadata` with a title and a
   description.
2. Give a route `loading.tsx` when its page awaits data, and `error.tsx` when it
   can fail.
3. Mark `error.tsx` as a client component, and offer a retry that calls `reset`.
4. Keep one `not-found.tsx` at the root. Keep the page guard in `src/proxy.ts`,
   and add every protected route prefix to it.

> Only a server component can export metadata. The root layout supplies every
> other field.

## 6. Effects

1. Use an effect only to synchronize with an external system.
2. Never use one to transform data or to run the logic of an interaction.
3. Write the reason above an effect when its dependency array is not empty.
4. Prefer that reason to a workaround. Never add a wrapper hook, a mount flag, or an indirection to avoid an effect.
5. Read a changing external value with `useSyncExternalStore`, and give it a server snapshot.
6. Render a server-safe default for a one-shot client-only read, and replace it in an effect.
7. Never fetch in an effect. Read the data through a query hook.

> An effect is not the preferred tool, and it is also not forbidden. An empty
> dependency array runs once and reads as what it is. An array that is not empty
> claims the effect must run again when exactly these values change, and no
> compiler checks that claim, so write it down. A wrapper invented to avoid
> writing one sentence costs a file, a test, and the next reader's afternoon.

## 7. Styling

1. Style with a Tailwind utility class, and keep custom CSS to a minimum.
2. Treat `tooling/tailwind/theme.css` as the only source of the design tokens.
3. Reach for a semantic token first, such as `bg-background` or
   `text-foreground`.
4. Reach for `brand-*` or `accent-*` only when no semantic token fits.
5. Ask the user to add a missing token to `theme.css` first.
6. Style a third-party component through a wrapper of your own, and pass a CSS
   variable when it takes a raw color.

> A semantic token adapts to light and dark mode. A raw palette color does not,
> and the bug appears only in the other theme. Tailwind v4 has no
> `tailwind.config.js`.

## 8. Data

1. Create the auth client with no base URL, because the API lives on the same
   origin.
2. Forward the incoming headers from a server component.
3. Prefetch with `prefetch` and `HydrateClient` when a client component needs
   the same data.
4. Seed the query cache from a mutation result, and never refetch in that case.
5. Call an API route only through the typed client of `src/api/client.ts`, and
   never with a hand-built fetch.

## 9. Forms

1. Validate with the Zod schema before you send.
2. Show a field message next to the field, and a request error above the submit
   control.
3. Disable submit while the request runs, and never clear the input after a
   failure.
4. Take every message from [packages/constants](../../packages/constants).

## 10. Tests

1. Ship a test with every new component, extracted logic, and modified feature.
2. Write one test file per component or per hook, and a page test for the
   composition.
3. Assert that a component renders, responds to an interaction, and handles its
   empty, loading, and error states.
4. Assert each transition and the failure path of a hook.
5. Assert the pre-fill, the validation limits, and the save failure of a form.
6. Assert a link whenever one module addresses another by a string.
7. Assert against the user-facing strings, imported from their constants file.
8. Mock the API layer and anything that needs real layout, and assert on the
   props you hand it.
9. Never assert on the rendering of a mocked library.

> A string link between two modules breaks silently at runtime. Nothing
> type-checks it, so a test is the only thing that can hold it.

> The test DOM does no meaningful layout. A component that measures the DOM
> reads zero for every size and passes a test that proves nothing.
