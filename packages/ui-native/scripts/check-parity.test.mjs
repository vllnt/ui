import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { render, validate } from "./check-parity.mjs";

const schema = JSON.parse(await readFile(new URL("../parity.schema.json", import.meta.url), "utf8"));

const SOURCE = (level, name) => `src/components/${level}/${name}/${name}.tsx`;

function baseFacts() {
  return structuredClone({
    parity: {
      schemaVersion: "1.0.0",
      package: "@vllnt/ui-native",
      target: "0.1.0",
      components: [
        {
          name: "button", level: "atoms", status: "native-0.1.0", category: "buttons", foundation: true,
          interactive: true, affordance: ["rest", "pressed", "disabled"], source: SOURCE("atoms", "button"),
          propsGap: ["asChildLike", "loading"], propsRenamed: { onClick: "onPress" },
        },
        {
          name: "card", level: "atoms", status: "native-0.1.0", category: "data-display", foundation: true,
          interactive: false, source: SOURCE("molecules", "card"), propsGap: [],
        },
        {
          name: "display", level: "atoms", status: "native-0.1.0", category: "typography", foundation: true,
          missing: true, interactive: false,
        },
        {
          name: "prose", level: "atoms", status: "web-only", category: "typography", foundation: true, interactive: false,
          reason: "Styles raw HTML descendants.", nativeEquivalent: ["heading", "text"],
        },
        {
          name: "chart", level: "organisms", status: "later", category: "charts", target: "0.2.0",
          reason: "Needs vector drawing.", dependency: "react-native-svg",
          decision: true, question: "Which vector library?",
        },
        { name: "cursor", level: "atoms", status: "web-only", category: "motion", reason: "Pointer follower." },
        { name: "kbd", level: "atoms", status: "native-0.1.0", category: "typography", source: SOURCE("atoms", "kbd") },
      ],
      nativeOnly: [
        {
          name: "icon", category: "icons", foundation: true, status: "native-0.1.0", missing: true, interactive: false,
          reason: "No icon component.", proposedApi: '<Icon icon={Check} size="sm" | "md" />',
        },
      ],
      foundationNotes: ["Tabular data: data-list and item rows cover it."],
    },
    registry: [
      { name: "button", source: SOURCE("atoms", "button") },
      { name: "card", source: SOURCE("molecules", "card") },
      { name: "kbd", source: SOURCE("atoms", "kbd") },
    ],
    schema,
    web: new Map([
      ["button", "atoms"], ["card", "atoms"], ["display", "atoms"], ["prose", "atoms"], ["chart", "organisms"],
      ["cursor", "atoms"], ["kbd", "atoms"],
    ]),
  });
}

const entry = (facts, name) => facts.parity.components.find((candidate) => candidate.name === name);

test("the base fixture is valid, including a missing foundation entry", () => {
  assert.deepEqual(validate(baseFacts()), []);
});

