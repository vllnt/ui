import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodeHighlighter } from "./code-highlighter";

function renderCode(language: string, code: string): HTMLElement {
  const { container } = render(
    <CodeHighlighter language={language}>{code}</CodeHighlighter>,
  );
  return container;
}

function tokenCount(container: HTMLElement): number {
  return container.querySelectorAll("code .token").length;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CodeHighlighter registered languages", () => {
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
  ])("highlights %s with token spans", (language, code) => {
    const container = renderCode(language, code);
    expect(tokenCount(container)).toBeGreaterThan(0);
    expect(container.querySelector("code")?.textContent).toBe(code);
  });

  it.each([
    ["ts", "typescript", "const answer: number = 42;"],
    ["js", "javascript", "const answer = 42;"],
    ["sh", "bash", 'echo "hello" | grep h'],
    ["shell", "bash", 'echo "hello" | grep h'],
    ["zsh", "bash", 'echo "hello" | grep h'],
    ["md", "markdown", "# Title\n\n**bold** text"],
    ["yml", "yaml", "answer: 42"],
    ["py", "python", "def answer():\n    return 42"],
    ["html", "markup", '<div class="a">text</div>'],
    ["xml", "markup", "<answer>42</answer>"],
  ])("highlights the %s alias like %s", (alias, language, code) => {
    const aliased = renderCode(alias, code);
    const canonical = renderCode(language, code);
    expect(tokenCount(aliased)).toBeGreaterThan(0);
    expect(tokenCount(aliased)).toBe(tokenCount(canonical));
  });
});

describe("CodeHighlighter other languages", () => {
  it.each(["text", "not-a-language", "rust", ""])(
    "renders %j as plain text without errors or warnings",
    (language) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => null);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => null);
      const code = 'fn main() {\n    println!("hi");\n}';

      const container = renderCode(language, code);

      expect(container.querySelector("code")?.textContent).toBe(code);
      expect(tokenCount(container)).toBe(0);
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    },
  );
});
