import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressiveBlur } from "./progressive-blur";

describe("ProgressiveBlur", () => {
  it("renders the blur stack", () => {
    const { container } = render(<ProgressiveBlur />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<ProgressiveBlur className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested layer count", () => {
    const { container } = render(<ProgressiveBlur layers={3} />);

    expect(container.querySelectorAll(":scope > div > div")).toHaveLength(3);
  });
});
