import { nodejs } from "@vllnt/eslint-config";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "scripts/**",
      "src/generated/**",
      "eslint.config.js",
      "tsup.config.ts",
      "vitest.config.ts",
    ],
  },
  ...nodejs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
