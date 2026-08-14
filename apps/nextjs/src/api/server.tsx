import type { FetchQueryOptions, QueryKey } from "@tanstack/react-query";
import { cache } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import type { ApiContext } from "@acme/api";
import { createApiContext } from "@acme/api";

import { auth } from "~/auth/server";
import { createQueryClient } from "./query-client";

/**
 * The API context for the current request. Pass it to a service from
 * `@acme/api` to read data in a Server Component without going over HTTP.
 */
export const createContext = cache(
  async (): Promise<ApiContext> =>
    createApiContext({ headers: new Headers(await headers()), auth }),
);

const getQueryClient = cache(createQueryClient);

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

/**
 * Warms the cache for a query a client component will subscribe to. Not
 * awaited, so the page can stream while the query resolves.
 */
export function prefetch<TData, TKey extends QueryKey>(
  options: FetchQueryOptions<TData, Error, TData, TKey>,
) {
  void getQueryClient().prefetchQuery(options);
}
