#!/usr/bin/env node
// Validates a PUBLISHED @vllnt/ui-core + @vllnt/ui-native pair from the npm tarballs, not from
// workspace source. Run it for every canary and for the 0.1.0 release candidate.
//
//   node apps/native-catalog/scripts/verify-published.mjs <version|dist-tag> [--keep] [--only clean-app|catalog]
//
// It resolves the version, checks both packages exist at that exact version, then installs the pair
// into two consumers that live OUTSIDE the workspace, so nothing resolves through workspace links
// or hoisting:
//   clean-app  a minimal Expo app: typecheck, `expo export` for iOS and Android.
//   catalog    a copy of apps/native-catalog plus the fixtures and accessibility tests it needs, with
//              their imports of package source rewritten to "@vllnt/ui-native": typecheck, Jest
//              (no moduleNameMapper to source), `expo export` for iOS and Android.
// A PASS/FAIL table is printed at the end; the exit code is non-zero on any FAIL.
// Documentation: apps/native-catalog/README.md, "Validate a published pair".
import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  closeSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const CORE = "@vllnt/ui-core";
const NATIVE = "@vllnt/ui-native";
const TESTS_DIR = "ui-native-tests";
/** The ui-native accessibility tests that are copied when they can run against the public API. */
const A11Y_TESTS = [
  "accessibility-contract",
  "accessibility-and-interaction",
  "accessibility-regressions",
];
/** Pinned to what the workspace lockfile resolves today (see readImporterVersions). */
const PINNED = [
  "expo",
  "react",
  "react-native",
  "react-dom",
  "react-native-web",
  "jest",
  "@testing-library/react-native",
  "typescript",
];
/** Pinned the same way: peers and types the catalog needs next to the packages above. */
const JEST_PRESET = "@react-native/jest-preset";
const COMPANIONS = [
  "expo-status-bar",
  "react-test-renderer",
  "@types/react",
  "@types/jest",
];

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const catalogDirectory = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(catalogDirectory, "../..");
const nativeDirectory = join(repositoryRoot, "packages/ui-native");
const nativeTestsDirectory = join(nativeDirectory, "src/tests");

/* -------------------------------------------------------------------------- */
/* Pure helpers (unit-tested in verify-published.test.mjs)                      */
/* -------------------------------------------------------------------------- */

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const DIST_TAG = /^[A-Za-z][0-9A-Za-z._-]*$/;

/** An exact version or a dist-tag. Ranges and anything else are refused. */
export function classifySpec(spec) {
  if (EXACT_VERSION.test(spec)) return "version";
  if (DIST_TAG.test(spec)) return "tag";
  throw new Error(
    `"${spec}" is neither an exact version nor a dist-tag (ranges are not accepted)`,
  );
}

/**
 * Resolved versions of one workspace importer in pnpm-lock.yaml, with the peer suffix removed
 * (`57.0.31(@babel/core@...)` becomes `57.0.31`). `link:` entries are dropped.
 */
export function readImporterVersions(lockText, importer) {
  const lines = lockText.split("\n");
  const start = lines.indexOf(`  ${importer}:`);
  if (start === -1) throw new Error(`importer ${importer} not found in pnpm-lock.yaml`);
  const versions = {};
  let current;
  for (const line of lines.slice(start + 1)) {
    if (/^ {0,2}\S/.test(line)) break;
    const name = /^ {6}(?:'([^']+)'|([^\s':]+)):\s*$/.exec(line);
    if (name) {
      current = name[1] ?? name[2];
      continue;
    }
    const version = /^ {8}version:\s*(\S+)\s*$/.exec(line);
    if (version && current && !version[1].startsWith("link:")) {
      versions[current] = version[1].replace(/\(.*$/, "");
    }
  }
  return versions;
}

/** True when pnpm-lock.yaml resolves exactly `name@version` (a transitive package has no importer entry). */
export function lockHasPackage(lockText, name, version) {
  return lockText.split("\n").some((line) => line === `  '${name}@${version}':` || line === `  ${name}@${version}:`);
}

/** The exact versions to pin, or an error naming every package the lockfile does not resolve. */
export function pickPins(versions, names) {
  const missing = names.filter((name) => !EXACT_VERSION.test(versions[name] ?? ""));
  if (missing.length > 0) {
    throw new Error(`pnpm-lock.yaml has no exact version for: ${missing.join(", ")}`);
  }
  return Object.fromEntries(names.map((name) => [name, versions[name]]));
}

