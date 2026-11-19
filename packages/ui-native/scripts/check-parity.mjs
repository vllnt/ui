import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Drift check for packages/ui-native/parity.json: the machine-readable matrix of every
// @vllnt/ui web component against @vllnt/ui-native. It also renders docs/native/PARITY.md.
//   node scripts/check-parity.mjs            validate only
//   node scripts/check-parity.mjs --check    validate and fail when docs/native/PARITY.md is stale
//   node scripts/check-parity.mjs --write    validate and regenerate docs/native/PARITY.md

const WEB_LEVELS = ["atoms", "molecules", "organisms", "templates"];
const REGENERATE = "node packages/ui-native/scripts/check-parity.mjs --write";

const SPATIAL_NOTE = [
  "0.1.0 native components follow the affordance contract and 44 pt touch targets from day one.",
  "The depth tokens (base, raised, overlay, floating, modal) and the 60 pt gaze target come from ui-core when the web lane lands them (planned for @vllnt/ui 0.5.0); native adopts them then.",
  "The spatial renderer is not planned.",
];

// ---------- facts ----------

async function directories(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function loadFacts(repoRoot) {
  const packageDirectory = join(repoRoot, "packages/ui-native");
  const web = new Map();
  for (const level of WEB_LEVELS) {
    for (const name of await directories(join(repoRoot, "packages/ui/src/components", level))) {
      web.set(name, level);
    }
  }
  const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
  const registry = (await readJson(join(packageDirectory, "registry.json"))).components;
  const schema = await readJson(join(packageDirectory, "parity.schema.json"));
  const parity = await readJson(join(packageDirectory, "parity.json"));
  return { parity, registry, schema, web };
}

// ---------- schema shapes (the subset parity.schema.json uses) ----------

function resolveSchema(schema, root) {
  return schema.$ref ? root.$defs[schema.$ref.replace("#/$defs/", "")] : schema;
}

function checkShape(value, rawSchema, root, path, errors) {
  const schema = resolveSchema(rawSchema, root);
  if (schema.const !== undefined) {
    if (value !== schema.const) errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
    return;
  }
  if (schema.enum) {
    if (!schema.enum.includes(value)) {
      errors.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
    }
    return;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") return void errors.push(`${path}: must be a string`);
    if (schema.minLength && value.length < schema.minLength) errors.push(`${path}: must not be empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
    }
  } else if (schema.type === "boolean") {
    if (typeof value !== "boolean") errors.push(`${path}: must be true or false`);
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) return void errors.push(`${path}: must be an array`);
    if (schema.minItems && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} item(s)`);
    if (schema.uniqueItems && new Set(value).size !== value.length) errors.push(`${path}: items must be unique`);
    if (schema.items) {
      value.forEach((item, index) => {
        const label = typeof item?.name === "string" ? item.name : index;
        checkShape(item, schema.items, root, `${path}[${label}]`, errors);
      });
    }
  } else if (schema.type === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return void errors.push(`${path}: must be an object`);
    }
    for (const key of schema.required ?? []) {
      if (value[key] === undefined) errors.push(`${path}: missing required field "${key}"`);
    }
    const known = schema.properties ?? {};
    for (const [key, item] of Object.entries(value)) {
      if (known[key]) checkShape(item, known[key], root, `${path}.${key}`, errors);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        checkShape(item, schema.additionalProperties, root, `${path}.${key}`, errors);
      } else if (schema.additionalProperties === false) errors.push(`${path}: unknown field "${key}"`);
    }
  }
}

// ---------- validation ----------

const hasOwn = (object, key) => object[key] !== undefined;

function semverAfterTarget(target, floor) {
  const parse = (version) => version.split(".").map(Number);
  const [a, b] = [parse(target), parse(floor)];
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index];
  }
  return false;
}

