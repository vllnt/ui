import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GlassCard } from "./glass-card";

it("GlassCard renders its children and applies a custom class name", () => {
  const { container } = render(
    <GlassCard className="custom-class">Content</GlassCard>,
  );
  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom-class");
});
