/**
 * Re-stamp version + stability + generatedAt onto every /r/*.json after
 * `shadcn build` — the shadcn CLI drops fields it doesn't recognise, so we
 * patch them back in from the source `registry.json` post-build.
 *
 * Why: `inline-component-source.ts` writes the canonical `registry.json` with
 * version + stability per item (see #253). `shadcn build` then emits the
 * public per-component schemas under `apps/registry/public/r/*.json` but
 * strips unknown fields. This script reads the canonical metadata and
 * applies it back to the shadcn-built outputs so AI agents and the registry
 * UI see consistent shape across both.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "../../..");
const registryJsonPath = join(repoRoot, "apps/registry/registry.json");
const publicRDir = join(repoRoot, "apps/registry/public/r");

type Stability = "stable" | "beta" | "experimental" | "deprecated";
type ComponentPlatform = "native" | "web";

type NativeRenderer = {
  channel: "canary";
  package: "@vllnt/ui-native";
  parity: "api-only" | "full";
  status: "experimental";
};

type A11yKeyboardBinding = {
  keys: string;
  action: string;
};

type A11ySchema = {
  role?: string;
  keyboard?: A11yKeyboardBinding[];
  aria?: string[];
  focusManagement?: "auto" | "manual";
  notes?: string;
};

type UsageExample = {
  title: string;
  description?: string;
  code: string;
  framework?: "next" | "react" | "react-native";
  storyId?: string;
};

type PropDefinition = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: boolean;
};

type RegistryItem = {
  a11y?: A11ySchema;
  examples?: UsageExample[];
  name: string;
  native?: NativeRenderer;
  platforms: ComponentPlatform[];
  props?: PropDefinition[];
  version?: string;
  stability?: Stability;
  replacedBy?: string;
};

type Registry = {
  generatedAt?: string;
  items: RegistryItem[];
  version?: string;
};

const registry = JSON.parse(readFileSync(registryJsonPath, "utf8")) as Registry;

let stampedCount = 0;
for (const item of registry.items) {
  const filePath = join(publicRDir, `${item.name}.json`);
  if (!existsSync(filePath)) continue;

  const data = JSON.parse(readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;

  data.version = item.version;
  data.stability = item.stability;
  data.platforms = item.platforms;
  if (item.native) {
    data.native = item.native;
  } else {
    delete data.native;
  }
  if (item.replacedBy) {
    data.replacedBy = item.replacedBy;
  } else {
    delete data.replacedBy;
  }
  if (item.a11y) {
    data.a11y = item.a11y;
  } else {
    delete data.a11y;
  }
  if (item.examples && item.examples.length > 0) {
    data.examples = item.examples;
  } else {
    delete data.examples;
  }
  if (item.props && item.props.length > 0) {
    data.props = item.props;
  } else {
    delete data.props;
  }

  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  stampedCount += 1;
}

// Patch the public registry index too — agents read /r/registry.json.
const indexPath = join(publicRDir, "registry.json");
if (existsSync(indexPath)) {
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    generatedAt?: string;
    items?: Record<string, unknown>[];
    version?: string;
  };
  const metadataByName = new Map(
    registry.items.map((item) => [item.name, item]),
  );
  for (const indexItem of index.items ?? []) {
    const name = typeof indexItem.name === "string" ? indexItem.name : "";
    const metadata = metadataByName.get(name);
    if (!metadata) continue;
    indexItem.platforms = metadata.platforms;
    if (metadata.native) {
      indexItem.native = metadata.native;
    } else {
      delete indexItem.native;
    }
  }
  index.version = registry.version;
  index.generatedAt = registry.generatedAt;
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
}

console.log(
  `Stamped version=${registry.version ?? "?"} stability on ${stampedCount} /r/*.json files.`,
);
