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
  it("removes single-line comments", () => {
    expect(stripNonCode("// useTheme()")).not.toMatch(/useTheme/);
  });

  it("removes block comments (JSDoc)", () => {
    expect(stripNonCode("/** @uses useTheme() */")).not.toMatch(/useTheme/);
  });

  it("removes double-quoted string literals", () => {
    expect(stripNonCode('"useTheme()"')).not.toMatch(/useTheme/);
  });

  it("removes single-quoted string literals", () => {
    expect(stripNonCode("'useTheme()'")).not.toMatch(/useTheme/);
  });

  it("removes template literals", () => {
    expect(stripNonCode("`call useTheme() here`")).not.toMatch(/useTheme/);
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
    it("detects useState", () => {
      expect(
        fileUsesHooks(`
"use client";
import { useState } from 'react';
export function Comp() { const [x] = useState(0); return null; }
`),
      ).toBe(true);
    });

    it("detects useRef", () => {
      expect(fileUsesHooks("const r = useRef(null)")).toBe(true);
    });

    it("detects custom hook call useTheme()", () => {
      expect(
        fileUsesHooks(`
"use client";
export function Comp() { const t = useTheme(); return null; }
`),
      ).toBe(true);
    });

    it("detects usePathname from next/navigation", () => {
      expect(
        fileUsesHooks(`
"use client";
import { usePathname } from 'next/navigation';
export function Nav() { const p = usePathname(); return null; }
`),
      ).toBe(true);
    });

    it("detects useHorizontalScroll custom hook call", () => {
      expect(
        fileUsesHooks(`
"use client";
const { ref } = useHorizontalScroll();
`),
      ).toBe(true);
    });

    it("detects hook call in a one-liner hook variable definition (const useX = useY(...))", () => {
      expect(fileUsesHooks("const useData = useQuery(someArg)")).toBe(true);
    });

    it("detects a real hook call after a multiline implicit-return custom hook arrow definition", () => {
      expect(
        fileUsesHooks(`
const useFoo = () =>
  useBar()
export function Comp() {
  const [x] = useState(0)
  return null
}
`),
      ).toBe(true);
    });

    it("detects a real hook call after a one-line custom hook arrow definition", () => {
      expect(
        fileUsesHooks(`
const useFoo = () => useBar()
export function Comp() {
  const [x] = useState(0)
  return null
}
`),
      ).toBe(true);
    });

    it("detects a real hook call after a multiline hook definition whose body opens and closes on one line", () => {
      expect(
        fileUsesHooks(`
export function useCounter(
  initialValue: number,
) { return useMemo(() => initialValue, [initialValue]) }
export function Comp() {
  const [count] = useState(0)
  return count
}
`),
      ).toBe(true);
    });

    it("detects generic hook calls", () => {
      expect(fileUsesHooks("const [count] = useState<number>(0)")).toBe(true);
    });

    it("detects namespaced generic hook calls", () => {
      expect(
        fileUsesHooks("const ref = React.useRef<HTMLDivElement>(null)"),
      ).toBe(true);
    });

    it("detects hook calls with nested generic type arguments", () => {
      expect(
        fileUsesHooks(
          "const [checked, setChecked] = useState<Set<string>>(() => new Set())",
        ),
      ).toBe(true);
    });

    it("detects namespaced hook calls with nested generic type arguments", () => {
      expect(
        fileUsesHooks(
          "const selectionColumn = React.useMemo<ColumnDef<TData>>(() => ({}))",
        ),
      ).toBe(true);
    });

    it("detects hook calls with nested generic type arguments containing multiple type params", () => {
      expect(fileUsesHooks("const m = useState<Map<string, number>>(0)")).toBe(
        true,
      );
    });

    it("detects hook calls with function-type generic arguments", () => {
      expect(
        fileUsesHooks("const [value] = useState<(() => void) | null>(null)"),
      ).toBe(true);
    });

    it("detects multiline hook calls with function-type generic arguments", () => {
      expect(
        fileUsesHooks(
          "const [value] = useState<\n  (() => void) | null\n>(null)",
        ),
      ).toBe(true);
    });

    it("detects a hook call inside a template literal expression", () => {
      expect(fileUsesHooks("const label = `count: ${useState(0)}`")).toBe(true);
    });

    it("detects multiline generic hook calls (slideshow.tsx shape)", () => {
      expect(
        fileUsesHooks(
          'const [animationDirection, setAnimationDirection] = useState<\n  "left" | "right" | null\n>(null);',
        ),
      ).toBe(true);
    });

    it("detects multiline namespaced generic hook calls", () => {
      expect(
        fileUsesHooks(
          "const ref = React.useRef<\n  HTMLDivElement | null\n>(null);",
        ),
      ).toBe(true);
    });
  });

  describe("false positives — must NOT be flagged", () => {
    it("ignores hook function definition: export function useFoo(", () => {
      expect(
        fileUsesHooks(`
export function useFormatter(value: number) {
  return value.toFixed(2);
}
`),
      ).toBe(false);
    });

    it("ignores hook const arrow definition: const useFoo = (", () => {
      expect(
        fileUsesHooks(`
const useLocalStore = () => {
  return {};
};
`),
      ).toBe(false);
    });

    it("ignores multi-line function hook definition body calling useState", () => {
      expect(
        fileUsesHooks(`
export function useCounter() {
  const [count] = useState(0);
  return { count };
}
`),
      ).toBe(false);
    });

    it("ignores hook definitions whose opening brace appears on a later line", () => {
      expect(
        fileUsesHooks(`
export function useCounter(
  initialValue: number,
  step = 1,
)
{
  const [count] = useState(initialValue);
  return { count, step };
}
`),
      ).toBe(false);
    });

    it("ignores arrow hook definition body calling useMemo and useRef", () => {
      expect(
        fileUsesHooks(`
const useLayout = () => {
  const val = useMemo(() => 0, []);
  const ref = useRef(null);
  return { val, ref };
};
`),
      ).toBe(false);
    });

    it("ignores typed arrow hook definitions with an explicit return type", () => {
      expect(
        fileUsesHooks(`
const useCounter = (): { count: number } => {
  const [count] = useState(0)
  return { count }
}
`),
      ).toBe(false);
    });

    it("ignores typed hook variable definitions assigned to arrow functions", () => {
      expect(
        fileUsesHooks(`
const useCounter: UseCounter = () => {
  const [count] = useState(0)
  return { count }
}
`),
      ).toBe(false);
    });

    it("ignores generic arrow hook definitions: const useFoo = <T,>(value: T) => { ... }", () => {
      expect(
        fileUsesHooks(
          "const useFoo = <T,>(value: T) => { const [count] = useState(0); return { value, count }; }",
        ),
      ).toBe(false);
    });

    it("ignores hook definitions whose assignment and arrow body start on separate lines", () => {
      expect(
        fileUsesHooks(`
const useFoo =
  () => {
    const [count] = useState(0)
    return count
  }
`),
      ).toBe(false);
    });

    it("ignores multiline implicit-return hook definitions with ternary bodies", () => {
      expect(
        fileUsesHooks(`
const useFoo = () =>
  cond
    ? useBar()
    : useBaz()
`),
      ).toBe(false);
    });

    it("ignores hook name in single-line comment", () => {
      expect(fileUsesHooks("// call useTheme() to get the theme")).toBe(false);
    });

    it("ignores hook name in block comment", () => {
      expect(fileUsesHooks("/* useTheme() is called internally */")).toBe(
        false,
      );
    });

    it("ignores hook name in JSDoc", () => {
      expect(
        fileUsesHooks(`
/**
 * @example useTheme()
 */
export function Comp() { return null; }
`),
      ).toBe(false);
    });

    it("ignores hook name in double-quoted string", () => {
      expect(fileUsesHooks('const label = "useTheme()"')).toBe(false);
    });

    it("ignores hook name in single-quoted string", () => {
      expect(fileUsesHooks("const label = 'useTheme()'")).toBe(false);
    });

    it("ignores hook name in template literal", () => {
      expect(fileUsesHooks("const msg = `call useTheme() for theming`")).toBe(
        false,
      );
    });

    it("returns false for a file with no hooks at all", () => {
      expect(
        fileUsesHooks(`
import { cn } from '../../lib/utils';
export function Badge({ className }: { className?: string }) {
  return <span className={cn('badge', className)} />;
}
`),
      ).toBe(false);
    });
  });
});

