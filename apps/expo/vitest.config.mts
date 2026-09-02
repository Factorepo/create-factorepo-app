import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "~": resolve(here, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      // Scoped to the utils on purpose. A component test has to render a React
      // Native tree, and react-native reaches its own internals through CommonJS
      // `require`, which vite never sees and so never transforms. Widen this
      // when a renderer decision lands.
      include: ["src/utils/**"],
      exclude: ["src/**/__tests__/**", "**/*.d.ts"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