function checkAffordance(entry, label, errors) {
  if (entry.interactive === true) {
    if (!hasOwn(entry, "affordance")) errors.push(`${label}: interactive entries need "affordance"`);
  } else if (hasOwn(entry, "affordance")) {
    errors.push(`${label}: only interactive entries have "affordance"`);
  }
  if (Array.isArray(entry.affordance) && entry.affordance.includes("unknown") && entry.affordance.length > 1) {
    errors.push(`${label}: "unknown" must stand alone in affordance`);
  }
}

function checkDecision(entry, label, errors) {
  if (entry.decision === true && !hasOwn(entry, "question")) errors.push(`${label}: decision needs a "question"`);
  if (entry.decision !== true && hasOwn(entry, "question")) errors.push(`${label}: "question" needs "decision": true`);
}

function checkComponent(entry, context, errors) {
  const { foundationCategories, registry, target, web } = context;
  const label = `components[${entry.name}]`;
  const webLevel = web.get(entry.name);
  if (webLevel === undefined) errors.push(`${label}: no web component directory with this name`);
  else if (entry.level !== webLevel) errors.push(`${label}: level is ${entry.level} but the web component is in ${webLevel}`);

  const native = entry.status === "native-0.1.0";
  const exists = native && entry.missing !== true;
  if (entry.status === "web-only" || entry.status === "later") {
    if (!hasOwn(entry, "reason")) errors.push(`${label}: ${entry.status} needs a "reason"`);
    for (const key of ["source", "missing", "propsGap", "propsRenamed"]) {
      if (hasOwn(entry, key)) errors.push(`${label}: ${entry.status} entries must not have "${key}"`);
    }
  }
  if (entry.status === "later") {
    if (!hasOwn(entry, "target")) errors.push(`${label}: later needs a "target"`);
    else if (!semverAfterTarget(entry.target, target)) errors.push(`${label}: target ${entry.target} must be after ${target}`);
  } else if (hasOwn(entry, "target")) errors.push(`${label}: only later entries have "target"`);

  if (native) {
    if (hasOwn(entry, "nativeEquivalent")) errors.push(`${label}: native-0.1.0 entries have a module, not a "nativeEquivalent"`);
    if (entry.missing === true) {
      if (entry.foundation !== true) errors.push(`${label}: only foundation entries can be missing`);
      if (hasOwn(entry, "source")) errors.push(`${label}: missing entries have no "source"`);
      if (registry.has(entry.name)) errors.push(`${label}: marked missing but registry.json has the module; remove "missing"`);
    } else {
      if (!registry.has(entry.name)) errors.push(`${label}: native-0.1.0 but registry.json has no such module; mark it missing or fix the status`);
      else if (entry.source !== registry.get(entry.name)) errors.push(`${label}: source must be ${registry.get(entry.name)}`);
    }
  } else if (registry.has(entry.name)) {
    errors.push(`${label}: registry.json has a native module, so the status must be native-0.1.0`);
  }

  const foundation = entry.foundation === true;
  if (foundation) {
    if (!foundationCategories.includes(entry.category)) errors.push(`${label}: foundation entries use a foundation category`);
    if (!native && !(entry.status === "web-only" && hasOwn(entry, "nativeEquivalent"))) {
      errors.push(`${label}: foundation entries must be native-0.1.0 (or web-only with a nativeEquivalent)`);
    }
    if (typeof entry.interactive !== "boolean") errors.push(`${label}: foundation entries need "interactive"`);
    checkAffordance(entry, label, errors);
    if (exists && !hasOwn(entry, "propsGap")) errors.push(`${label}: foundation entries that exist need "propsGap"`);
    if (hasOwn(entry, "propsRenamed")) {
      for (const key of Object.keys(entry.propsRenamed)) {
        if (entry.propsGap?.includes(key)) errors.push(`${label}: "${key}" is in both propsGap and propsRenamed`);
      }
    }
  } else {
    for (const key of ["interactive", "affordance", "propsGap", "propsRenamed"]) {
      if (hasOwn(entry, key)) errors.push(`${label}: only foundation entries have "${key}"`);
    }
  }
  checkDecision(entry, label, errors);
}

