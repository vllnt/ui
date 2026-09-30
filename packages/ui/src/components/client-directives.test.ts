import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  fileUsesHooks,
  hasUseClientDirective,
  stripNonCode,
} from "../../scripts/check-use-client";

const COMPONENTS_ROOT = join(__dirname);
const SKIPPED_SUFFIXES = [
  ".stories.tsx",
  ".test.tsx",
  ".visual.tsx",
  ".spec.tsx",
] as const;

function listTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listTypeScriptFiles(path);
    }

    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("stripNonCode", () => {
  it.each([
    ["removes single-line comments", "// useTheme()"],
    ["removes block comments (JSDoc)", "/** @uses useTheme() */"],
    ["removes double-quoted string literals", '"useTheme()"'],
    ["removes single-quoted string literals", "'useTheme()'"],
    ["removes template literals", "`call useTheme() here`"],
  ])("%s", (_name, source) => {
    expect(stripNonCode(source)).not.toMatch(/useTheme/);
  });

  it("preserves hook calls inside template literal expressions", () => {
    expect(stripNonCode("`prefix ${useState(0)} suffix`")).toMatch(
      /useState\(/,
    );
  });

  it("preserves actual hook call code", () => {
    expect(stripNonCode("const theme = useTheme()")).toMatch(/useTheme/);
  });

  it("preserves newline structure (does not collapse lines)", () => {
    const result = stripNonCode("a\n/* comment */\nb");
    expect(result.split("\n")).toHaveLength(3);
  });
});

describe("fileUsesHooks", () => {
  describe("true positives — hook calls that must be detected", () => {
    it.each([
      [
        "detects useState",
        `
"use client";
import { useState } from 'react';
export function Comp() { const [x] = useState(0); return null; }
`,
      ],
      ["detects useRef", "const r = useRef(null)"],
      [
        "detects custom hook call useTheme()",
        `
"use client";
export function Comp() { const t = useTheme(); return null; }
`,
      ],
      [
        "detects usePathname from next/navigation",
        `
"use client";
import { usePathname } from 'next/navigation';
export function Nav() { const p = usePathname(); return null; }
`,
      ],
      [
        "detects useHorizontalScroll custom hook call",
        `
"use client";
const { ref } = useHorizontalScroll();
`,
      ],
      [
        "detects hook call in a one-liner hook variable definition (const useX = useY(...))",
        "const useData = useQuery(someArg)",
      ],
      [
        "detects a real hook call after a multiline implicit-return custom hook arrow definition",
        `
const useFoo = () =>
  useBar()
export function Comp() {
  const [x] = useState(0)
  return null
}
`,
      ],
      [
        "detects a real hook call after a one-line custom hook arrow definition",
        `
const useFoo = () => useBar()
export function Comp() {
  const [x] = useState(0)
  return null
}
`,
      ],
      [
        "detects a real hook call after a multiline hook definition whose body opens and closes on one line",
        `
export function useCounter(
  initialValue: number,
) { return useMemo(() => initialValue, [initialValue]) }
export function Comp() {
  const [count] = useState(0)
  return count
}
`,
      ],
      ["detects generic hook calls", "const [count] = useState<number>(0)"],
      [
        "detects namespaced generic hook calls",
        "const ref = React.useRef<HTMLDivElement>(null)",
      ],
      [
        "detects hook calls with nested generic type arguments",
        "const [checked, setChecked] = useState<Set<string>>(() => new Set())",
      ],
      [
        "detects namespaced hook calls with nested generic type arguments",
        "const selectionColumn = React.useMemo<ColumnDef<TData>>(() => ({}))",
      ],
      [
        "detects hook calls with nested generic type arguments containing multiple type params",
        "const m = useState<Map<string, number>>(0)",
      ],
      [
        "detects hook calls with function-type generic arguments",
        "const [value] = useState<(() => void) | null>(null)",
      ],
      [
        "detects multiline hook calls with function-type generic arguments",
        "const [value] = useState<\n  (() => void) | null\n>(null)",
      ],
      [
        "detects a hook call inside a template literal expression",
        "const label = `count: ${useState(0)}`",
      ],
      [
        "detects multiline generic hook calls (slideshow.tsx shape)",
        'const [animationDirection, setAnimationDirection] = useState<\n  "left" | "right" | null\n>(null);',
      ],
      [
        "detects multiline namespaced generic hook calls",
        "const ref = React.useRef<\n  HTMLDivElement | null\n>(null);",
      ],
    ])("%s", (_name, source) => {
      expect(fileUsesHooks(source)).toBe(true);
    });
  });

  describe("false positives — must NOT be flagged", () => {
    it.each([
      [
        "ignores hook function definition: export function useFoo(",
        `
export function useFormatter(value: number) {
  return value.toFixed(2);
}
`,
      ],
      [
        "ignores hook const arrow definition: const useFoo = (",
        `
const useLocalStore = () => {
  return {};
};
`,
      ],
      [
        "ignores multi-line function hook definition body calling useState",
        `
export function useCounter() {
  const [count] = useState(0);
  return { count };
}
`,
      ],
      [
        "ignores hook definitions whose opening brace appears on a later line",
        `
export function useCounter(
  initialValue: number,
  step = 1,
)
{
  const [count] = useState(initialValue);
  return { count, step };
}
`,
      ],
      [
        "ignores arrow hook definition body calling useMemo and useRef",
        `
const useLayout = () => {
  const val = useMemo(() => 0, []);
  const ref = useRef(null);
  return { val, ref };
};
`,
      ],
      [
        "ignores typed arrow hook definitions with an explicit return type",
        `
const useCounter = (): { count: number } => {
  const [count] = useState(0)
  return { count }
}
`,
      ],
      [
        "ignores typed hook variable definitions assigned to arrow functions",
        `
const useCounter: UseCounter = () => {
  const [count] = useState(0)
  return { count }
}
`,
      ],
      [
        "ignores generic arrow hook definitions: const useFoo = <T,>(value: T) => { ... }",
        "const useFoo = <T,>(value: T) => { const [count] = useState(0); return { value, count }; }",
      ],
      [
        "ignores hook definitions whose assignment and arrow body start on separate lines",
        `
const useFoo =
  () => {
    const [count] = useState(0)
    return count
  }
`,
      ],
      [
        "ignores multiline implicit-return hook definitions with ternary bodies",
        `
const useFoo = () =>
  cond
    ? useBar()
    : useBaz()
`,
      ],
      [
        "ignores hook name in single-line comment",
        "// call useTheme() to get the theme",
      ],
      [
        "ignores hook name in block comment",
        "/* useTheme() is called internally */",
      ],
      [
        "ignores hook name in JSDoc",
        `
/**
 * @example useTheme()
 */
export function Comp() { return null; }
`,
      ],
      [
        "ignores hook name in double-quoted string",
        'const label = "useTheme()"',
      ],
      [
        "ignores hook name in single-quoted string",
        "const label = 'useTheme()'",
      ],
      [
        "ignores hook name in template literal",
        "const msg = `call useTheme() for theming`",
      ],
      [
        "returns false for a file with no hooks at all",
        `
import { cn } from '../../lib/utils';
export function Badge({ className }: { className?: string }) {
  return <span className={cn('badge', className)} />;
}
`,
      ],
    ])("%s", (_name, source) => {
      expect(fileUsesHooks(source)).toBe(false);
    });
  });
});

describe("hasUseClientDirective", () => {
  describe("true positives — directive present", () => {
    it.each([
      [
        "detects single-quoted directive as first line",
        "'use client';\nimport React from 'react'",
      ],
      [
        "detects double-quoted directive as first line",
        '"use client";\nimport React from "react"',
      ],
      [
        "detects directive after a leading blank line",
        "\n'use client';\nimport React from 'react'",
      ],
      [
        "detects directive after a single-line comment",
        "// @license MIT\n'use client';\nimport React from 'react'",
      ],
      [
        "detects directive after a multi-line block comment",
        "/**\n * Module header.\n */\n'use client';\nimport React from 'react'",
      ],
      [
        "detects directive after a block comment whose body lines have no leading *",
        "/*\ngeneric non-starred comment body\n*/\n'use client';\nimport React from 'react'",
      ],
      [
        "detects directive without trailing semicolon",
        "'use client'\nimport React from 'react'",
      ],
      [
        "detects directive with a trailing inline comment",
        '"use client"; // required for hook usage\nimport React from "react"',
      ],
      [
        "detects directive after a same-line block comment",
        '/* header */ "use client";\nimport React from "react"',
      ],
    ])("%s", (_name, source) => {
      expect(hasUseClientDirective(source)).toBe(true);
    });
  });

  describe("false positives — directive absent or misplaced", () => {
    it.each([
      [
        "returns false when no directive is present",
        "import { useState } from 'react';\nexport function Comp() { return null; }",
      ],
      [
        "returns false when directive appears after an import",
        "import { useState } from 'react';\n'use client';",
      ],
      ["returns false for an empty file", ""],
      [
        "returns false for a file with only comments",
        "// just a comment\n/* another */",
      ],
    ])("%s", (_name, source) => {
      expect(hasUseClientDirective(source)).toBe(false);
    });
  });
});

describe("client directives", () => {
  it("marks hook-based shipped components as client components", () => {
    const missingDirectiveFiles = listTypeScriptFiles(COMPONENTS_ROOT).reduce<
      string[]
    >((missingFiles, filePath) => {
      if (SKIPPED_SUFFIXES.some((suffix) => filePath.endsWith(suffix))) {
        return missingFiles;
      }

      const source = readFileSync(filePath, "utf8");
      if (fileUsesHooks(source) && !hasUseClientDirective(source)) {
        missingFiles.push(
          filePath.replace(`${COMPONENTS_ROOT}/`, "components/"),
        );
      }

      return missingFiles;
    }, []);

    expect(missingDirectiveFiles).toEqual([]);
  });
});
