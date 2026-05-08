import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassPanel } from "./glass-panel";

describe("GlassPanel", () => {
  it("renders children", () => {
    const { getByText } = render(
      <GlassPanel>
        <span>frosted</span>
      </GlassPanel>,
    );

    expect(getByText("frosted")).toBeInTheDocument();
  });

  it("merges the className prop", () => {
    const { container } = render(
      <GlassPanel className="custom">
        <span>x</span>
      </GlassPanel>,
    );

    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards arbitrary div props", () => {
    const { container } = render(
      <GlassPanel data-testid="glass">
        <span>x</span>
      </GlassPanel>,
    );

    expect(
      container.querySelector("[data-testid='glass']"),
    ).toBeInTheDocument();
  });
});
