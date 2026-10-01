import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CodeBlock } from "./code-block";

const harness = vi.hoisted(() => ({
  packageRootLoaded: vi.fn(),
}));

vi.mock("react-syntax-highlighter", async (importOriginal) => {
  harness.packageRootLoaded();
  return importOriginal();
});

const HIGHLIGHTER_LOAD_MS = 15_000;
const TEST_TIMEOUT_MS = 20_000;

async function renderHighlightedKeyword(): Promise<HTMLElement> {
  const { container } = render(<CodeBlock>const answer = 42;</CodeBlock>);
  return waitFor(
    () => {
      const keyword = container.querySelector<HTMLElement>("code .token");
      expect(keyword?.textContent).toBe("const");
      return keyword ?? container;
    },
    { timeout: HIGHLIGHTER_LOAD_MS },
  );
}

describe("CodeBlock", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<CodeBlock className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows the raw code in the fallback before the highlighter loads", () => {
    const { container } = render(<CodeBlock>const answer = 42;</CodeBlock>);
    expect(container.textContent).toContain("const answer = 42;");
  });

  it(
    "highlights with the Prism build and never loads the package root",
    async () => {
      await renderHighlightedKeyword();
      expect(harness.packageRootLoaded).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT_MS,
  );
});

describe("CodeBlock syntax colours", () => {
  it(
    "colours tokens from theme-aware CSS variables instead of a JS-detected theme",
    async () => {
      const keyword = await renderHighlightedKeyword();
      expect(keyword.getAttribute("style")).toContain("--vllnt-code-keyword");
    },
    TEST_TIMEOUT_MS,
  );
});