function checkNativeOnly(entry, context, errors) {
  const { foundationCategories, registry, web } = context;
  const label = `nativeOnly[${entry.name}]`;
  if (web.has(entry.name)) errors.push(`${label}: a web component has this name; classify it in components instead`);
  if (entry.status === "built" && !registry.has(entry.name)) errors.push(`${label}: built but registry.json has no such module`);
  if (entry.status === "planned" && registry.has(entry.name)) errors.push(`${label}: registry.json has the module; set status to built`);
  if (entry.foundation === true && !foundationCategories.includes(entry.category)) {
    errors.push(`${label}: foundation entries use a foundation category`);
  }
  if (entry.foundation === true && typeof entry.interactive !== "boolean") errors.push(`${label}: foundation entries need "interactive"`);
  checkAffordance(entry, label, errors);
  checkDecision(entry, label, errors);
}

export function validate({ parity, registry, schema, web }) {
  const errors = [];
  checkShape(parity, schema, schema, "parity.json", errors);
  if (!Array.isArray(parity?.components) || !Array.isArray(parity?.nativeOnly)) return errors;

  const registrySources = new Map();
  for (const { name, source } of registry) registrySources.set(name, source);
  const context = {
    foundationCategories: schema["x-foundationCategories"],
    registry: registrySources,
    target: parity.target,
    web,
  };

  const names = new Set();
  for (const entry of parity.components) {
    if (typeof entry?.name !== "string") continue;
    if (names.has(entry.name)) errors.push(`components[${entry.name}]: duplicate entry`);
    names.add(entry.name);
  }
  for (const name of [...web.keys()].sort()) {
    if (!names.has(name)) errors.push(`web component "${name}" (${web.get(name)}) has no parity entry`);
  }
  for (const entry of parity.components) {
    if (typeof entry === "object" && entry !== null && typeof entry.name === "string") checkComponent(entry, context, errors);
  }

  const nativeOnlyNames = new Set();
  for (const entry of parity.nativeOnly) {
    if (typeof entry?.name !== "string") continue;
    if (nativeOnlyNames.has(entry.name) || names.has(entry.name)) errors.push(`nativeOnly[${entry.name}]: duplicate name`);
    nativeOnlyNames.add(entry.name);
    checkNativeOnly(entry, context, errors);
  }

  for (const name of registrySources.keys()) {
    const entry = parity.components.find((candidate) => candidate.name === name);
    const builtNativeOnly = parity.nativeOnly.some((candidate) => candidate.name === name && candidate.status === "built");
    const marked = entry ? entry.status === "native-0.1.0" && entry.missing !== true : builtNativeOnly;
    if (!marked) errors.push(`native module "${name}" must be marked native-0.1.0 (or be a built nativeOnly entry) in parity.json`);
  }
  return errors;
}

// ---------- PARITY.md ----------

const cell = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const codeList = (items) => items.map((item) => `\`${item}\``).join(", ");
const title = (category) => category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
const sentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);
const byName = (left, right) => left.name.localeCompare(right.name);
const table = (header, rows) => [`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`)];

function nativePath(entry) {
  return `${entry.source.split("/")[2]}/${entry.name}`;
}

