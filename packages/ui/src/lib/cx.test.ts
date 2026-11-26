import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { cx } from "./cx";
import { cn } from "./utils";

const source = resolve(__dirname, "..");

/** Runtime import specifiers of one source file (type imports skipped). */
function importSpecifiers(file: string): string[] {
  const parsed = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
  );
  return parsed.statements.flatMap((statement) => {
    if (ts.isImportDeclaration(statement)) {
      const typeOnly =
        statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword;
      return !typeOnly && ts.isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [];
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      return [statement.moduleSpecifier.text];
    }
    return [];
  });
}

function resolveSource(from: string, specifier: string): string {
  const base = resolve(dirname(from), specifier);
  const found = [".ts", ".tsx", "/index.ts", "/index.tsx"]
    .map((extension) => `${base}${extension}`)
    .find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`Cannot resolve ${specifier} from ${from}`);
  return found;
}

/** Every package and source file a source file reaches at runtime. */
function runtimeImports(file: string, seen = new Set<string>()): Set<string> {
  seen.add(file);
  importSpecifiers(file).forEach((specifier) => {
    if (!specifier.startsWith(".")) {
      seen.add(specifier);
      return;
    }
    const target = resolveSource(file, specifier);
    if (!seen.has(target)) runtimeImports(target, seen);
  });
  return seen;
}

describe("cx", () => {
  it("joins class values without resolving conflicts", () => {
    expect(cx("px-2", ["px-4", false], { block: true, hidden: false })).toBe(
      "px-2 px-4 block",
    );
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cx()).toBe("");
  });

  it.each([
    "lib/cx.ts",
    "components/atoms/button/unstyled-button.tsx",
    "components/atoms/separator/plain-separator.tsx",
  ])("%s never imports tailwind-merge", (file) => {
    const imports = runtimeImports(join(source, file));
    expect([...imports].filter((name) => !name.startsWith("/"))).not.toContain(
      "tailwind-merge",
    );
    expect(imports).not.toContain(join(source, "lib/utils.ts"));
  });

  it("detects tailwind-merge where a component uses cn (control)", () => {
    expect(
      runtimeImports(join(source, "components/atoms/separator/separator.tsx")),
    ).toContain("tailwind-merge");
  });
});
