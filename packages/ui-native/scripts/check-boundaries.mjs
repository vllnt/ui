import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const bannedImports = [
  "@radix-ui/",
  "@vllnt/ui\"",
  "@vllnt/ui'",
  "nativewind",
  "next/",
  "react-dom",
  "tailwindcss",
];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? sourceFiles(path) : [path];
    }),
  );
  return nested.flat().filter((path) => [".ts", ".tsx"].includes(extname(path)));
}

const errors = [];
for (const path of await sourceFiles(sourceRoot)) {
  if (path.endsWith(".test.ts") || path.endsWith(".test.tsx")) continue;
  const source = await readFile(path, "utf8");
  for (const bannedImport of bannedImports) {
    if (source.includes(bannedImport)) {
      errors.push(`${relative(sourceRoot, path)} imports ${bannedImport}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Native renderer boundary check failed:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("Native renderer boundary check passed.");