const FAILURES = [
  ["a web component dir with no entry", (facts) => facts.web.set("tooltip", "atoms"), /web component "tooltip" \(atoms\) has no parity entry/],
  ["an entry naming a component that does not exist", (facts) => facts.web.delete("cursor"), /components\[cursor\]: no web component directory/],
  ["a web level mismatch", (facts) => { entry(facts, "button").level = "molecules"; }, /level is molecules but the web component is in atoms/],
  ["a native-0.1.0 entry with no registry module", (facts) => { facts.registry = facts.registry.filter(({ name }) => name !== "card"); }, /components\[card\]: native-0.1.0 but registry.json has no such module/],
  ["a native module not marked native-0.1.0", (facts) => { Object.assign(entry(facts, "kbd"), { status: "later", target: "0.2.0", reason: "x" }); delete entry(facts, "kbd").source; }, /components\[kbd\]: registry.json has a native module, so the status must be native-0.1.0/],
  ["a native module with no entry at all", (facts) => facts.registry.push({ name: "toast", source: SOURCE("atoms", "toast") }), /native module "toast" must be marked native-0.1.0/],
  ["a native module flagged missing", (facts) => { entry(facts, "kbd").missing = true; entry(facts, "kbd").foundation = true; entry(facts, "kbd").interactive = false; delete entry(facts, "kbd").source; }, /marked missing but registry.json has the module/],
  ["missing on a non-foundation entry", (facts) => { Object.assign(entry(facts, "display"), { foundation: false }); }, /only foundation entries can be missing/],
  ["a missing entry with a source", (facts) => { entry(facts, "display").source = SOURCE("atoms", "display"); }, /components\[display\]: missing entries have no "source"/],
  ["a stale native source path", (facts) => { entry(facts, "button").source = SOURCE("molecules", "button"); }, /source must be src\/components\/atoms\/button\/button.tsx/],
  ["web-only without a reason", (facts) => { delete entry(facts, "cursor").reason; }, /web-only needs a "reason"/],
  ["later without a reason", (facts) => { delete entry(facts, "chart").reason; }, /later needs a "reason"/],
  ["later without a target", (facts) => { delete entry(facts, "chart").target; }, /later needs a "target"/],
  ["later targeting the 0.1.0 release", (facts) => { entry(facts, "chart").target = "0.1.0"; }, /target 0.1.0 must be after 0.1.0/],
  ["a target on a web-only entry", (facts) => { entry(facts, "cursor").target = "0.2.0"; }, /only later entries have "target"/],
  ["an empty reason", (facts) => { entry(facts, "cursor").reason = ""; }, /components\[cursor\]\.reason: must not be empty/],
  ["a foundation entry that is later", (facts) => { Object.assign(entry(facts, "chart"), { foundation: true, category: "layout", interactive: false }); }, /foundation entries must be native-0.1.0/],
  ["a foundation web-only entry without a native equivalent", (facts) => { delete entry(facts, "prose").nativeEquivalent; }, /foundation entries must be native-0.1.0/],
  ["a foundation entry in a non-foundation category", (facts) => { entry(facts, "card").category = "ai"; }, /foundation entries use a foundation category/],
  ["a foundation entry with no interactive flag", (facts) => { delete entry(facts, "card").interactive; }, /foundation entries need "interactive"/],
  ["an interactive entry with no affordance", (facts) => { delete entry(facts, "button").affordance; }, /interactive entries need "affordance"/],
  ["affordance on a static entry", (facts) => { entry(facts, "card").affordance = ["rest"]; }, /only interactive entries have "affordance"/],
  ["an unknown affordance state", (facts) => { entry(facts, "button").affordance = ["rest", "gazed"]; }, /"gazed" is not one of/],
  ["unknown mixed with other states", (facts) => { entry(facts, "button").affordance = ["rest", "unknown"]; }, /"unknown" must stand alone/],
  ["an existing foundation entry without propsGap", (facts) => { delete entry(facts, "button").propsGap; }, /foundation entries that exist need "propsGap"/],
  ["a prop in both propsGap and propsRenamed", (facts) => { entry(facts, "button").propsGap.push("onClick"); }, /"onClick" is in both propsGap and propsRenamed/],
  ["propsGap on a non-foundation entry", (facts) => { entry(facts, "kbd").propsGap = []; }, /only foundation entries have "propsGap"/],
  ["a decision without a question", (facts) => { delete entry(facts, "chart").question; }, /decision needs a "question"/],
  ["a question without a decision", (facts) => { entry(facts, "cursor").question = "Why?"; }, /"question" needs "decision": true/],
  ["a duplicate entry", (facts) => facts.parity.components.push(structuredClone(entry(facts, "cursor"))), /components\[cursor\]: duplicate entry/],
  ["an unknown field", (facts) => { entry(facts, "cursor").status2 = "x"; }, /unknown field "status2"/],
  ["an invalid status", (facts) => { entry(facts, "cursor").status = "soon"; }, /"soon" is not one of native-0.1.0, web-only, later/],
  ["an invalid category", (facts) => { entry(facts, "cursor").category = "spatial"; }, /"spatial" is not one of/],
  ["a native-only entry no longer missing and without a module", (facts) => { facts.parity.nativeOnly[0].missing = false; }, /nativeOnly\[icon\]: not marked missing but registry.json has no such module/],
  ["a native-only entry marked missing but already in the registry", (facts) => facts.registry.push({ name: "icon", source: SOURCE("atoms", "icon") }), /nativeOnly\[icon\]: marked missing but registry.json has the module/],
  ["a native-only entry with a stale source", (facts) => { Object.assign(facts.parity.nativeOnly[0], { missing: false, source: SOURCE("molecules", "icon") }); facts.registry.push({ name: "icon", source: SOURCE("atoms", "icon") }); }, /nativeOnly\[icon\]: source must be src\/components\/atoms\/icon\/icon.tsx/],
  ["a native-only entry with a source while missing", (facts) => { facts.parity.nativeOnly[0].source = SOURCE("atoms", "icon"); }, /nativeOnly\[icon\]: missing entries have no "source"/],
  ["a native-only entry with the old planned status", (facts) => { facts.parity.nativeOnly[0].status = "planned"; }, /nativeOnly\[icon\]\.status: must be "native-0.1.0"/],
  ["an empty foundation note", (facts) => { facts.parity.foundationNotes = [""]; }, /foundationNotes\[0\]: must not be empty/],
  ["a native-only name that collides with a web component", (facts) => facts.web.set("icon", "atoms"), /nativeOnly\[icon\]: a web component has this name/],
  ["a native-only entry without a proposed API", (facts) => { delete facts.parity.nativeOnly[0].proposedApi; }, /missing required field "proposedApi"/],
];

