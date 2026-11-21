import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertNoDynamicRelativeImports,
  findDynamicRelativeImports,
} from "./dynamic-relative-imports";

const componentsRoot = join(
  __dirname,
  "../../../packages/ui/src/components/organisms",
);
const readComponent = (name: string): string =>
  readFileSync(join(componentsRoot, name, `${name}.tsx`), "utf8");

// The lazy loader CodeBlock had before the language set moved to package
// specifiers: the shim rewrote this path to import("@vllnt/ui"), which has no
// CodeHighlighter export.
const OLD_CODE_BLOCK_LOADER = `
  useEffect(() => {
    let active = true;
    void import("../../../lib/code-highlighter")
      .then(({ CodeHighlighter }) => {
        if (!active) return;
        setHighlighter({ SyntaxHighlighter: CodeHighlighter });
      })
      .catch(keepPlainText);
  }, []);
`;

describe("findDynamicRelativeImports", () => {
  it("finds relative specifiers in every quote style and across lines", () => {
    const source = [
      'const a = import("./local");',
      "const b = import('../up');",
      "const c = import(`../../deep/path`);",
      'const d = import(\n  "../../../lib/helper"\n);',
    ].join("\n");
    expect(findDynamicRelativeImports(source)).toEqual([
      "./local",
      "../up",
      "../../deep/path",
      "../../../lib/helper",
    ]);
  });

  it("ignores package specifiers, static imports and computed paths", () => {
    const source = [
      'import { a } from "../static";',
      'const b = import("react-syntax-highlighter/dist/esm/prism-light");',
      'const c = import("@mdx-js/mdx");',
      "const d = import(computedPath);",
    ].join("\n");
    expect(findDynamicRelativeImports(source)).toEqual([]);
  });
});

const CODE_BLOCK_FILE =
  "packages/ui/src/components/organisms/code-block/code-block.tsx";

const checking =
  (source: string, allowed?: ReadonlySet<string>) => (): void => {
    assertNoDynamicRelativeImports(source, CODE_BLOCK_FILE, allowed);
  };

describe("assertNoDynamicRelativeImports", () => {
  it("rejects the old CodeBlock loader with a message that names the file and the fix", () => {
    expect(checking(OLD_CODE_BLOCK_LOADER)).toThrow(
      `dynamic relative import in ${CODE_BLOCK_FILE}: ` +
        "shims rewrite it to @vllnt/ui; import a package specifier instead",
    );
  });

  it("names every offending specifier", () => {
    expect(checking('import("./a"); import("../b");')).toThrow(
      "(found: ./a, ../b)",
    );
  });

  it("accepts a specifier on the allow list and rejects the others", () => {
    const allowed = new Set(["../flow-diagram"]);
    expect(
      checking('import("../flow-diagram"); import("../other");', allowed),
    ).toThrow("(found: ../other)");
    expect(checking('import("../flow-diagram");', allowed)).not.toThrow();
  });

  it("accepts the current CodeBlock source", () => {
    expect(checking(readComponent("code-block"))).not.toThrow();
  });

  it("still sees the one relative import TutorialMDX allows", () => {
    expect(findDynamicRelativeImports(readComponent("tutorial-mdx"))).toEqual([
      "../flow-diagram",
    ]);
  });
});
