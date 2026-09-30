import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GlassPanel } from "./glass-panel";

it("GlassPanel renders children, merges className, and forwards div props", () => {
  const { container } = render(
    <GlassPanel className="custom" data-testid="glass">
      <span>frosted</span>
    </GlassPanel>,
  );
  expect(screen.getByText("frosted")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom");
  expect(container.querySelector("[data-testid='glass']")).toBeInTheDocument();
});