/** `minimumReleaseAge` and `minimumReleaseAgeExclude` from the root pnpm-workspace.yaml. */
export function readAgePolicy(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const age = lines
    .map((line) => /^minimumReleaseAge:\s*(\d+)\s*(?:#.*)?$/.exec(line))
    .find(Boolean);
  if (!age) {
    throw new Error(
      "minimumReleaseAge is not set in pnpm-workspace.yaml: refusing to install without the package-age gate",
    );
  }
  const exclude = [];
  const start = lines.findIndex((line) => /^minimumReleaseAgeExclude:\s*$/.test(line));
  if (start !== -1) {
    for (const line of lines.slice(start + 1)) {
      const item = /^\s+-\s+(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/.exec(line);
      if (item) exclude.push(item[1] ?? item[2] ?? item[3]);
      else if (line.trim() !== "" && !/^\s*#/.test(line)) break;
    }
  }
  return { exclude, minimumReleaseAge: Number(age[1]) };
}

/** The scratch pnpm-workspace.yaml: the root age gate, with first-party @vllnt/* exempt. */
export function scratchWorkspaceYaml({ exclude, minimumReleaseAge }) {
  const patterns = [...new Set([...exclude, "@vllnt/*"])];
  return [
    "# Generated by verify-published.mjs from the root pnpm-workspace.yaml. Not a workspace.",
    `minimumReleaseAge: ${minimumReleaseAge}`,
    "minimumReleaseAgeExclude:",
    ...patterns.map((pattern) => `  - ${JSON.stringify(pattern)}`),
    "",
  ].join("\n");
}

/**
 * A PATH entry that `pnpm run` adds for the workspace: an absolute path under the workspace root
 * that sits inside a node_modules. Everything else stays, notably PNPM_HOME, which
 * pnpm/action-setup puts in a node_modules of its own (<runner>/setup-pnpm/node_modules/.bin)
 * outside the workspace. A relative entry is left alone: it resolves in the child's directory.
 */
function isWorkspaceBin(entry, workspaceRoot) {
  if (!isAbsolute(entry)) return false;
  const resolved = resolve(entry);
  if (!resolved.split(sep).includes("node_modules")) return false;
  const inside = relative(workspaceRoot, resolved);
  return inside !== ".." && !inside.startsWith(`..${sep}`) && !isAbsolute(inside);
}

/**
 * The environment for child processes. When this script runs under `pnpm run`, pnpm puts the
 * workspace on NODE_PATH and its `.bin` directories on PATH; both would let a scratch project
 * resolve through the workspace, so they are removed.
 */
export function cleanEnvironment(environment, extra = {}, workspaceRoot = repositoryRoot) {
  const cleaned = {};
  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) continue;
    if (/^npm_(config|package|lifecycle)_/.test(key)) continue;
    if (["INIT_CWD", "NODE_PATH", "npm_command", "npm_execpath", "npm_node_execpath"].includes(key)) {
      continue;
    }
    cleaned[key] = value;
  }
  if (cleaned.PATH) {
    cleaned.PATH = cleaned.PATH.split(":")
      .filter((entry) => !isWorkspaceBin(entry, workspaceRoot))
      .join(":");
  }
  return { ...cleaned, ...extra };
}

/** Exit-code and table helpers. */
export function summarize(rows) {
  const count = (status) => rows.filter((row) => row.status === status).length;
  return { fail: count("FAIL"), pass: count("PASS"), skip: count("SKIP") };
}

export function renderTable(rows) {
  const header = ["consumer", "step", "result", "time", "detail"];
  const body = rows.map((row) => [
    row.consumer,
    row.step,
    row.status,
    row.ms === undefined ? "" : `${(row.ms / 1000).toFixed(1)}s`,
    row.detail ?? "",
  ]);
  const widths = header.map((_, column) =>
    Math.max(...[header, ...body].map((line) => line[column].length)),
  );
  const format = (line) =>
    line.map((cell, column) => cell.padEnd(widths[column])).join("  ").trimEnd();
  return [format(header), widths.map((width) => "-".repeat(width)).join("  "), ...body.map(format)].join("\n");
}

export function renderMarkdown(rows, version) {
  const escape = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `### Published pair \`${version}\``,
    "",
    "| consumer | step | result | time | detail |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.consumer} | ${escape(row.step)} | ${row.status} | ${row.ms === undefined ? "" : `${(row.ms / 1000).toFixed(1)}s`} | ${escape(row.detail)} |`,
    ),
    "",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Import rewriting: package source -> "@vllnt/ui-native"                        */
/* -------------------------------------------------------------------------- */

function isModuleCall(ts, node) {
  const callee = node.expression;
  if (callee.kind === ts.SyntaxKind.ImportKeyword) return true;
  if (ts.isIdentifier(callee)) return callee.text === "require";
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === "jest" &&
    /^(mock|doMock|unmock|requireActual|requireMock|setMock|createMockFromModule)$/.test(callee.name.text)
  );
}

function describeImport(ts, sourceFile, node) {
  const clause = node.importClause;
  if (!clause) return { named: [], sideEffect: true };
  const bindings = clause.namedBindings;
  return {
    defaultImport: clause.name !== undefined,
    named:
      bindings && ts.isNamedImports(bindings)
        ? bindings.elements.map((element) => ({
            imported: (element.propertyName ?? element.name).text,
            local: element.name.text,
            text: element.getText(sourceFile),
            typeOnly: clause.isTypeOnly || element.isTypeOnly,
          }))
        : [],
    namespaceImport: bindings !== undefined && ts.isNamespaceImport(bindings),
    typeOnly: clause.isTypeOnly,
  };
}

/**
 * Rewrites the relative module references of one file for the scratch consumer.
 *
 * `resolveReference(specifier)` classifies each relative specifier:
 *   { kind: "copy", specifier }  a file that is copied next to this one; `specifier` is its new path
 *   { kind: "barrel" }           the package barrel (src/index) -> "@vllnt/ui-native"
 *   { kind: "registry" }         registry.json -> "@vllnt/ui-native/registry.json"
 *   { kind: "internal" }         other package source: only reachable through the published barrel
 *   { kind: "broken", reason }   does not resolve, or reaches outside the copied files
 * `barrel` is the set of names the published package exports.
 *
 * Returns the new text, the files it depends on, shims and problems. A problem with severity
 * "internal" means the file needs something the package does not export (the test is skipped);
 * "broken" means the sources themselves are inconsistent (a failure).
 */
export function rewriteSource(ts, { barrel, fileName, resolveReference, text }) {
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edits = [];
  const problems = [];
  const shims = [];
  const dependencies = new Set();
  let rewritten = 0;

  const replaceLiteral = (literal, specifier) => {
    edits.push({ end: literal.getEnd(), start: literal.getStart(sourceFile), text: JSON.stringify(specifier) });
    rewritten += 1;
  };

  const handle = (literal, kind, declaration) => {
    const specifier = literal.text;
    if (!specifier.startsWith(".")) return;
    const target = resolveReference(specifier);
    if (target.kind === "broken") {
      problems.push({ message: `${specifier}: ${target.reason}`, severity: "broken" });
    } else if (target.kind === "copy") {
      dependencies.add(target.file);
      if (target.specifier !== specifier) replaceLiteral(literal, target.specifier);
    } else if (target.kind === "barrel") {
      replaceLiteral(literal, NATIVE);
    } else if (target.kind === "registry") {
      replaceLiteral(literal, `${NATIVE}/registry.json`);
    } else if (kind !== "import") {
      problems.push({
        message: `${kind === "call" ? "mocks or requires" : "re-exports"} package internal ${specifier}`,
        severity: "internal",
      });
    } else {
      const clause = describeImport(ts, sourceFile, declaration);
      if (clause.sideEffect || clause.defaultImport || clause.namespaceImport) {
        problems.push({
          message: `${specifier}: default, namespace or side-effect import of a package internal`,
          severity: "internal",
        });
        return;
      }
      const missing = clause.named.filter((name) => !barrel.has(name.imported));
      if (missing.length === 0) {
        replaceLiteral(literal, NATIVE);
        return;
      }
      const missingValues = missing.filter((name) => !name.typeOnly);
      if (missingValues.length > 0) {
        problems.push({
          message: `needs ${missingValues.map((name) => name.imported).join(", ")} (from ${specifier}), not exported by the package`,
          severity: "internal",
        });
        return;
      }
      // Only types the package does not export: keep the importing code compiling with a local
      // `any` alias, and report it. Nothing at runtime depends on a type.
      const present = clause.named.filter((name) => barrel.has(name.imported));
      const lines = [];
      if (present.length > 0) {
        lines.push(
          `import ${clause.typeOnly ? "type " : ""}{ ${present.map((name) => name.text).join(", ")} } from ${JSON.stringify(NATIVE)};`,
        );
      }
      for (const name of missing) {
        lines.push(`type ${name.local} = any; // shim: ${name.imported} is not exported by the package`);
        shims.push(name.imported);
      }
      edits.push({ end: declaration.getEnd(), start: declaration.getStart(sourceFile), text: lines.join("\n") });
      rewritten += 1;
    }
  };

  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      handle(node.moduleSpecifier, ts.isImportDeclaration(node) ? "import" : "export", node);
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      isModuleCall(ts, node)
    ) {
      handle(node.arguments[0], "call", node);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      handle(node.argument.literal, "call", node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  let output = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }
  return { dependencies, problems, rewritten, shims, text: output };
}

/* -------------------------------------------------------------------------- */
/* Run state, steps, table                                                      */
/* -------------------------------------------------------------------------- */

export const rows = [];
let activeChild;

function record(consumer, step, status, detail = "", ms) {
  rows.push({ consumer, detail, ms, status, step });
  const time = ms === undefined ? "" : ` (${(ms / 1000).toFixed(1)}s)`;
  console.log(`[${status}] ${consumer} ${step}${time}${detail ? ` - ${detail}` : ""}`);
}

function skip(consumer, steps, reason) {
  for (const step of steps) record(consumer, step, "SKIP", reason);
}

function lastLines(file, count = 40) {
  try {
    return readFileSync(file, "utf8").trimEnd().split("\n").slice(-count).join("\n");
  } catch {
    return "(no log)";
  }
}

export function spawnLogged(command, args, { cwd, env, log, timeoutMs }) {
  return new Promise((resolvePromise) => {
    const fd = openSync(log, "a");
    appendFileSync(log, `$ ${command} ${args.join(" ")}\n`);
    const child = spawn(command, args, { cwd, detached: true, env, stdio: ["ignore", fd, fd] });
    activeChild = child;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      killGroup(child);
    }, timeoutMs);
    // A child that cannot start emits "error" and then "close". Settle on the first, so the log
    // descriptor is closed once: a second close throws EBADF, or closes a descriptor reused since.
    let settled = false;
    const finish = (code, spawnError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      closeSync(fd);
      activeChild = undefined;
      resolvePromise({ code, spawnError, timedOut });
    };
    child.on("error", (error) => {
      appendFileSync(log, `spawn error: ${error.message}\n`);
      finish(127, error.code ?? error.message);
    });
    child.on("close", (code) => finish(code ?? 1));
  });
}

