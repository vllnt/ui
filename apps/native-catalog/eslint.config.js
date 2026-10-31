import { react } from "@vllnt/eslint-config";

export default [
  {
    ignores: [
      ".expo/**",
      "dist/**",
      "node_modules/**",
      "eslint.config.js",
      "*.config.cjs",
    ],
  },
  ...react,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      // Demo handlers discard their argument with `void arg;`.
      "@typescript-eslint/no-meaningless-void-operator": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
];
