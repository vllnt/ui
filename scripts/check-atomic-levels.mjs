/**
 * Atomic Design level check for a component package.
 *
 * Usage:
 *   node scripts/check-atomic-levels.mjs <componentsDir> [--base <dir>]...
 *
 * Expected layout: <componentsDir>/{atoms,molecules,organisms,templates}/<name>/
 * Files directly in <componentsDir> (barrel, cross-cutting tests) are allowed.
 *
 * A component may import (relative imports that resolve into <componentsDir>):
 *   atoms      -> no other component (only lib / hooks / utils outside it)
 *   molecules  -> atoms
 *   organisms  -> atoms, molecules, organisms
 *   templates  -> atoms, molecules, organisms (never another template)
 * The check also fails on import cycles between components, component folders
 * outside a level folder, duplicate names across levels, and imports of the
 * components barrel. `--base <dir>` (repeatable) marks a directory that sits
 * below atoms, such as a package's primitives: its files may not import any
 * component. Static imports, re-exports, `import()` and `require()` count.
 * Stories, tests, visual fixtures, MDX and `__tests__` are exempt: demos may
 * compose components from any level.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const LEVELS = ["atoms", "molecules", "organisms", "templates"];

const ALLOWED_IMPORTS = {
  atoms: [],
  molecules: ["atoms"],
  organisms: ["atoms", "molecules", "organisms"],
  templates: ["atoms", "molecules", "organisms"],
};

const SOURCE_FILE = /\.[cm]?[jt]sx?$/;
const EXEMPT_FILE = /\.(?:stories|test|spec|visual)\.[cm]?[jt]sx?$|\.d\.[cm]?ts$/;
const REGEX_KEYWORDS = new Set([
  "await",
  "case",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "in",
  "instanceof",
  "new",
  "of",
  "return",
  "throw",
  "typeof",
  "void",
  "yield",
]);

/**
 * Returns the module specifiers of `from "x"`, `import "x"`, `import("x")`
 * and `require("x")` with their line numbers. Comments, strings, template
 * literals and regex literals are skipped, so text that merely looks like an
 * import is ignored. Plain quoted strings and regex literals never span lines,
 * which bounds any misread of JSX text to a single line.
 */
