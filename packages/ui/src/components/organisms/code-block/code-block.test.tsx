import { render, waitFor } from "@testing-library/react";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CodeBlock } from "./code-block";

const harness = vi.hoisted(() => ({
  packageRootLoaded: vi.fn(),
  theme: "dark",
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ systemTheme: "dark", theme: harness.theme }),
}));

vi.mock("react-syntax-highlighter", async (importOriginal) => {
  harness.packageRootLoaded();
  return importOriginal();
});

function colorOf(style: React.CSSProperties | undefined): string {
  const probe = document.createElement("span");
  probe.style.color = String(style?.color ?? "");
  return probe.style.color;
}

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
  beforeEach(() => {
    harness.theme = "dark";
  });

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

  it(
    "applies the One Dark theme in dark mode",
    async () => {
      const keyword = await renderHighlightedKeyword();
      expect(keyword.style.color).toBe(colorOf(oneDark.keyword));
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "applies the One Light theme in light mode",
    async () => {
      harness.theme = "light";
      const keyword = await renderHighlightedKeyword();
      expect(keyword.style.color).toBe(colorOf(oneLight.keyword));
      expect(keyword.style.color).not.toBe(colorOf(oneDark.keyword));
    },
    TEST_TIMEOUT_MS,
  );
});