function foundationRow(entry) {
  const nativeOnly = entry.web === false;
  let state = "exists";
  let nativeCell = "—";
  if (nativeOnly) {
    state = entry.status === "built" ? "exists (native-only)" : "MISSING (native-only)";
    if (entry.status === "built") nativeCell = `\`${entry.name}\``;
  } else if (entry.missing) {
    state = "MISSING";
  } else if (entry.status === "web-only") {
    state = "mapped";
    nativeCell = codeList(entry.nativeEquivalent);
  } else {
    nativeCell = nativePath(entry);
  }
  const gap = !nativeOnly && entry.status === "native-0.1.0" && !entry.missing ? (entry.propsGap.length > 0 ? codeList(entry.propsGap) : "none") : "—";
  const notes = [];
  if (entry.status === "web-only") notes.push(entry.reason);
  if (nativeOnly) notes.push(entry.reason, `Proposed: \`${entry.proposedApi}\``);
  if (entry.dependency && nativeOnly) notes.push(`Needs: ${entry.dependency}`);
  if (entry.propsRenamed) {
    notes.push(`Renamed: ${Object.entries(entry.propsRenamed).map(([web, native]) => `\`${web}\` → \`${native}\``).join(", ")}`);
  }
  if (entry.note) notes.push(entry.note);
  if (entry.decision) notes.push(`**Decision:** ${entry.question}`);
  return [
    `\`${entry.name}\``,
    nativeOnly ? "—" : entry.level,
    nativeCell,
    state,
    entry.interactive ? "yes" : "no",
    entry.interactive ? codeList(entry.affordance) : "—",
    gap,
    notes.map(sentence).join(" "),
  ];
}

function categoryRow(entry) {
  let nativeCell = "—";
  if (entry.status === "native-0.1.0") nativeCell = nativePath(entry);
  else if (entry.nativeEquivalent) nativeCell = codeList(entry.nativeEquivalent);
  const notes = [];
  if (entry.reason) notes.push(entry.reason);
  if (entry.dependency) notes.push(`Needs: ${entry.dependency}`);
  if (entry.note) notes.push(entry.note);
  if (entry.decision) notes.push(`**Decision:** ${entry.question}`);
  return [`\`${entry.name}\``, entry.level, entry.status, entry.target ?? "—", nativeCell, notes.map(sentence).join(" ")];
}

function count(entries, predicate) {
  return entries.filter(predicate).length;
}

