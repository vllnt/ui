import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassCard } from "./glass-card";

describe("GlassCard", () => {
  it("renders its children", () => {
    render(<GlassCard>Content</GlassCard>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <GlassCard className="custom-class">Card</GlassCard>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
