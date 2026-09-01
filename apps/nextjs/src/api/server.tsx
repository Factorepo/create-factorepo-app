import type { FetchQueryOptions, QueryKey } from "@tanstack/react-query";
import { cache } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import type { ApiContext } from "@acme/api";
import { createApiContext } from "@acme/api";

import { createQueryClient } from "~/api/query-client";
import { auth } from "~/auth/server";

export const createContext = cache(async (): Promise<ApiContext> =>
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

export function prefetch<TData, TKey extends QueryKey>(
  options: FetchQueryOptions<TData, Error, TData, TKey>,
) {
  void getQueryClient().prefetchQuery(options);
}
