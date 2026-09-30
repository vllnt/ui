import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Atomic Design level folders of `packages/ui/src/components`, lowest first.
 * Mirrors the levels enforced by `scripts/check-atomic-levels.mjs`.
 */
export const COMPONENT_LEVELS = [
  "atoms",
  "molecules",
  "organisms",
  "templates",
] as const;

const LEVEL_NAMES: ReadonlySet<string> = new Set(COMPONENT_LEVELS);

/** A `@vllnt/ui` component folder. */
export type ComponentDirectory = {
  directory: string;
  name: string;
};

const byName = (a: ComponentDirectory, b: ComponentDirectory): number => {
  if (a.name === b.name) return 0;
  return a.name < b.name ? -1 : 1;
};

const listDirectories = (directory: string): string[] =>
  existsSync(directory)
    ? readdirSync(directory).filter((entry) =>
        statSync(path.join(directory, entry)).isDirectory(),
      )
    : [];

/**
 * Finds a `@vllnt/ui` component folder by name. Components live at
 * `<componentsRoot>/<level>/<name>/`; a folder directly under `componentsRoot`
 * is still found until every component sits in a level folder.
 *
 * @param componentsRoot - Absolute path of `packages/ui/src/components`.
 * @param name - Component folder name, e.g. `"button"`.
 * @returns The folder path, or `undefined` when no level holds `name`.
 * @example findComponentDirectory(root, "button") // → `${root}/atoms/button`
 */
export function findComponentDirectory(
  componentsRoot: string,
  name: string,
): string | undefined {
  return [...COMPONENT_LEVELS, ""]
    .map((level) => path.join(componentsRoot, level, name))
    .find((directory) => existsSync(directory));
}

/**
 * Lists every `@vllnt/ui` component folder.
 *
 * @param componentsRoot - Absolute path of `packages/ui/src/components`.
 * @returns One entry per component, sorted by name.
 */
export function listComponentDirectories(
  componentsRoot: string,
): ComponentDirectory[] {
  const unleveled = listDirectories(componentsRoot)
    .filter((entry) => !LEVEL_NAMES.has(entry))
    .map((name) => ({ directory: path.join(componentsRoot, name), name }));
  const leveled = COMPONENT_LEVELS.flatMap((level) => {
    const levelDirectory = path.join(componentsRoot, level);
    return listDirectories(levelDirectory).map((name) => ({
      directory: path.join(levelDirectory, name),
      name,
    }));
  });

  return [...unleveled, ...leveled].sort(byName);
}