export function findImportSpecifiers(source) {
  const imports = [];
  const recent = [];
  let index = 0;
  let line = 1;

  const remember = (token) => {
    recent.push(token);
    if (recent.length > 3) recent.shift();
  };
  const previous = (offset) => recent[recent.length - offset];

  const isImportSite = () => {
    const last = previous(1);
    if (last?.kind === "word" && (last.value === "from" || last.value === "import")) {
      return previous(2)?.value !== ".";
    }
    const callee = previous(2);
    return (
      last?.value === "(" &&
      callee?.kind === "word" &&
      (callee.value === "import" || callee.value === "require") &&
      previous(3)?.value !== "."
    );
  };

  const regexAllowed = () => {
    const last = previous(1);
    if (last === undefined) return true;
    if (last.kind === "word") return REGEX_KEYWORDS.has(last.value);
    return last.kind === "punct" && last.value !== ")" && last.value !== "]";
  };

  const readQuoted = (quote) => {
    let value = "";
    index += 1;
    while (index < source.length) {
      const char = source[index];
      if (char === quote || char === "\n") break;
      if (char === "\\") {
        if (source[index + 1] === "\n") line += 1;
        value += source.slice(index, index + 2);
        index += 2;
        continue;
      }
      value += char;
      index += 1;
    }
    if (source[index] === quote) index += 1;
    return value;
  };

  const skipRegex = () => {
    let inClass = false;
    index += 1;
    while (index < source.length) {
      const char = source[index];
      if (char === "\n") return;
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === "[") inClass = true;
      else if (char === "]") inClass = false;
      else if (char === "/" && !inClass) {
        index += 1;
        while (/[a-z]/i.test(source[index] ?? "")) index += 1;
        return;
      }
      index += 1;
    }
  };

  const skipBlockComment = () => {
    const end = source.indexOf("*/", index + 2);
    const stop = end === -1 ? source.length : end + 2;
    for (let cursor = index; cursor < stop; cursor += 1) {
      if (source[cursor] === "\n") line += 1;
    }
    index = stop;
  };

  function skipTemplate() {
    index += 1;
    while (index < source.length) {
      const char = source[index];
      if (char === "\\") {
        if (source[index + 1] === "\n") line += 1;
        index += 2;
        continue;
      }
      if (char === "`") {
        index += 1;
        return;
      }
      if (char === "\n") line += 1;
      if (char === "$" && source[index + 1] === "{") {
        index += 2;
        scan(true);
        continue;
      }
      index += 1;
    }
  }

  function scan(untilClosingBrace) {
    let depth = 0;
    while (index < source.length) {
      const char = source[index];
      const next = source[index + 1];
      if (char === "\n") {
        line += 1;
        index += 1;
      } else if (/\s/.test(char)) {
        index += 1;
      } else if (char === "/" && next === "/") {
        const end = source.indexOf("\n", index);
        index = end === -1 ? source.length : end;
      } else if (char === "/" && next === "*") {
        skipBlockComment();
      } else if (char === '"' || char === "'") {
        const importSite = isImportSite();
        const startLine = line;
        const value = readQuoted(char);
        if (importSite) imports.push({ line: startLine, specifier: value });
        remember({ kind: "string", value });
      } else if (char === "`") {
        skipTemplate();
        remember({ kind: "template" });
      } else if (/[A-Za-z_$]/.test(char)) {
        let end = index + 1;
        while (/[\w$]/.test(source[end] ?? "")) end += 1;
        remember({ kind: "word", value: source.slice(index, end) });
        index = end;
      } else if (/\d/.test(char)) {
        let end = index + 1;
        while (/[\w.]/.test(source[end] ?? "")) end += 1;
        remember({ kind: "number" });
        index = end;
      } else if (char === "/" && regexAllowed()) {
        skipRegex();
        remember({ kind: "regex" });
      } else {
        index += 1;
        if (untilClosingBrace && char === "{") depth += 1;
        if (untilClosingBrace && char === "}") {
          if (depth === 0) return;
          depth -= 1;
        }
        remember({ kind: "punct", value: char });
      }
    }
  }

  scan(false);
  return imports;
}

function listFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return entry === "__tests__" || entry === "node_modules" ? [] : listFiles(path);
    }
    return SOURCE_FILE.test(entry) && !EXEMPT_FILE.test(entry) ? [path] : [];
  });
}

const isInside = (parent, child) => {
  const path = relative(parent, child);
  return path !== "" && !path.startsWith("..") && !isAbsolute(path);
};

/** Tarjan's strongly connected components; returns every group of 2+ nodes. */
function findCycles(graph) {
  const cycles = [];
  const indexOf = new Map();
  const lowLink = new Map();
  const stack = [];
  const onStack = new Set();
  let counter = 0;

  const visit = (node) => {
    indexOf.set(node, counter);
    lowLink.set(node, counter);
    counter += 1;
    stack.push(node);
    onStack.add(node);
    for (const target of graph.get(node) ?? []) {
      if (!indexOf.has(target)) {
        visit(target);
        lowLink.set(node, Math.min(lowLink.get(node), lowLink.get(target)));
      } else if (onStack.has(target)) {
        lowLink.set(node, Math.min(lowLink.get(node), indexOf.get(target)));
      }
    }
    if (lowLink.get(node) !== indexOf.get(node)) return;
    const group = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      group.push(member);
    } while (member !== node);
    if (group.length > 1) cycles.push(group.sort());
  };

  for (const node of [...graph.keys()].sort()) {
    if (!indexOf.has(node)) visit(node);
  }
  return cycles;
}

/**
 * Checks one components directory. Returns `{ errors, counts, imports }`:
 * `errors` is empty when the layout and every component import follow the
 * rules above, `counts` maps each level to its component count, and `imports`
 * is the number of cross-component imports checked.
 */
