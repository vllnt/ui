import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const packageDirectory = resolve(import.meta.dirname, "..");
const componentsDirectory = join(packageDirectory, "src/components");
const indexPath = join(packageDirectory, "src/index.ts");
const registryPath = join(packageDirectory, "registry.json");

const directories = (await readdir(componentsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const missing = [];
const exports = [];
for (const name of directories) {
  const sourcePath = join(componentsDirectory, name, `${name}.tsx`);
  try {
    await readFile(sourcePath, "utf8");
    exports.push(`export * from "./components/${name}/${name}";`);
  } catch {
    missing.push(name);
  }
}

if (missing.length > 0) {
  throw new Error(
    `Native component directories require matching source files: ${missing.join(", ")}`,
  );
}

const manifest = JSON.parse(await readFile(registryPath, "utf8"));
const manifestNames = manifest.components.map((component) => component.name);
if (JSON.stringify(manifestNames) !== JSON.stringify(directories)) {
  throw new Error(
    "packages/ui-native/registry.json must list every component directory in alphabetical order.",
  );
}

const generated = [
  ...exports,
  'export { ThemeProvider, useTheme } from "./theme/theme-provider";',
  "export type {",
  "  ThemeProviderProps,",
  "  ThemeSelection,",
  '} from "./theme/theme-provider";',
  "",
].join("\n");

const current = await readFile(indexPath, "utf8");
const check = process.argv.includes("--check");
if (check && current !== generated) {
  console.error("packages/ui-native/src/index.ts is stale. Run pnpm generate:index.");
  process.exit(1);
}
if (!check && current !== generated) await writeFile(indexPath, generated);

console.log(
  check
    ? `Native export barrel is current (${exports.length} component modules).`
    : `Generated ${exports.length} native component module exports.`,
);
