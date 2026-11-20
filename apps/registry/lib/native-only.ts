import { readFileSync } from "node:fs";
import { join } from "node:path";

type ParityFile = { nativeOnly?: { name: string }[] };

/**
 * Names that the native parity contract (packages/ui-native/parity.json,
 * `nativeOnly`) lists as native modules with no web component, such as Icon,
 * Stack and Spacer. The web registry leaves them out by design.
 * check-parity.mjs already rejects a nativeOnly name that matches a web component.
 */
export function readNativeOnlyNames(repoRoot: string): Set<string> {
  const parity = JSON.parse(
    readFileSync(join(repoRoot, "packages/ui-native/parity.json"), "utf8"),
  ) as ParityFile;
  if (!Array.isArray(parity.nativeOnly)) {
    throw new TypeError(
      "packages/ui-native/parity.json has no nativeOnly list",
    );
  }
  return new Set(parity.nativeOnly.map((entry) => entry.name));
}
