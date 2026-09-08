import { defineConfig } from "tsup";

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: ["@vllnt/ui-core", "react", "react-native"],
  format: ["esm"],
  outDir: "dist",
  target: "es2020",
  tsconfig: "tsconfig.build.json",
});