for (const [name, mutate, pattern] of FAILURES) {
  test(`fails on ${name}`, () => {
    const facts = baseFacts();
    mutate(facts);
    const errors = validate(facts);
    assert.ok(errors.some((error) => pattern.test(error)), `expected ${pattern}, got:\n${errors.join("\n")}`);
  });
}

// The change that builds a planned primitive flips "missing" and adds the registry module together.
const UNFLAGS = [
  ["missing set to false", (record) => { record.missing = false; }],
  ["missing removed", (record) => { delete record.missing; }],
];

for (const [how, unflag] of UNFLAGS) {
  test(`a native-only primitive flips from planned to built with ${how}`, () => {
    const facts = baseFacts();
    assert.deepEqual(validate(facts), [], "planned state");
    const icon = facts.parity.nativeOnly[0];
    unflag(icon);
    icon.source = SOURCE("atoms", "icon");
    facts.registry.push({ name: "icon", source: icon.source });
    assert.deepEqual(validate(facts), [], "built state");
  });

  test(`a missing foundation component flips from planned to built with ${how}`, () => {
    const facts = baseFacts();
    const display = entry(facts, "display");
    unflag(display);
    Object.assign(display, { source: SOURCE("atoms", "display"), propsGap: [] });
    facts.registry.push({ name: "display", source: display.source });
    assert.deepEqual(validate(facts), []);
  });
}

test("the doc moves a built native-only primitive from MISSING to exists", () => {
  const facts = baseFacts();
  const planned = render(facts.parity, facts.schema);
  assert.match(planned, /\| `icon` \| — \| — \| MISSING \(native-only\) \|/);
  assert.match(planned, /\| Native-only primitives \| 1 \| `icon`: no web component behind them \(1 planned, 0 built\)\. \|/);
  Object.assign(facts.parity.nativeOnly[0], { missing: false, source: SOURCE("atoms", "icon") });
  const built = render(facts.parity, facts.schema);
  assert.match(built, /\| `icon` \| — \| atoms\/icon \| exists \(native-only\) \|/);
  assert.match(built, /\(0 planned, 1 built\)/);
});

test("the schema keeps foundation categories first and inside the category enum", () => {
  const categories = schema.$defs.category.enum;
  const foundation = schema["x-foundationCategories"];
  assert.deepEqual(categories.slice(0, foundation.length), foundation);
});

