import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BorderBeam } from "./border-beam";

describe("BorderBeam", () => {
  it("renders with accessibility hidden", () => {
    const { container } = render(<BorderBeam />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("applies a custom class name", () => {
    const { container } = render(<BorderBeam className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("uses the provided border width", () => {
    const { container } = render(<BorderBeam borderWidth={3} />);

    expect(container.firstChild).toHaveStyle({ padding: "3px" });
  });
});
