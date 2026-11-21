import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // Shared dev hosts: keep test parallelism low.
    maxWorkers: 2,
    environment: "node",
    globals: true,
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    // next-intl's ESM build imports `next/server` without an extension, which
    // Node cannot resolve; inlining lets Vite resolve it for the middleware tests.
    server: { deps: { inline: ["next-intl"] } },
  },
});
