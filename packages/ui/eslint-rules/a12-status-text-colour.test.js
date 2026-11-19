import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { react } from "@vllnt/eslint-config";
import { Linter, RuleTester } from "eslint";
import { describe, expect, it } from "vitest";

import a12Allowlist from "./a12-allowlist.js";
import rule, { findStatusTextClasses } from "./a12-status-text-colour.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tsParser = react.find((entry) => entry.languageOptions?.parser)
  ?.languageOptions.parser;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run("a12-no-status-text-colour", rule, {
  invalid: [
    {
      code: `const A = () => <p className="text-sm text-destructive">Failed</p>;`,
      errors: [{ messageId: "statusOnWords" }],
    },
    {
      code: `const v = cva("p-4", { variants: { tone: { ok: "text-success", warn: "text-warning" } } });`,
      errors: [{ messageId: "statusOnWords" }, { messageId: "statusOnWords" }],
    },
    {
      code: `const A = () => <p className={cn("x", on && "dark:text-red-400")}>Hi</p>;`,
      errors: [{ messageId: "statusOnWords" }],
    },
    {
      code: "const c = `flex ${gap} text-info/80`;",
      errors: [{ messageId: "statusOnWords" }],
    },
    {
      code: `const A = () => <p className="[&>p]:text-amber-600">Hi</p>;`,
      errors: [{ messageId: "statusOnWords" }],
    },
  ],
  valid: [
    { code: `const A = () => <p className="text-foreground">Ok</p>;` },
    { code: `const A = () => <p className="text-muted-foreground">Ok</p>;` },
    {
      // The text colour on top of a status fill is not a status colour on words.
      code: `const A = () => <b className="bg-destructive text-destructive-foreground">Ok</b>;`,
    },
    {
      // A border and a fill carry status colour.
      code: `const A = () => <i className="border-destructive/50 bg-success/10" />;`,
    },
    {
      // A variant that targets the glyph.
      code: `const v = cva("relative [&>svg]:text-destructive [&_svg:not(.x)]:text-info");`,
    },
    {
      // A glyph that screen readers skip.
      code: `const A = () => <AlertIcon aria-hidden="true" className="size-4 text-destructive" />;`,
    },
    { code: `const A = () => <p className="text-primary text-purple-500">Ok</p>;` },
  ],
});

describe("findStatusTextClasses", () => {
  it("returns the offending classes with their variants", () => {
    expect(
      findStatusTextClasses(
        "flex text-destructive hover:text-red-700 data-[state=on]:text-success",
      ),
    ).toEqual([
      "text-destructive",
      "hover:text-red-700",
      "data-[state=on]:text-success",
    ]);
  });

  it("ignores foreground roles, glyph variants and other utilities", () => {
    expect(
      findStatusTextClasses(
        "text-destructive-foreground [&>svg]:text-destructive bg-warning border-info text-sm",
      ),
    ).toEqual([]);
  });
});

describe("A12 allowlist", () => {
  const linter = new Linter();
  const config = {
    files: ["**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { vllnt: { rules: { "a12-no-status-text-colour": rule } } },
    rules: { "vllnt/a12-no-status-text-colour": "error" },
  };

  it("lists only files that still have a status text colour", () => {
    const stale = a12Allowlist.filter((file) => {
      const path = resolve(packageRoot, file);
      if (!existsSync(path)) {
        return true;
      }
      const messages = linter.verify(readFileSync(path, "utf8"), config, {
        filename: file,
      });
      return messages.length === 0;
    });
    expect(
      stale,
      "These files no longer break A12 (or are gone). Remove them from eslint-rules/a12-allowlist.js.",
    ).toEqual([]);
  });
});