function killGroup(child) {
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    // already gone
  }
}

/** Runs one command, records it as a table row, and prints the log tail when it fails. */
export async function step(context, consumer, name, command, args, { cwd, describeFailure, minutes = 20 }) {
  const log = join(context.logs, `${consumer}-${name.replaceAll(/[^A-Za-z0-9]+/g, "-")}.log`);
  const started = Date.now();
  const { code, spawnError, timedOut } = await spawnLogged(command, args, {
    cwd,
    env: context.environment,
    log,
    timeoutMs: minutes * 60_000,
  });
  const ms = Date.now() - started;
  if (code === 0) {
    record(consumer, name, "PASS", "", ms);
    return true;
  }
  const cause = timedOut || spawnError ? undefined : describeFailure?.(readFileSync(log, "utf8"));
  const detail = timedOut
    ? `timed out after ${minutes} min`
    : spawnError
      ? `spawn error: ${spawnError} (${command})`
      : `exit ${code}${cause ? `, ${cause}` : ""}`;
  record(consumer, name, "FAIL", detail, ms);
  console.error(`--- last lines of ${log}\n${lastLines(log)}\n---`);
  return false;
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                     */
/* -------------------------------------------------------------------------- */

/** One `npm view`. A 404 or an empty answer is "missing"; any other failure is "error", never "missing". */
function npmView(context, spec, field) {
  const result = spawnSync("npm", ["view", spec, field, "--json"], {
    cwd: context.run,
    encoding: "utf8",
    env: context.environment,
    timeout: 120_000,
  });
  if (result.error) return { message: result.error.message, state: "error" };
  const output = (result.stdout ?? "").trim();
  if (result.status === 0) {
    return output ? { state: "ok", value: JSON.parse(output) } : { state: "missing" };
  }
  if (/E404|404 Not Found/.test(`${result.stdout}${result.stderr}`)) return { state: "missing" };
  return { message: (result.stderr || result.stdout || "npm view failed").trim().split("\n")[0], state: "error" };
}

/** Resolves the pair. Returns the exact version, or undefined after recording why not. */
function resolvePair(context, spec) {
  const kind = classifySpec(spec);
  const started = Date.now();
  const native = npmView(context, `${NATIVE}@${spec}`, "version");
  const failure = (step, detail) => {
    record("registry", step, "FAIL", detail, Date.now() - started);
    return undefined;
  };
  if (native.state === "error") return failure(`${NATIVE}@${spec}`, `registry error: ${native.message}`);
  if (native.state === "missing" || typeof native.value !== "string") {
    return failure(`${NATIVE}@${spec}`, kind === "tag" ? `dist-tag "${spec}" does not exist` : "version is not published");
  }
  const version = native.value;
  if (kind === "version" && version !== spec) {
    return failure(`${NATIVE}@${spec}`, `registry answered ${version}`);
  }
  record("registry", `${NATIVE}@${spec}`, "PASS", kind === "tag" ? `tag ${spec} -> ${version}` : version);

  const core = npmView(context, `${CORE}@${version}`, "version");
  if (core.state === "error") return failure(`${CORE}@${version}`, `registry error: ${core.message}`);
  if (core.state === "missing" || core.value !== version) {
    return failure(`${CORE}@${version}`, "not published at the same version: the pair is incomplete");
  }
  record("registry", `${CORE}@${version}`, "PASS", "published");

  const dependencies = npmView(context, `${NATIVE}@${version}`, "dependencies");
  const pinned = dependencies.state === "ok" ? dependencies.value?.[CORE] : undefined;
  if (pinned !== version) {
    return failure(`${NATIVE} depends on ${CORE}`, `declares ${pinned ?? "nothing"}, expected exactly ${version}`);
  }
  record("registry", `${NATIVE} depends on ${CORE}`, "PASS", `exactly ${version}`);
  return version;
}

/* -------------------------------------------------------------------------- */
/* Consumers                                                                    */
/* -------------------------------------------------------------------------- */

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

/** package.json plus the scratch pnpm-workspace.yaml that carries the age gate. */
function writeManifest(context, directory, { dependencies, devDependencies, name, type }) {
  writeJson(join(directory, "package.json"), {
    dependencies,
    devDependencies,
    main: "index.ts",
    name,
    private: true,
    type,
    version: "0.0.0",
  });
  writeText(join(directory, "pnpm-workspace.yaml"), scratchWorkspaceYaml(context.policy));
}

/** The pair at its exact version, plus the Expo runtime pinned to what the workspace resolves. */
function appDependencies(pins, version) {
  return {
    [CORE]: version,
    [NATIVE]: version,
    expo: pins.expo,
    "expo-status-bar": pins["expo-status-bar"],
    react: pins.react,
    "react-dom": pins["react-dom"],
    "react-native": pins["react-native"],
    "react-native-web": pins["react-native-web"],
  };
}

const CLEAN_APP_SOURCE = `import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Heading,
  Text,
  ThemeProvider,
} from "@vllnt/ui-native";
import { View } from "react-native";

export default function App() {
  const [presses, setPresses] = useState(0);

  return (
    <ThemeProvider colorScheme="light">
      <View style={{ flex: 1, gap: 16, padding: 24, paddingTop: 64 }}>
        <Heading level={1} size={2}>
          Published pair
        </Heading>
        <Text>Presses: {presses}</Text>
        <Badge variant="secondary">Canary</Badge>
        <Button onPress={() => setPresses((value) => value + 1)}>Press me</Button>
        <Alert>
          <AlertTitle>Installed from npm</AlertTitle>
          <AlertDescription>No workspace link is involved.</AlertDescription>
        </Alert>
      </View>
    </ThemeProvider>
  );
}
`;

function writeCleanApp(context, directory, version) {
  const { pins } = context;
  writeManifest(context, directory, {
    dependencies: appDependencies(pins, version),
    devDependencies: { "@types/react": pins["@types/react"], typescript: pins.typescript },
    name: "verify-published-clean-app",
  });
  writeJson(join(directory, "app.json"), {
    expo: {
      android: { package: "com.vllnt.verifycleanapp" },
      ios: { bundleIdentifier: "com.vllnt.verifycleanapp" },
      name: "Verify clean app",
      orientation: "portrait",
      slug: "verify-clean-app",
      version: "0.0.0",
    },
  });
  writeJson(join(directory, "tsconfig.json"), {
    compilerOptions: { strict: true },
    extends: "expo/tsconfig.base",
    include: ["**/*.ts", "**/*.tsx"],
  });
  writeText(
    join(directory, "index.ts"),
    `import { registerRootComponent } from "expo";\n\nimport App from "./App";\n\nregisterRootComponent(App);\n`,
  );
  writeText(join(directory, "App.tsx"), CLEAN_APP_SOURCE);
}

function writeCatalogManifest(context, directory, version) {
  const { pins } = context;
  writeManifest(context, directory, {
    dependencies: appDependencies(pins, version),
    devDependencies: {
      "@react-native/jest-preset": pins[JEST_PRESET],
      "@testing-library/react-native": pins["@testing-library/react-native"],
      "@types/jest": pins["@types/jest"],
      "@types/react": pins["@types/react"],
      jest: pins.jest,
      "react-test-renderer": pins["react-test-renderer"],
      typescript: pins.typescript,
    },
    name: "verify-published-catalog",
    type: "module",
  });
}

/** Installs, then proves the pair on disk is the registry tarball and not a link out of the scratch dir. */
async function install(context, consumer, directory, version) {
  const ok = await step(
    context,
    consumer,
    "install",
    "pnpm",
    ["install", "--no-frozen-lockfile", "--ignore-scripts", "--reporter=append-only"],
    { cwd: directory, minutes: 25 },
  );
  if (!ok) return false;
  const problems = [];
  for (const name of [NATIVE, CORE]) {
    try {
      const real = realpathSync(join(directory, "node_modules", name));
      const manifest = JSON.parse(readFileSync(join(real, "package.json"), "utf8"));
      if (!real.startsWith(directory + sep)) problems.push(`${name} resolves outside the scratch dir: ${real}`);
      if (manifest.version !== version) problems.push(`${name} is ${manifest.version}, expected ${version}`);
      if (!existsSync(join(real, "dist"))) problems.push(`${name} has no dist/`);
    } catch (error) {
      problems.push(`${name}: ${error.message}`);
    }
  }
  const store = join(directory, "node_modules/.pnpm");
  const cores = existsSync(store) ? readdirSync(store).filter((entry) => entry.startsWith("@vllnt+ui-core@")) : [];
  if (cores.length !== 1) problems.push(`expected one ${CORE} copy, found ${cores.length}: ${cores.join(", ")}`);
  if (problems.length > 0) {
    record(consumer, "pair on disk", "FAIL", problems.join("; "));
    return false;
  }
  record(consumer, "pair on disk", "PASS", `${NATIVE} and ${CORE} ${version} from the registry, one ${CORE} copy`);
  return true;
}

async function exportBoth(context, consumer, directory) {
  for (const platform of ["ios", "android"]) {
    await step(
      context,
      consumer,
      `expo export ${platform}`,
      "pnpm",
      ["exec", "expo", "export", "--platform", platform, "--output-dir", `dist/${platform}`],
      { cwd: directory },
    );
  }
}

async function runCleanApp(context, version) {
  const consumer = "clean-app";
  const directory = join(context.run, consumer);
  writeCleanApp(context, directory, version);
  if (!(await install(context, consumer, directory, version))) {
    skip(consumer, ["typecheck", "expo export ios", "expo export android"], "install failed");
    return;
  }
  await step(context, consumer, "typecheck", "pnpm", ["exec", "tsc", "--noEmit"], {
    cwd: directory,
    describeFailure: tscDetail,
    minutes: 10,
  });
  await exportBoth(context, consumer, directory);
}

/* ---- catalog copy ---- */

const CATALOG_SKIPPED_DIRECTORIES = new Set([".expo", ".turbo", "coverage", "dist", "node_modules", "scripts"]);
const CATALOG_NOT_COPIED = new Set(["README.md", "eslint.config.js", "jest.config.cjs", "package.json"]);
const SOURCE_FILE = /\.(?:ts|tsx)$/;

function listFiles(directory, base = directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!CATALOG_SKIPPED_DIRECTORIES.has(entry.name)) files.push(...listFiles(path, base));
    } else if (!CATALOG_NOT_COPIED.has(relative(base, path))) {
      files.push(path);
    }
  }
  return files;
}

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function resolveRelative(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [base, ...[".ts", ".tsx", ".json", ".cjs", ".js"].map((ext) => base + ext)]) {
    if (isFile(candidate)) return candidate;
  }
  for (const index of ["index.ts", "index.tsx"]) {
    if (isFile(join(base, index))) return join(base, index);
  }
  return undefined;
}

