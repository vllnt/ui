import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodeBlock } from "./code-block";

const LANGUAGE_MODULE =
  /react-syntax-highlighter\/dist\/esm\/languages\/prism\/([a-z]+)["']/g;
const REGISTRATION = /registerLanguage\(\s*"([a-z]+)"\s*,\s*([a-z]+)\b/g;
const ALIAS = /\.alias\(\s*"([a-z]+)"\s*,\s*"([a-z]+)"\s*\)/g;

const HIGHLIGHTER_LOAD_MS = 15_000;
const TEST_TIMEOUT_MS = 20_000;

function readLanguageSet(path: string) {
  const source = readFileSync(path, "utf8");
  return {
    aliases: [...source.matchAll(ALIAS)].map(
      ([, language, alias]) => `${alias} -> ${language}`,
    ),
    modules: [...source.matchAll(LANGUAGE_MODULE)]
      .map(([, name]) => name)
      .sort(),
    registrations: [...source.matchAll(REGISTRATION)]
      .map(([, name, binding]) => `${name} <- ${binding}`)
      .sort(),
  };
}

const codeBlockLanguages = readLanguageSet(join(__dirname, "code-block.tsx"));
const sharedLanguages = readLanguageSet(
  join(__dirname, "../../../lib/code-highlighter.ts"),
);

afterEach(() => {
  vi.restoreAllMocks();
});

// The registry shim of CodeBlock cannot import lib/code-highlighter, because
// the shim rewrite maps that path to @vllnt/ui. Two literal lists stay equal
// through this test.
describe("CodeBlock language set", () => {
  it("lists the same languages as lib/code-highlighter", () => {
    expect(codeBlockLanguages.modules).toHaveLength(13);
    expect(codeBlockLanguages).toEqual(sharedLanguages);
  });

  it("registers every language under the name of the grammar it imports", () => {
    expect(codeBlockLanguages.registrations).toEqual(
      codeBlockLanguages.modules.map((name) => `${name} <- ${name}`),
    );
  });

  it("imports nothing by a relative path", () => {
    const source = readFileSync(join(__dirname, "code-block.tsx"), "utf8");
    expect(source).not.toMatch(/\bimport\(\s*["'`]\./);
  });
});

async function renderLoaded(
  language: string,
  code: string,
): Promise<HTMLElement> {
  const { container } = render(
    <CodeBlock language={language}>{code}</CodeBlock>,
  );
  await waitFor(
    () => {
      expect(container.querySelector("code .token")).not.toBeNull();
    },
    { timeout: HIGHLIGHTER_LOAD_MS },
  );
  return container;
}

describe("CodeBlock highlighting", () => {
  it.each([
    ["tsx", "const answer: number = 42;"],
    ["typescript", "const answer: number = 42;"],
    ["jsx", 'const element = <div className="a" />;'],
    ["javascript", "const answer = 42;"],
    ["json", '{ "answer": 42 }'],
    ["bash", 'echo "hello" | grep h'],
    ["css", "a { color: red; }"],
    ["markdown", "# Title\n\n**bold** text"],
    ["diff", "- removed\n+ added"],
    ["yaml", "answer: 42"],
    ["python", "def answer():\n    return 42"],
    ["markup", '<div class="a">text</div>'],
    ["sql", "SELECT * FROM answers;"],
    ["ts", "const answer: number = 42;"],
    ["js", "const answer = 42;"],
    ["sh", 'echo "hello" | grep h'],
    ["shell", 'echo "hello" | grep h'],
    ["zsh", 'echo "hello" | grep h'],
    ["md", "# Title\n\n**bold** text"],
    ["yml", "answer: 42"],
    ["py", "def answer():\n    return 42"],
    ["html", '<div class="a">text</div>'],
    ["xml", "<answer>42</answer>"],
  ])(
    "highlights %s with token spans",
    async (language, code) => {
      const container = await renderLoaded(language, code);
      expect(container.querySelector("code")?.textContent).toBe(code);
    },
    TEST_TIMEOUT_MS,
  );

  it.each(["text", "not-a-language", "rust"])(
    "renders %j as plain text without errors or warnings",
    async (language) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => null);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => null);
      const code = 'fn main() {\n    println!("hi");\n}';

      const { container } = render(
        <CodeBlock language={language}>{code}</CodeBlock>,
      );
      // Mounted after the plain block, so its tokens mean the chunk has loaded.
      await renderLoaded("typescript", "const answer = 42;");

      expect(container.querySelector("code")?.textContent).toBe(code);
      expect(container.querySelectorAll("code .token")).toHaveLength(0);
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT_MS,
  );
});
