# Next.js Rules

## 1. Routes

1. Put every page in the App Router.
2. Never add a legacy pages directory.
3. Treat a server component as the default.
4. Mark a client component explicitly.
5. Keep the protected-route list of the middleware identical to the sidebar list of the layout.
6. A route in one list but not the other shows the sidebar to a logged-out user, or hides it from a logged-in user.

## 2. Page files are composition only

1. Let a page file compose and render imported components.
2. Let a page file do nothing else.
3. Never define a component in a page file.
4. Never put a hook in a page file.
5. Never put business logic in a page file.
6. Never put a data transformation in a page file.

## 3. Component placement

1. Put a component that one route uses beside that route.
2. Put a component that more than one route uses in the shared components folder.
3. Put a small shared sub-UI in its own folder under the shared components folder.
4. Put every hook in the hooks folder.
5. Put a domain composite in the shared components folder of the app.
6. Never put a domain composite in the shared UI package.
7. Give a route folder its own components sub-folder for its own parts.

## 4. Micro-components

1. Break a page into small blocks.
2. Give each block one responsibility.
3. Extract deeply nested markup into its own component.
4. Extract a complex conditional into its own component.
5. Extract a distinct section into its own component.
6. Do these extractions as a matter of course, not as cleanup.
7. Split a file into smaller logical files after one hundred to one hundred and fifty lines.
8. Never ship a monolithic component.

## 5. Hooks

1. Name a hook file in camelCase.
2. Start the name of a hook file with `use`.
3. Treat the hooks folder as the approved boundary for an effect.
4. Reuse the established hydration hook for code that measures the DOM.
5. Reuse the same hook for code that reads browser-only state.
6. Render nothing until that hook reports that hydration is complete.
7. Read browser-local state through the external-store subscription primitive.
8. Never read browser-local state through an effect.
9. Never invent a new mount flag when the established pattern covers the case.

## 6. Naming

1. Name a module or a utility in kebab-case.
2. Name a React component file in PascalCase.
3. Name a React component function in PascalCase.
4. Default-export a page.
5. Named-export a shared component.

## 7. The useEffect policy

1. Never call an effect directly in a component file or a page file.
2. Use an effect only to synchronize with an external system.
3. You do not need an effect when there is no external system.
4. Treat a state update inside an effect as a cost of two render passes or more.
5. Those extra passes cause the unnecessary re-renders, the cascading updates, and the stale-value flashes.
6. Use the named mount hook for a single external sync on mount.
7. Put a true external-system sync in a purpose-built hook in the hooks folder.
8. Treat an existing raw call as legacy code that we track for removal.
9. Never add a raw call in new code.

## 8. Effect replacements

1. Compute derived state during the render.
2. Memoize the derived state when the computation is expensive.
3. Never set derived state in an effect.
4. Fetch through the query library, which gives caching, cancellation, and staleness control.
5. Call the action directly in the handler that would set a flag.
6. Remount with a key when an id changes.
7. Never reset the local state in an effect for that case.
8. Notify the parent from the handler that updates the state.
9. Never notify the parent from an effect that watches the state.
10. Let the parent own the fetch.
11. Never hand fetched data upward through a callback.
12. Derive the values during the render, and batch the state updates in one handler.
13. Never chain effects for that case.
14. Subscribe to an external store through the purpose-built primitive.
15. Never subscribe to an external store by hand.

## 9. Effect smell tests — stop and refactor

1. Stop when an effect only sets state from a dependency, because that state is derived.
2. Stop when state only mirrors other state or props, because that state is redundant.
3. Stop when an effect fetches data and sets state.
4. Stop when you see a set-flag, run-effect, reset-flag sequence.
5. Stop when the only job of an effect is to reset state on an id change.
6. Stop when a dependency array holds more than three items, because the effect does too much.
7. Stop when an effect notifies the parent of a state change.
8. Stop when an effect hands fetched data to the parent through a callback.

## 10. The tagging rule

1. Refactor an effect away, which is the preferred outcome.
2. Tag an effect that you cannot remove as audited.
3. Write the tag as `// effect:audited — <reason>`.
4. Put the tag on the line immediately above the effect.
5. Exempt a hook in the hooks folder, which is the approved boundary.

## 11. Before you write an effect

1. Check whether a replacement in section 8 applies.
2. Put a necessary external-system sync in a custom hook.
3. Never leave a raw effect in a component file.
4. Flag an existing raw effect.
5. Recommend the refactor instead of adding another effect beside it.
6. Treat a state-setting effect as a smell when you review or generate code.
7. Remove that effect, or justify it.
8. Use the event API of a third-party library before you write an effect to watch its state.
9. Guard a library that cannot render on the server with the established hydration pattern.