describe("hasUseClientDirective", () => {
  describe("true positives — directive present", () => {
    it("detects single-quoted directive as first line", () => {
      expect(
        hasUseClientDirective("'use client';\nimport React from 'react'"),
      ).toBe(true);
    });

    it("detects double-quoted directive as first line", () => {
      expect(
        hasUseClientDirective('"use client";\nimport React from "react"'),
      ).toBe(true);
    });

    it("detects directive after a leading blank line", () => {
      expect(
        hasUseClientDirective("\n'use client';\nimport React from 'react'"),
      ).toBe(true);
    });

    it("detects directive after a single-line comment", () => {
      expect(
        hasUseClientDirective(
          "// @license MIT\n'use client';\nimport React from 'react'",
        ),
      ).toBe(true);
    });

    it("detects directive after a multi-line block comment", () => {
      expect(
        hasUseClientDirective(
          "/**\n * Module header.\n */\n'use client';\nimport React from 'react'",
        ),
      ).toBe(true);
    });

    it("detects directive after a block comment whose body lines have no leading *", () => {
      expect(
        hasUseClientDirective(
          "/*\ngeneric non-starred comment body\n*/\n'use client';\nimport React from 'react'",
        ),
      ).toBe(true);
    });

    it("detects directive without trailing semicolon", () => {
      expect(
        hasUseClientDirective("'use client'\nimport React from 'react'"),
      ).toBe(true);
    });

    it("detects directive with a trailing inline comment", () => {
      expect(
        hasUseClientDirective(
          '"use client"; // required for hook usage\nimport React from "react"',
        ),
      ).toBe(true);
    });

    it("detects directive after a same-line block comment", () => {
      expect(
        hasUseClientDirective(
          '/* header */ "use client";\nimport React from "react"',
        ),
      ).toBe(true);
    });
  });

  describe("false positives — directive absent or misplaced", () => {
    it("returns false when no directive is present", () => {
      expect(
        hasUseClientDirective(
          "import { useState } from 'react';\nexport function Comp() { return null; }",
        ),
      ).toBe(false);
    });

    it("returns false when directive appears after an import", () => {
      expect(
        hasUseClientDirective(
          "import { useState } from 'react';\n'use client';",
        ),
      ).toBe(false);
    });

    it("returns false for an empty file", () => {
      expect(hasUseClientDirective("")).toBe(false);
    });

    it("returns false for a file with only comments", () => {
      expect(hasUseClientDirective("// just a comment\n/* another */")).toBe(
        false,
      );
    });
  });
});

describe("client directives", () => {
  it("marks hook-based shipped components as client components", () => {
    const missingDirectiveFiles = listTypeScriptFiles(COMPONENTS_ROOT)
      .filter((filePath) =>
        SKIPPED_SUFFIXES.every((suffix) => !filePath.endsWith(suffix)),
      )
      .filter((filePath) => {
        const source = readFileSync(filePath, "utf8");
        return fileUsesHooks(source) && !hasUseClientDirective(source);
      })
      .map((filePath) =>
        filePath.replace(`${COMPONENTS_ROOT}/`, "components/"),
      );

    expect(missingDirectiveFiles).toEqual([]);
  });
});
