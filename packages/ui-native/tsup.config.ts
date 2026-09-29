import { dirname, relative, resolve, sep } from "node:path";

import { defineConfig, type Options } from "tsup";

type EsbuildPlugin = NonNullable<Options["esbuildPlugins"]>[number];

const sourceDirectory = resolve(import.meta.dirname, "src");
const resolvingSourceImport = Symbol("resolving-source-import");

// Emit one ESM file per source module instead of a single bundle. With
// `"sideEffects": false`, consumer bundlers can then drop every component a
// consumer does not import; a single file forces them to keep all of it.
// Source imports stay external and are rewritten to their emitted `.js` path.
const preserveSourceModules: EsbuildPlugin = {
  name: "preserve-source-modules",
  setup(build) {
    build.onResolve({ filter: /.*/ }, async (arguments_) => {
      if (
        arguments_.kind === "entry-point" ||
        arguments_.pluginData === resolvingSourceImport
      ) {
        return undefined;
      }

      const result = await build.resolve(arguments_.path, {
        importer: arguments_.importer,
        kind: arguments_.kind,
        pluginData: resolvingSourceImport,
        resolveDir: arguments_.resolveDir,
      });
      if (result.errors.length > 0) return { errors: result.errors };
      if (result.external || !result.path.startsWith(sourceDirectory + sep)) {
        return undefined;
      }
      if (!/\.tsx?$/.test(result.path)) {
        return {
          errors: [
            { text: `Only TypeScript source modules are emitted: ${result.path}` },
          ],
        };
      }

      const specifier = relative(dirname(arguments_.importer), result.path)
        .split(sep)
        .join("/")
        .replace(/\.tsx?$/, ".js");
      return {
        external: true,
        path: specifier.startsWith(".") ? specifier : `./${specifier}`,
      };
    });
  },
};

export default defineConfig({
  bundle: true,
  clean: true,
  dts: { entry: ["src/index.ts"] },
  entry: ["src/**/*.{ts,tsx}", "!src/**/*.test.*", "!src/tests/**"],
  esbuildPlugins: [preserveSourceModules],
  external: ["@vllnt/ui-core", "react", "react-native"],
  format: ["esm"],
  outDir: "dist",
  target: "es2020",
  tsconfig: "tsconfig.build.json",
});