function inside(directory, file) {
  return file === directory || file.startsWith(directory + sep);
}

/** Where a copied source file lands in the scratch catalog, or undefined if it is not copied. */
function destinationOf(file) {
  if (inside(catalogDirectory, file)) return relative(catalogDirectory, file);
  if (inside(nativeTestsDirectory, file)) return join(TESTS_DIR, relative(nativeTestsDirectory, file));
  return undefined;
}

function classifyReference(fromFile, specifier) {
  const target = resolveRelative(fromFile, specifier);
  if (!target) return { kind: "broken", reason: "does not resolve" };
  if (target === join(nativeDirectory, "registry.json")) return { kind: "registry" };
  if (target === join(nativeDirectory, "src/index.ts")) return { kind: "barrel" };
  const destination = destinationOf(target);
  if (destination) {
    let next = relative(dirname(destinationOf(fromFile)), destination).split(sep).join("/");
    next = next.replace(/\.(?:ts|tsx)$/, "");
    return { file: target, kind: "copy", specifier: next.startsWith(".") ? next : `./${next}` };
  }
  if (inside(join(nativeDirectory, "src"), target)) return { kind: "internal" };
  return { kind: "broken", reason: `reaches outside the copied files (${relative(repositoryRoot, target)})` };
}

/** Parses every reachable source once; returns node -> rewrite result. */
function buildGraph(ts, barrel, roots) {
  const nodes = new Map();
  const visit = (file) => {
    if (nodes.has(file)) return;
    const result = rewriteSource(ts, {
      barrel,
      fileName: file,
      resolveReference: (specifier) => classifyReference(file, specifier),
      text: readFileSync(file, "utf8"),
    });
    nodes.set(file, result);
    for (const dependency of result.dependencies) visit(dependency);
  };
  roots.forEach(visit);
  return nodes;
}

