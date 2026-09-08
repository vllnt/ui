/** @type {import('jest').Config} */
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@vllnt/ui-core$": "<rootDir>/../ui-core/src/index.ts",
  },
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((?:\\.pnpm/[^/]+/node_modules/)?(?:react-native|@react-native(?:-community)?|@testing-library/react-native))/)",
  ],
};