## 12. Styling

1. Configure the utility framework through CSS imports, because there is no JavaScript config file.
2. Import the theme from the shared tooling config.
3. Declare a custom variant in CSS.
4. Treat the shared theme file as the only source of the design tokens.
5. Use only a token that the shared theme file defines.
6. Ask the user to add a token that does not exist.
7. Never introduce an ad-hoc value.
8. Reach for a semantic token first, because it is correct in light mode and in dark mode.
9. Reach for a brand value or an accent value only when no semantic token fits.
10. Never use a raw palette color, because it does not adapt to the theme.
11. Pass a CSS variable reference when a third-party component takes a raw color string.
12. Render as much of the visible surface as you can through your own component with semantic classes.
13. Send only the unavoidable part through the style API of the library.

## 13. Shared UI

1. Keep the shared UI package at foundation level.
2. Put only design-system primitives and generic building blocks in it.
3. Give each shared component its own subpath export.
4. Never put an app-specific or a domain-specific component in the shared UI package.
5. Treat such a component as a layering violation, not as a shortcut.
6. Use the existing library first.
7. Never hand-roll a primitive that the library provides.
8. Merge the class names with the shared helper.
9. Ask the user when the primitive you need is not installed, because the user decides on an installation.
10. Never assume that a primitive exists.
11. List the package contents before you trust a list of the installed primitives.

## 14. Data access

1. Call the standalone API server.
2. Never call a framework route handler.
3. Point the base URL of the auth client at the same API server, which is `NEXT_PUBLIC_BACKEND_URL`.
4. A base URL on the frontend origin produces a call that returns 404.
5. Call the auth client directly from a client component, because there is no proxy endpoint.
6. Use the `api` client from `~/api/client` in a client component.
7. Include the credentials with `credentials: "include"`, so that the session cookie goes with the request.
8. Read with `useQuery` or with `useSuspenseQuery`, and write with `useMutation`.
9. Take every query key from the key factory that `~/api/client` exports.
10. Never write a query key inline.
11. Call a service from `@acme/api` in a server component.
12. Build the request context with `createContext` from `~/api/server`, which forwards the incoming headers.
13. A server component reads through the service and makes no HTTP request.
14. Prefetch and hydrate on the server with `prefetch` and `HydrateClient` when a client component needs the same data.
15. Give the prefetch the same query key that the client component subscribes to.
16. The client component then reads the cache and makes no second request.
17. Take the response types from `@acme/api`.
18. Take the input schemas from `@acme/db/schema`.
19. Never hand-type an API response, because a manual type drifts and the compiler stops helping you.
20. Narrow a failure on `ApiClientError` and on its `code` field.
21. Never narrow a failure on the HTTP status.
22. Seed the query cache from the mutation result when the mutation returns the new state.
23. Never refetch in that case.
24. Read the environment through `~/env`.

## 15. Session cookies

1. Check both names of the session cookie wherever you read it, because the name depends on the protocol.
2. The two names are `better-auth.session_token` and `__Secure-better-auth.session_token`.
3. A check of one name works on your machine and fails in production, or the reverse.

## 16. Uploads

1. Send a file upload to a route that reads the multipart body, because the JSON body reader rejects it.
2. Follow the presign step, then the upload step, then the complete step.
3. Never build UI that expects an uploaded file to stay retrievable, because a stored object is transient.

## 17. Testing

1. Ship a test with every new component.
2. Ship a test with every extracted piece of logic.
3. Ship a test with every modified feature.
4. Run the suite with `pnpm test:nextjs`.
5. Keep the tests in a `__tests__/` folder beside the code.
6. Write one test file per component or per hook.
7. Write a page test for the composition of the page.
8. Never write one test file per feature.
9. Assert that a component renders.
10. Assert that a component responds to an interaction.
11. Assert that a component handles its empty, loading, and error states.
12. Assert the returned state of a hook at each transition.
13. Assert the failure path of a hook.
14. Assert the pre-fill, the edit, the validation limits, and the save failure of a form.
15. Assert both branches of a conditional UI.
16. Assert that a structural contract that another module depends on still exists.
17. Assert a link whenever one module addresses another by a string, because such a link breaks silently at runtime.
18. Mock anything that needs real layout, because the test DOM does no meaningful layout.
19. Assert on the props that you hand to a mocked library.
20. Assert on your own callback logic.
21. Never assert on the rendering of a mocked library.
22. Test a component against a mocked API layer, not against a live backend.
23. The backend suites hold the real integration coverage.
24. Assert against the actual user-facing strings.
25. Import those strings from their constants file, and never duplicate them in the test.
