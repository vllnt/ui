import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodeBlock } from "./code-block";

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
});

describe("CodeBlock syntax colours", () => {
  it("colours tokens from theme-aware CSS variables instead of a JS-detected theme", async () => {
    const { container } = render(
      <CodeBlock language="typescript">const total = 1;</CodeBlock>,
    );
    await waitFor(() => {
      expect(
        container.querySelector('[style*="--vllnt-code-keyword"]'),
      ).toHaveTextContent("const");
    });
  });
});
