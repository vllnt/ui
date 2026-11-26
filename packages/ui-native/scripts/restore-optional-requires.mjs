import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  brokenOptionalRequires,
  GLASS_PEERS_FILE,
  restoreOptionalRequires,
} from "./optional-peers.mjs";

const file = resolve(import.meta.dirname, "..", GLASS_PEERS_FILE);
const restored = restoreOptionalRequires(await readFile(file, "utf8"));
const broken = brokenOptionalRequires(restored);

if (broken.length > 0) {
  throw new Error(
    `${GLASS_PEERS_FILE} does not load these optional peers with a plain require: ${broken.join(", ")}.`,
  );
}

await writeFile(file, restored);
console.log(`Restored the optional peer requires in ${GLASS_PEERS_FILE}.`);
