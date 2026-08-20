import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        // Next.js detects a dynamic page from its own server error, so the
        // error has to reach it unredacted.
        shouldRedactErrors: () => false,
      },
    },
  });
