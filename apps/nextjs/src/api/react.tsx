"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "~/api/query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") return createQueryClient();
  return (clientQueryClientSingleton ??= createQueryClient());
};

export function QueryProvider(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {props.children}
    </QueryClientProvider>
  );
}
