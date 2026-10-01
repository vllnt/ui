import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collectPublicExports, importedNames } from "./public-exports";

const packageEntry = join(__dirname, "../../../packages/ui/src/index.ts");

describe("importedNames", () => {
  it("lists the imported bindings of static and type-only imports from a package", () => {
    const source = [
      'import { Button, cn as classNames } from "@vllnt/ui";',
      "import {",
      "  type ButtonProps,",
      "  moveRovingFocus,",
      '} from "@vllnt/ui";',
      'import { useState } from "react";',
    ].join("\n");
    expect(importedNames(source, "@vllnt/ui")).toEqual([
      "Button",
      "cn",
      "ButtonProps",
      "moveRovingFocus",
    ]);
  });
});

describe("collectPublicExports", () => {
  it("includes the lib helpers that generated shims import", () => {
    const exports = collectPublicExports(packageEntry);
    const required = [
      "cn",
      "moveRovingFocus",
      "useReturnFocus",
      "focusCalendarDay",
      "CHECKLIST_PROGRESS_EVENT",
      "parseChecklistStorageValue",
    ];
    expect(required.filter((name) => !exports.has(name))).toEqual([]);
  });
});