test("renders the spatial note, summary, foundation, categories and decisions in order", () => {
  const facts = baseFacts();
  const document = render(facts.parity, facts.schema);
  const order = ["## Spatial-ready foundations", "## Summary", "## Foundation", "## Components by category", "## Open decisions"].map((heading) => document.indexOf(heading));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), order.join(","));
  assert.match(document, /44 pt touch targets from day one/);
  assert.match(document, /60 pt gaze target come from ui-core/);
  assert.match(document, /spatial renderer is not planned/);
  assert.match(document, /\| native-0.1.0, built \| 3 \|/);
  assert.match(document, /\| native-0.1.0, planned \(missing\) \| 1 \|/);
  assert.match(document, /\| `display` \| atoms \| — \| MISSING \| no \| — \| — \|/);
  const foundationStart = document.indexOf("## Foundation");
  const notePosition = document.indexOf("- Tabular data: data-list and item rows cover it.");
  assert.ok(notePosition > foundationStart && notePosition < document.indexOf("### ", foundationStart), "foundation notes sit under the Foundation heading, before its tables");
  assert.match(document, /1\. `chart` \(later 0\.2\.0\): Which vector library\?/);
  assert.match(document, /\| `button` \| atoms \| atoms\/button \| exists \| yes \| `rest`, `pressed`, `disabled` \| `asChildLike`, `loading` \| Renamed: `onClick` → `onPress`\. \|/);
  assert.match(document, /\| `prose` \| atoms \| `heading`, `text` \| mapped \|/);
  assert.match(document, /\| `icon` \| — \| — \| MISSING \(native-only\) \|/);
  assert.match(document, /size="sm" \\\| "md"/, "pipes inside cells are escaped");
  const byCategory = document.slice(document.indexOf("## Components by category"), document.indexOf("## Open decisions"));
  assert.doesNotMatch(byCategory, /`prose`|`button`|`display`/, "foundation rows are not repeated under categories");
  assert.match(byCategory, /\| `cursor` \| atoms \| web-only \| — \| — \| Pointer follower\. \|/);
  assert.match(byCategory, /\| `chart` \| organisms \| later \| 0\.2\.0 \| — \| Needs vector drawing\. Needs: react-native-svg\. \*\*Decision:\*\* Which vector library\? \|/);
  assert.match(byCategory, /\| `kbd` \| atoms \| native-0\.1\.0 \| — \| atoms\/kbd \|  \|/);
});

test("renders an empty decision list as None", () => {
  const facts = baseFacts();
  Object.assign(entry(facts, "chart"), { decision: undefined, question: undefined });
  const document = render(facts.parity, facts.schema);
  assert.match(document, /## Open decisions\n\nNone\.\n/);
  assert.match(document, /Open decisions: 0\./);
  assert.doesNotMatch(document, /listed at the end/);
});

test("the CLI validates, writes and detects a stale PARITY.md on a fixture repo", async () => {
  const root = await mkdtemp(join(tmpdir(), "native-parity-test-"));
  try {
    const script = join(root, "packages/ui-native/scripts/check-parity.mjs");
    await mkdir(join(root, "packages/ui-native/scripts"), { recursive: true });
    await copyFile(new URL("./check-parity.mjs", import.meta.url), script);
    await copyFile(new URL("../parity.schema.json", import.meta.url), join(root, "packages/ui-native/parity.schema.json"));
    const facts = baseFacts();
    for (const [name, level] of facts.web) await mkdir(join(root, "packages/ui/src/components", level, name), { recursive: true });
    const write = (path, data) => writeFile(join(root, path), typeof data === "string" ? data : `${JSON.stringify(data, null, 2)}\n`);
    await write("packages/ui-native/registry.json", { components: facts.registry });
    await write("packages/ui-native/parity.json", facts.parity);
    const run = (...flags) => spawnSync(process.execPath, [script, ...flags], { encoding: "utf8" });

    const plain = run();
    assert.equal(plain.status, 0, plain.stderr);
    assert.match(plain.stdout, /7 web components: 4 native-0.1.0, 2 web-only, 1 later/);

    const missingDoc = run("--check");
    assert.equal(missingDoc.status, 1);
    assert.match(missingDoc.stderr, /PARITY\.md is stale\. Run: node packages\/ui-native\/scripts\/check-parity\.mjs --write/);

    const written = run("--write");
    assert.equal(written.status, 0, written.stderr);
    assert.match(await readFile(join(root, "docs/native/PARITY.md"), "utf8"), /## Spatial-ready foundations/);
    assert.equal(run("--check").status, 0);

    facts.parity.components.find((component) => component.name === "cursor").reason = "Changed reason.";
    await write("packages/ui-native/parity.json", facts.parity);
    const stale = run("--check");
    assert.equal(stale.status, 1);
    assert.match(stale.stderr, /PARITY\.md is stale/);

    facts.parity.components = facts.parity.components.filter((component) => component.name !== "cursor");
    await write("packages/ui-native/parity.json", facts.parity);
    const drift = run("--check");
    assert.equal(drift.status, 1);
    assert.match(drift.stderr, /Native parity check failed \(1\)/);
    assert.match(drift.stderr, /web component "cursor" \(atoms\) has no parity entry/);

    await write("packages/ui-native/parity.json", "{ not json");
    const broken = run();
    assert.equal(broken.status, 1);
    assert.match(broken.stderr, /Native parity check failed:/);

    assert.equal(run("--write", "--check").status, 2);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
