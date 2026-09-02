import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    env: {
      // Every suite mocks the repository module, so no query runs and no
      // connection opens. This only stops the db environment module from
      // throwing if something pulls the client into the graph.
      POSTGRES_URL: "postgres://user:pass@localhost:5432/test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["src/**"],
      exclude: ["src/**/__tests__/**", "**/*.d.ts"],
      // Set just under what the suite reaches today, so it ratchets without a
      // one-line refactor turning the gate red. Raise it as coverage rises.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    },
  },
});