/** Every problem a file has itself or inherits from a copied dependency. */
function blockersOf(nodes, file, seen = new Set()) {
  if (seen.has(file)) return [];
  seen.add(file);
  const node = nodes.get(file);
  const own = node.problems.map((problem) => ({ ...problem, file }));
  const inherited = [...node.dependencies].flatMap((dependency) => blockersOf(nodes, dependency, seen));
  return [...own, ...inherited];
}

function reachable(nodes, roots) {
  const files = new Set();
  const visit = (file) => {
    if (files.has(file)) return;
    files.add(file);
    nodes.get(file).dependencies.forEach(visit);
  };
  roots.forEach(visit);
  return files;
}

function describeBlockers(blockers) {
  return [...new Set(blockers.map((blocker) => `${basename(blocker.file)}: ${blocker.message}`))].join("; ");
}

/** The catalog jest config, derived from the repo's own, with no mapping of @vllnt/* to source. */
function scratchJestConfig() {
  const config = createRequire(import.meta.url)(join(catalogDirectory, "jest.config.cjs"));
  const mapper = Object.fromEntries(
    Object.entries(config.moduleNameMapper ?? {}).filter(([pattern]) => !pattern.includes("@vllnt/")),
  );
  // The catalog lets Jest transform the ESM dist of @vllnt/ui-native; the published ui-core is ESM
  // too, so it joins that allow-list. This is consumer config, not a mapping: resolution still has
  // to work through the package's own `exports`.
  const transformIgnorePatterns = (config.transformIgnorePatterns ?? []).map((pattern) => pattern.replace("@vllnt/ui-native|", "@vllnt/(?:ui-native|ui-core)|"));
  if (!transformIgnorePatterns.some((pattern) => pattern.includes("@vllnt/(?:ui-native|ui-core)|"))) {
    throw new Error("catalog jest transformIgnorePatterns no longer allow-lists @vllnt/ui-native: update verify-published.mjs");
  }
  const result = { ...config, setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"], transformIgnorePatterns };
  if (Object.keys(mapper).length > 0) result.moduleNameMapper = mapper;
  else delete result.moduleNameMapper;
  const stale = (config.setupFilesAfterEnv ?? []).filter((entry) => !entry.endsWith("packages/ui-native/jest.setup.cjs"));
  if (stale.length > 0) throw new Error(`catalog jest setup files not handled by the copy: ${stale.join(", ")}`);
  return `/** Generated by verify-published.mjs from apps/native-catalog/jest.config.cjs. */\nmodule.exports = ${JSON.stringify(result, null, 2)};\n`;
}

/** Copies the catalog and the tests it needs. Returns the copied jest test files, or undefined on failure. */
function prepareCatalog(context, directory, ts, barrel) {
  const consumer = "catalog";
  const started = Date.now();
  const catalogFiles = listFiles(catalogDirectory);
  const catalogSources = catalogFiles.filter((file) => SOURCE_FILE.test(file));
  const a11yEntries = A11Y_TESTS.map((name) => join(nativeTestsDirectory, `${name}.test.tsx`));
  const nodes = buildGraph(ts, barrel, [...catalogSources, ...a11yEntries]);

  const catalogBlockers = catalogSources.flatMap((file) => blockersOf(nodes, file));
  if (catalogBlockers.length > 0) {
    record(consumer, "prepare", "FAIL", describeBlockers(catalogBlockers), Date.now() - started);
    return undefined;
  }

  const runnable = [];
  const skipped = [];
  for (const entry of a11yEntries) {
    const blockers = blockersOf(nodes, entry);
    if (blockers.length === 0) runnable.push(entry);
    else if (blockers.every((blocker) => blocker.severity === "internal")) skipped.push({ blockers, entry });
    else {
      record(consumer, "prepare", "FAIL", describeBlockers(blockers), Date.now() - started);
      return undefined;
    }
  }

  const copied = reachable(nodes, [...catalogSources, ...runnable]);
  for (const file of copied) writeText(join(directory, destinationOf(file)), nodes.get(file).text);
  for (const file of catalogFiles.filter((candidate) => !SOURCE_FILE.test(candidate))) {
    mkdirSync(dirname(join(directory, relative(catalogDirectory, file))), { recursive: true });
    copyFileSync(file, join(directory, relative(catalogDirectory, file)));
  }
  copyFileSync(join(nativeDirectory, "jest.setup.cjs"), join(directory, "jest.setup.cjs"));
  writeText(join(directory, "jest.config.cjs"), scratchJestConfig());

  const rewritten = [...copied].reduce((sum, file) => sum + nodes.get(file).rewritten, 0);
  const shims = [...copied].flatMap((file) => nodes.get(file).shims);
  record(
    consumer,
    "prepare",
    "PASS",
    `${copied.size} source files copied, ${rewritten} imports rewritten to ${NATIVE}${shims.length > 0 ? `, type shims (any): ${[...new Set(shims)].join(", ")}` : ""}`,
    Date.now() - started,
  );
  for (const { blockers, entry } of skipped) {
    record(consumer, `a11y ${basename(entry, ".test.tsx")}`, "SKIP", `needs the package internals: ${describeBlockers(blockers)}`);
  }
  return [...copied].filter((file) => /\.test\.tsx?$/.test(file)).map((file) => destinationOf(file).split(sep).join("/"));
}

function readBarrelNames(ts, directory) {
  const real = realpathSync(join(directory, "node_modules", NATIVE));
  const manifest = JSON.parse(readFileSync(join(real, "package.json"), "utf8"));
  const declarations = join(real, manifest.types ?? "dist/index.d.ts");
  const program = ts.createProgram({
    options: {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      types: [],
    },
    rootNames: [declarations],
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(declarations);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${declarations} is not a module`);
  return new Set(checker.getExportsOfModule(moduleSymbol).map((symbol) => symbol.getName()));
}

const ANSI_COLOR = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

function ansiFree(text) {
  return text.replaceAll(ANSI_COLOR, "");
}

/** The first line of a Jest suite error that is not just the "● Test suite failed to run" banner. */
function suiteError(message) {
  const lines = ansiFree(message ?? "").split("\n").map((line) => line.trim());
  const cause = lines.find((line) => line !== "" && !line.startsWith("●")) ?? lines.find((line) => line !== "") ?? "no message";
  return cause.length > 150 ? `${cause.slice(0, 147)}...` : cause;
}

/** `tsc` failure detail: how many errors, and the first one. */
export function tscDetail(log) {
  const errors = log.split("\n").filter((line) => /: error TS\d+:/.test(line));
  if (errors.length === 0) return undefined;
  const first = errors[0].length > 170 ? `${errors[0].slice(0, 167)}...` : errors[0];
  return `${errors.length} type error${errors.length === 1 ? "" : "s"}, first: ${first}`;
}

/** Table rows (without a consumer) for a parsed `jest --json` result: one per test file, plus any file that never ran. */
export function jestRows(results, directory, expected) {
  const seen = new Set();
  const found = results.testResults.map((file) => {
    const name = relative(directory, file.name).split(sep).join("/");
    seen.add(name);
    const step = name.startsWith(`${TESTS_DIR}/`) ? `a11y ${basename(name, ".test.tsx")}` : `jest ${name}`;
    const tests = file.assertionResults ?? [];
    if (file.status === "passed") {
      return { detail: `${tests.filter((test) => test.status === "passed").length} tests`, status: "PASS", step };
    }
    const failed = tests.filter((test) => test.status === "failed");
    if (failed.length === 0) {
      return { detail: `suite failed to run: ${suiteError(file.message)}`, status: "FAIL", step };
    }
    return { detail: `${failed.length} failed of ${tests.length}: ${failed[0].title}`, status: "FAIL", step };
  });
  const missing = expected
    .filter((name) => !seen.has(name))
    .map((name) => ({ detail: "test file was not executed", status: "FAIL", step: `jest ${name}` }));
  return [...found, ...missing];
}

async function runCatalog(context, version) {
  const consumer = "catalog";
  const directory = join(context.run, consumer);
  const steps = ["typecheck", "jest", "expo export ios", "expo export android"];
  writeCatalogManifest(context, directory, version);
  if (!(await install(context, consumer, directory, version))) {
    skip(consumer, ["prepare", ...steps], "install failed");
    return;
  }
  const ts = createRequire(join(directory, "package.json"))("typescript");
  let expected;
  try {
    expected = prepareCatalog(context, directory, ts, readBarrelNames(ts, directory));
  } catch (error) {
    record(consumer, "prepare", "FAIL", error.message);
  }
  if (!expected) {
    skip(consumer, steps, "prepare failed");
    return;
  }
  await step(context, consumer, "typecheck", "pnpm", ["exec", "tsc", "--noEmit"], {
    cwd: directory,
    describeFailure: tscDetail,
    minutes: 10,
  });

  const resultsFile = join(context.logs, "catalog-jest-results.json");
  const jestOk = await step(
    context,
    consumer,
    "jest run",
    "pnpm",
    [
      "exec",
      "jest",
      "--ci",
      "--maxWorkers=2",
      `--cacheDirectory=${join(context.run, "jest-cache")}`,
      "--json",
      `--outputFile=${resultsFile}`,
    ],
    { cwd: directory, minutes: 30 },
  );
  // The "jest run" row says whether the process exited cleanly; the rows below say which files.
  if (existsSync(resultsFile)) {
    const results = JSON.parse(readFileSync(resultsFile, "utf8"));
    for (const row of jestRows(results, directory, expected)) record(consumer, row.step, row.status, row.detail);
  } else if (jestOk) {
    record(consumer, "jest", "FAIL", "jest exited 0 but wrote no results");
  }
  await exportBoth(context, consumer, directory);
}

/* -------------------------------------------------------------------------- */
/* Main                                                                         */
/* -------------------------------------------------------------------------- */

const USAGE = `usage: verify-published.mjs <version|dist-tag> [--keep] [--only clean-app|catalog]

  <version|dist-tag>  exact version of @vllnt/ui-native and @vllnt/ui-core, or a dist-tag of ui-native
  --keep              keep the scratch directory when something fails (default: delete it)
  --only <consumer>   run one consumer only`;

function parseArguments(argv) {
  const options = { keep: false, only: undefined, spec: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--keep") options.keep = true;
    else if (argument === "--only") options.only = argv[++index];
    else if (argument === "--help" || argument === "-h") throw new Error(USAGE);
    else if (argument.startsWith("-") || options.spec !== undefined) throw new Error(`unexpected argument ${argument}\n${USAGE}`);
    else options.spec = argument;
  }
  if (!options.spec) throw new Error(USAGE);
  if (options.only !== undefined && !["clean-app", "catalog"].includes(options.only)) {
    throw new Error(`--only takes clean-app or catalog\n${USAGE}`);
  }
  classifySpec(options.spec);
  return options;
}

function scratchBase() {
  return process.env.RUNNER_TEMP
    ? join(process.env.RUNNER_TEMP, "verify-published")
    : join(homedir(), ".cache/ui/verify-published");
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    return 2;
  }

  const base = scratchBase();
  mkdirSync(base, { recursive: true });
  const run = mkdtempSync(join(base, "run-"));
  if (!inside(base, run) || !relative(repositoryRoot, run).startsWith("..")) {
    throw new Error(`scratch dir ${run} must be outside the workspace`);
  }
  const logs = join(run, "logs");
  mkdirSync(logs);
  mkdirSync(join(run, "tmp"));

  const stop = (signal) => {
    if (activeChild) killGroup(activeChild);
    if (!options.keep) rmSync(run, { force: true, recursive: true });
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  let version;
  try {
    const policy = readAgePolicy(readFileSync(join(repositoryRoot, "pnpm-workspace.yaml"), "utf8"));
    const lockText = readFileSync(join(repositoryRoot, "pnpm-lock.yaml"), "utf8");
    const lock = readImporterVersions(lockText, "apps/native-catalog");
    const pins = pickPins(lock, [...PINNED, ...COMPANIONS]);
    // React Native 0.86 moved its Jest preset into @react-native/jest-preset, released in lockstep.
    pins[JEST_PRESET] = pins["react-native"];
    if (!lockHasPackage(lockText, JEST_PRESET, pins[JEST_PRESET])) {
      throw new Error(`pnpm-lock.yaml does not resolve ${JEST_PRESET}@${pins[JEST_PRESET]}`);
    }
    const environment = cleanEnvironment(process.env, {
      CI: "1",
      EXPO_NO_GIT_STATUS: "1",
      EXPO_NO_TELEMETRY: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
      TMPDIR: join(run, "tmp"),
    });
    const context = { environment, logs, pins, policy, run };

    console.log(`scratch: ${run}`);
    console.log(`age gate: ${policy.minimumReleaseAge} min, exempt: ${[...new Set([...policy.exclude, "@vllnt/*"])].join(", ")}`);
    console.log(`pins: ${PINNED.map((name) => `${name}@${pins[name]}`).join(" ")}`);

    version = resolvePair(context, options.spec);
    if (version) {
      if (options.only !== "catalog") await runCleanApp(context, version);
      if (options.only !== "clean-app") await runCatalog(context, version);
    }
  } catch (error) {
    record("setup", "run", "FAIL", error.message);
  }

  const totals = summarize(rows);
  console.log(`\n${renderTable(rows)}\n\n${totals.pass} PASS, ${totals.fail} FAIL, ${totals.skip} SKIP`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${renderMarkdown(rows, version ?? options.spec)}\n`);
  }

  if (totals.fail > 0 && options.keep) console.log(`scratch kept: ${run}`);
  else rmSync(run, { force: true, recursive: true });
  return totals.fail > 0 ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
