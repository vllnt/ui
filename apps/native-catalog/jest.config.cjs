/** @type {import('jest').Config} */
module.exports = {
  preset: "react-native",
  moduleNameMapper: {
    "^@vllnt/ui-core$": "<rootDir>/../../packages/ui-core/src/index.ts",
    "^@vllnt/ui-native$": "<rootDir>/../../packages/ui-native/src/index.ts",
  },
  testMatch: ["<rootDir>/**/*.test.ts", "<rootDir>/**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((?:\\.pnpm/[^/]+/node_modules/)?(?:react-native|@react-native(?:-community)?|@testing-library/react-native|@vllnt/ui-native|expo(?:nent)?|@expo(?:nent)?/.*|expo-status-bar))/)",
  ],
};
