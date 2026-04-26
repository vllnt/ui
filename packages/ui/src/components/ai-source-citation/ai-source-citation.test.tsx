import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AISourceCitation } from "./ai-source-citation";

describe("AISourceCitation", () => {
  it("renders citation content", () => {
    render(
      <AISourceCitation
        href="https://example.com/spec"
        snippet="The registry preview should match the Storybook examples for each component."
        source="Product spec"
        title="Registry preview requirements"
      />,
    );

    expect(screen.getByText("Registry preview requirements")).toBeVisible();
    expect(screen.getByText("Product spec")).toBeVisible();
    expect(screen.getByText(/Storybook examples/)).toBeVisible();
  });

  it("opens external links in a new tab by default", () => {
    render(
      <AISourceCitation
        href="https://example.com/spec"
        source="Docs"
        title="Open in new tab"
      />,
    );

    expect(
      screen.getByRole("link", { name: /open in new tab/i }),
    ).toHaveAttribute("target", "_blank");
  });

  it("applies a custom className", () => {
    const { container } = render(
      <AISourceCitation
        className="custom-class"
        href="https://example.com/spec"
        source="Docs"
        title="Styled citation"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