export function render(parity, schema) {
  const { components, nativeOnly } = parity;
  const categories = schema.$defs.category.enum;
  const foundationCategories = schema["x-foundationCategories"];
  const built = count(components, (entry) => entry.status === "native-0.1.0" && !entry.missing);
  const planned = count(components, (entry) => entry.missing === true);
  const laterTargets = [...new Set(components.filter((entry) => entry.status === "later").map((entry) => entry.target))].sort();
  const decisions = [...components, ...nativeOnly].filter((entry) => entry.decision).sort(byName);
  const foundation = [
    ...components.filter((entry) => entry.foundation),
    ...nativeOnly.filter((entry) => entry.foundation).map((entry) => ({ ...entry, web: false })),
  ];
  const missingFoundation = count(foundation, (entry) => entry.missing === true || (entry.web === false && entry.status === "planned"));
  const mappedFoundation = count(foundation, (entry) => entry.web !== false && entry.status === "web-only");

  const lines = [
    `# Native parity matrix: @vllnt/ui web vs @vllnt/ui-native ${parity.target}`,
    "",
    `> Generated from [\`packages/ui-native/parity.json\`](../../packages/ui-native/parity.json) by \`packages/ui-native/scripts/check-parity.mjs\`. Do not edit by hand: change \`parity.json\`, then run \`${REGENERATE}\`. \`--check\` fails when this file is stale.`,
    "",
    "## Spatial-ready foundations",
    "",
    ...SPATIAL_NOTE.map((line) => `- ${line}`),
    "",
    "The Affordance column below shows what each existing component styles today; the gap to the contract is build work.",
    "",
    "## Summary",
    "",
    ...table(["Status", "Count", "Meaning"], [
      ["native-0.1.0, built", built, "A native module exists in `registry.json`."],
      ["native-0.1.0, planned (missing)", planned, "Foundation component that 0.1.0 must add; not built yet."],
      ["web-only", count(components, (entry) => entry.status === "web-only"), "Stays web-only, with a concrete reason and the native equivalent when there is one."],
      ["later", count(components, (entry) => entry.status === "later"), `Native releases after ${parity.target}: ${laterTargets.map((target) => `${target} (${count(components, (entry) => entry.target === target)})`).join(", ")}.`],
      ["**Web components**", `**${components.length}**`, "One entry each."],
      ["Native-only primitives (planned)", count(nativeOnly, (entry) => entry.status === "planned"), `${nativeOnly.map((entry) => `\`${entry.name}\``).join(", ")}: no web component behind them.`],
    ]),
    "",
    `Foundation set: ${foundation.length} rows, ${foundation.length - missingFoundation - mappedFoundation} exist on native, ${missingFoundation} are missing, ${mappedFoundation} map to a native equivalent. Open decisions: ${decisions.length} (listed at the end).`,
    "",
    "## Foundation",
    "",
    "Everything here ships in 0.1.0. **State**: exists = native module today; MISSING = planned, not built; mapped = web-only component covered by the listed native equivalent. **Affordance** lists the contract states the native component styles itself today (rest, hover, focus-visible, pressed, selected, disabled; `unknown` when the source is unclear). **Props gap** lists exported web props with no native counterpart; DOM-only props (className, asChild, HTML attributes, mouse and pointer events) are ignored.",
    "",
  ];

  for (const category of foundationCategories) {
    const rows = foundation.filter((entry) => entry.category === category).sort(byName);
    if (rows.length === 0) continue;
    lines.push(`### ${title(category)}`, "", ...table(["Component", "Web", "Native", "State", "Interactive", "Affordance", "Props gap", "Notes"], rows.map(foundationRow)), "");
  }

  lines.push("## Components by category", "", "Foundation components are listed above and not repeated here.", "");
  for (const category of categories) {
    const rows = components.filter((entry) => entry.category === category && !entry.foundation).sort(byName);
    if (rows.length === 0) continue;
    const statuses = ["native-0.1.0", "web-only", "later"].map((status) => `${status} ${count(rows, (entry) => entry.status === status)}`);
    lines.push(`### ${title(category)} (${rows.length})`, "", statuses.join(" · "), "", ...table(["Component", "Web", "Status", "Target", "Native / equivalent", "Reason and needs"], rows.map(categoryRow)), "");
  }

  lines.push("## Open decisions", "");
  decisions.forEach((entry, index) => {
    const where = entry.status === "planned" ? "native-only" : entry.status === "later" ? `later ${entry.target}` : entry.status;
    lines.push(`${index + 1}. \`${entry.name}\` (${where}): ${entry.question}`);
  });
  lines.push("");
  return lines.join("\n");
}

// ---------- CLI ----------

async function main(argv) {
  const write = argv.includes("--write");
  const check = argv.includes("--check");
  if (write && check) {
    console.error("Use either --write or --check, not both.");
    process.exit(2);
  }
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const docPath = join(repoRoot, "docs/native/PARITY.md");

  let facts;
  try {
    facts = await loadFacts(repoRoot);
  } catch (error) {
    console.error(`Native parity check failed: ${error.message}`);
    process.exit(1);
  }
  const errors = validate(facts);
  if (errors.length > 0) {
    console.error(`Native parity check failed (${errors.length}):\n${errors.map((error) => `  - ${error}`).join("\n")}`);
    process.exit(1);
  }

  const document = render(facts.parity, facts.schema);
  if (write) {
    await mkdir(dirname(docPath), { recursive: true });
    await writeFile(docPath, document);
  } else if (check) {
    const current = await readFile(docPath, "utf8").catch(() => undefined);
    if (current !== document) {
      console.error(`docs/native/PARITY.md is stale. Run: ${REGENERATE}`);
      process.exit(1);
    }
  }
  const { components } = facts.parity;
  const counts = ["native-0.1.0", "web-only", "later"].map((status) => `${count(components, (entry) => entry.status === status)} ${status}`);
  console.log(`${write ? "Wrote docs/native/PARITY.md. " : ""}Native parity matrix is current (${components.length} web components: ${counts.join(", ")}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main(process.argv.slice(2));
}
