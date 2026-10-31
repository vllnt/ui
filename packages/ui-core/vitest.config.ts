import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Shared dev hosts: keep test parallelism low.
    maxWorkers: 2,
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
