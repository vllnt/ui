import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassProgress } from "./glass-progress";

describe("GlassProgress", () => {
  it("renders with the clamped value on the progressbar", () => {
    render(<GlassProgress value={150} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <GlassProgress className="custom-class" value={40} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
