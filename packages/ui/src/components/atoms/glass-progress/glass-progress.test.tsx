import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GlassProgress } from "./glass-progress";

it("GlassProgress clamps the progressbar value and applies a custom class name", () => {
  const { container } = render(
    <GlassProgress className="custom-class" value={150} />,
  );
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  expect(container.firstChild).toHaveClass("custom-class");
});

it("GlassProgress has a default accessible name that consumers can override", () => {
  const { rerender } = render(<GlassProgress value={40} />);
  expect(
    screen.getByRole("progressbar", { name: "Progress" }),
  ).toBeInTheDocument();
  rerender(<GlassProgress aria-label="Upload" value={40} />);
  expect(
    screen.getByRole("progressbar", { name: "Upload" }),
  ).toBeInTheDocument();
});
