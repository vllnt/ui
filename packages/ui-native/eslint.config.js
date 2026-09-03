import { react } from "@vllnt/eslint-config";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "scripts/**",
      "eslint.config.js",
      "babel.config.cjs",
      "jest.config.cjs",
      "tsup.config.ts",
    ],
  },
  ...react,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "jsx-a11y/label-has-associated-control": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
];
