/**
 * Post-build step: writes `dist/subpaths/<name>.js` and `.d.ts` for every
 * `@vllnt/ui/<name>` subpath (see `subpaths.ts`). It runs after tsup, whose
 * declaration build clears every `.d.ts` in `dist` when it starts.
 *
 * Usage: part of `pnpm -F @vllnt/ui build`.
 */

import { resolve } from "node:path";

import { writeSubpaths } from "./subpaths";

const count = await writeSubpaths(resolve(import.meta.dirname, ".."));
console.log(`Wrote ${count} subpath entries to dist/subpaths.`);
