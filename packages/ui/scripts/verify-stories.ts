/**
 * Story Verification Script
 *
 * Validates that all .stories.tsx files provide required props in their Default story.
 * Catches runtime crashes before they reach the browser.
 *
 * Usage: pnpm -F @vllnt/ui storybook:verify
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { extractTypeBlock, parsePropsFromBlock, type PropInfo, toPascalCase } from "./lib/component-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const COMPONENTS_DIR = join(__dirname, "../src/components");
const IGNORED_REQUIRED_PROP_NAMES = new Set(["className", "key", "ref", "style"]);
const DELIMITER_OPEN = new Set(["{", "[", "("]);
const DELIMITER_CLOSE = new Set(["}", "]", ")"]);
const NON_IMPLEMENTATION_FILE_PATTERN = /\.(?:stories|test|visual)\./;

interface Violation {
  component: string;
  story: string;
  missingProps: string[];
  crashRisk: string;
}

function extractNamedPropsBlock(source: string, typeName: string): string {
  const declaration = new RegExp(
    `(?:export\\s+)?(?:type|interface)\\s+${typeName}\\b`,
    "s",
  );
  const match = source.match(declaration);
  if (match?.index === undefined) return "";

  const afterDeclaration = source.slice(match.index + match[0].length);
  const braceIndex = afterDeclaration.indexOf("{");
  if (braceIndex === -1) return "";

  return extractTypeBlock(afterDeclaration, braceIndex);
}

function extractRequiredProps(source: string, componentName: string): PropInfo[] {
  const candidateNames = [`${componentName}Props`];

  for (const candidateName of candidateNames) {
    const block = extractNamedPropsBlock(source, candidateName);
    if (block) {
      return parsePropsFromBlock(block).filter(
        (prop) => !IGNORED_REQUIRED_PROP_NAMES.has(prop.name) && prop.required,
      );
    }
  }

  const fallbackMatch = source.match(/(?:export\s+)?(?:type|interface)\s+(\w*Props)\b/s);
  if (fallbackMatch?.[1]) {
    const block = extractNamedPropsBlock(source, fallbackMatch[1]);
    if (block) {
      return parsePropsFromBlock(block).filter(
        (prop) => !IGNORED_REQUIRED_PROP_NAMES.has(prop.name) && prop.required,
      );
    }
  }

  return [];
}

function extractArgsBlock(source: string): string {
  const argsMatch = source.match(/\bargs\s*:\s*\{/);
  if (!argsMatch || argsMatch.index === undefined) return "";

  const start = argsMatch.index + argsMatch[0].length;
  let depth = 1;

  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;

    if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i);
    }
  }

  return "";
}

function extractTopLevelKeys(block: string): Set<string> {
  const keys = new Set<string>();
  let depth = 0;
  let index = 0;

  while (index < block.length) {
    if (DELIMITER_OPEN.has(block[index] ?? "")) {
      depth++;
      index++;
      continue;
    }

    if (DELIMITER_CLOSE.has(block[index] ?? "")) {
      depth--;
      index++;
      continue;
    }

    if (depth === 0) {
      const match = block.slice(index).match(/^(\w+)\s*:/);
      if (match?.[1]) {
        keys.add(match[1]);
        index += match[0].length;
        continue;
      }
    }

    index++;
  }

  return keys;
}

function extractStoryArgs(storySource: string): Set<string> {
  return extractTopLevelKeys(extractArgsBlock(storySource));
}

function extractMetaComponentName(storySource: string): string | null {
  const componentMatch = storySource.match(/\bcomponent\s*:\s*(\w+)/);
  return componentMatch?.[1] ?? null;
}

function classifyCrashRisk(prop: PropInfo): string {
  const type = prop.type.trim();

  if (type.endsWith("[]") || type.startsWith("Array<") || type.startsWith("readonly ")) {
    return "CRASH: .map()/.length on undefined";
  }

  if (type.includes("=>")) {
    return "CRASH: callback invocation on undefined";
  }

  if (type.startsWith("Set<")) {
    return "CRASH: .has()/.size on undefined";
  }

  if (/^[A-Z]/.test(type) && !["ReactNode", "React.ReactNode"].includes(type)) {
    return "CRASH: property access on undefined object";
  }

  if (type === "string" || type === "number") {
    return "WARN: renders undefined text";
  }

  if (type === "boolean") {
    return "WARN: falsy default may hide component";
  }

  return "WARN: missing required prop";
}

function verify(): void {
  const violations: Violation[] = [];
  let checked = 0;

  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) =>
    statSync(join(COMPONENTS_DIR, dir)).isDirectory(),
  );

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir);
    const componentName = toPascalCase(dir);
    let fallbackMainFile: string | undefined;
    let mainFile: string | undefined;
    let storyFile: string | undefined;

    for (const file of readdirSync(dirPath)) {
      if (file === `${dir}.tsx`) {
        mainFile = file;
      } else if (
        !fallbackMainFile &&
        file.endsWith(".tsx") &&
        !NON_IMPLEMENTATION_FILE_PATTERN.test(file)
      ) {
        fallbackMainFile = file;
      }

      if (!storyFile && file.endsWith(".stories.tsx")) {
        storyFile = file;
      }
    }

    mainFile ??= fallbackMainFile;

    if (!mainFile || !storyFile) continue;
    checked++;

    const source = readFileSync(join(dirPath, mainFile), "utf-8");
    const storySource = readFileSync(join(dirPath, storyFile), "utf-8");
    const metaComponentName = extractMetaComponentName(storySource);

    if (metaComponentName && metaComponentName !== componentName) {
      continue;
    }

    const requiredProps = extractRequiredProps(source, componentName);
    const providedArgs = extractStoryArgs(storySource);
    const missingProps = requiredProps.filter((prop) => !providedArgs.has(prop.name));

    if (missingProps.length === 0) continue;

    const crashProps = missingProps.filter((prop) =>
      classifyCrashRisk(prop).startsWith("CRASH"),
    );

    if (crashProps.length > 0) {
      violations.push({
        component: componentName,
        crashRisk: crashProps.map((prop) => classifyCrashRisk(prop)).join("; "),
        missingProps: crashProps.map((prop) => `${prop.name}: ${prop.type}`),
        story: `${dir}/${storyFile}`,
      });
    }
  }

  console.log("\nStory Verification Report");
  console.log("========================");
  console.log(`Checked: ${checked} components\n`);

  if (violations.length === 0) {
    console.log("All stories provide required props. No crash risks detected.");
    process.exit(0);
  }

  console.log(`Found ${violations.length} stories with missing required props:\n`);

  for (const violation of violations) {
    console.log(`  FAIL ${violation.component}`);
    for (const prop of violation.missingProps) {
      console.log(`       missing: ${prop}`);
    }
    console.log("");
  }

  process.exit(1);
}

verify();
