import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { checkPackedPackage } from "../../../scripts/packed-package.mjs";

import {
  brokenOptionalRequires,
  GLASS_PEERS_FILE,
  OPTIONAL_PEERS,
} from "./optional-peers.mjs";

await checkPackedPackage({
  conditions: ["default", "import", "react-native", "types"],
  fields: ["main", "module", "react-native", "types"],
  name: "native",
  packageDirectory: resolve(import.meta.dirname, ".."),
  async verify(manifest, packedDirectory) {
    const coreRange = manifest.dependencies?.["@vllnt/ui-core"];
    if (typeof coreRange !== "string" || coreRange.startsWith("workspace:")) {
      throw new Error(`Packed @vllnt/ui-core range is invalid: ${coreRange}.`);
    }

    for (const peer of OPTIONAL_PEERS) {
      if (manifest.peerDependenciesMeta?.[peer]?.optional !== true) {
        throw new Error(`Packed ${peer} must be an optional peer.`);
      }
      if (manifest.dependencies?.[peer] !== undefined) {
        throw new Error(`Packed ${peer} must not be a dependency.`);
      }
    }

    const glassPeers = await readFile(
      join(packedDirectory, GLASS_PEERS_FILE),
      "utf8",
    );
    const broken = brokenOptionalRequires(glassPeers);
    if (broken.length > 0) {
      throw new Error(
        `Packed ${GLASS_PEERS_FILE} must load ${broken.join(", ")} with a plain require so Metro treats it as optional.`,
      );
    }

    console.log(
      `Packed native package resolves main, module, react-native, and types from dist (${manifest.version}).`,
    );
  },
});