export function checkAtomicLevels({ componentsDir, baseDirs = [], cwd = process.cwd() }) {
  const root = resolve(cwd, componentsDir);
  const bases = baseDirs.map((directory) => resolve(cwd, directory));
  const display = (path) => relative(cwd, path) || ".";
  const errors = [];
  const counts = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  const components = new Map();
  const idByName = new Map();
  const levelOf = new Map();

  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return { counts, errors: [`${display(root)} is not a directory`], imports: 0 };
  }

  for (const entry of readdirSync(root).sort()) {
    const levelDir = join(root, entry);
    if (!statSync(levelDir).isDirectory()) continue;
    if (!LEVELS.includes(entry)) {
      errors.push(
        `${display(levelDir)} is outside the level folders; move it to ${LEVELS.map((level) => `${level}/`).join(", ")}`,
      );
      continue;
    }
    for (const name of readdirSync(levelDir).sort()) {
      const componentDir = join(levelDir, name);
      if (!statSync(componentDir).isDirectory()) {
        errors.push(`${display(componentDir)} must live inside a component folder`);
        continue;
      }
      const id = `${entry}/${name}`;
      const duplicate = idByName.get(name);
      if (duplicate) errors.push(`${id} duplicates the component name of ${duplicate}`);
      idByName.set(name, id);
      components.set(id, componentDir);
      levelOf.set(id, entry);
      counts[entry] += 1;
    }
  }

  const graph = new Map([...components.keys()].map((id) => [id, new Set()]));
  let imports = 0;

  const targetComponent = (file, specifier) => {
    if (!specifier.startsWith(".")) return undefined;
    const target = resolve(dirname(file), specifier);
    if (target !== root && !isInside(root, target)) return undefined;
    const [level, name] = relative(root, target).split(sep);
    const id = `${level}/${name}`;
    return name && components.has(id) ? id : null;
  };

  for (const [id, componentDir] of components) {
    const level = levelOf.get(id);
    for (const file of listFiles(componentDir)) {
      for (const { line, specifier } of findImportSpecifiers(readFileSync(file, "utf8"))) {
        const target = targetComponent(file, specifier);
        if (target === undefined || target === id) continue;
        const where = `${display(file)}:${line}`;
        if (target === null) {
          errors.push(`${where} imports "${specifier}", which is not inside a component folder`);
          continue;
        }
        imports += 1;
        graph.get(id).add(target);
        const targetLevel = levelOf.get(target);
        if (!ALLOWED_IMPORTS[level].includes(targetLevel)) {
          const allowed = ALLOWED_IMPORTS[level];
          errors.push(
            `${where} ${id} imports ${target}: ${level} may import ${allowed.length > 0 ? allowed.join(", ") : "no other component"}`,
          );
        }
      }
    }
  }

  for (const base of bases) {
    if (!existsSync(base)) {
      errors.push(`${display(base)} (--base) does not exist`);
      continue;
    }
    for (const file of listFiles(base)) {
      for (const { line, specifier } of findImportSpecifiers(readFileSync(file, "utf8"))) {
        if (targetComponent(file, specifier) !== undefined) {
          errors.push(
            `${display(file)}:${line} imports "${specifier}": modules below atoms may not import components`,
          );
        }
      }
    }
  }

  for (const cycle of findCycles(graph)) {
    errors.push(`import cycle between ${cycle.join(", ")}`);
  }

  return { counts, errors, imports };
}

function parseArguments(argv) {
  const baseDirs = [];
  const positional = [];
  for (let position = 0; position < argv.length; position += 1) {
    if (argv[position] === "--base") {
      baseDirs.push(argv[position + 1]);
      position += 1;
    } else {
      positional.push(argv[position]);
    }
  }
  if (positional.length !== 1 || baseDirs.includes(undefined)) return undefined;
  return { baseDirs, componentsDir: positional[0] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArguments(process.argv.slice(2));
  if (!options) {
    console.error("Usage: node scripts/check-atomic-levels.mjs <componentsDir> [--base <dir>]...");
    process.exit(2);
  }
  const { counts, errors, imports } = checkAtomicLevels(options);
  if (errors.length > 0) {
    console.error(`Atomic level check failed (${errors.length}):`);
    for (const error of errors) console.error(`  - ${error}`);
    console.error("\nLevels and rules: docs/agents/COMPONENTS.md#atomic-design-levels");
    process.exit(1);
  }
  const summary = LEVELS.map((level) => `${counts[level]} ${level}`).join(", ");
  console.log(`Atomic levels OK: ${summary}; ${imports} component imports checked.`);
}
