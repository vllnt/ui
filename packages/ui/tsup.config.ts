import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { defineConfig } from "tsup";

const outputDirectory = resolve(import.meta.dirname, "dist");
const relativeSpecifierPattern =
  /(\b(?:from|import)\s*(?:\(\s*)?)(["'])(\.\.?\/[^"'?#]+)\2/g;
const dependencyDirectorySpecifiers = new Map([
  [
    "react-syntax-highlighter/dist/esm/styles/prism",
    "react-syntax-highlighter/dist/esm/styles/prism/index.js",
  ],
]);

async function listJavaScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? listJavaScriptFiles(path)
        : Promise.resolve(path.endsWith(".js") ? [path] : []);
    }),
  );

  return files.flat();
}

async function makeEsmSpecifiersResolvable(): Promise<void> {
  const files = await listJavaScriptFiles(outputDirectory);
  const outputFiles = new Set(files.map((file) => resolve(file)));

  await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf8");
      const rewritten = source
        .replace(
          relativeSpecifierPattern,
          (match, prefix: string, quote: string, specifier: string) => {
            const target = resolve(dirname(file), specifier);
            let resolvedSpecifier: string | undefined;

            if (outputFiles.has(`${target}.js`)) {
              resolvedSpecifier = `${specifier}.js`;
            } else if (outputFiles.has(join(target, "index.js"))) {
              resolvedSpecifier = `${specifier.replace(/\/$/, "")}/index.js`;
            }

            return resolvedSpecifier
              ? `${prefix}${quote}${resolvedSpecifier}${quote}`
              : match;
          },
        )
        .replace(
          /(\b(?:from|import)\s*(?:\(\s*)?)(["'])([^"']+)\2/g,
          (match, prefix: string, quote: string, specifier: string) => {
            const resolvableSpecifier =
              dependencyDirectorySpecifiers.get(specifier);
            return resolvableSpecifier
              ? `${prefix}${quote}${resolvableSpecifier}${quote}`
              : match;
          },
        );

      if (rewritten !== source) await writeFile(file, rewritten);
    }),
  );
}

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/tailwind-preset.ts",
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.*",
    "!src/**/*.visual.*",
    "!src/**/*.stories.*",
    "!src/**/__tests__/**",
  ],
  format: ["esm"],
  dts: { entry: ["src/index.ts", "src/tailwind-preset.ts"] },
  bundle: false,
  outDir: "dist",
  clean: true,
  target: "es2020",
  tsconfig: "tsconfig.build.json",
  onSuccess: makeEsmSpecifiersResolvable,
});
