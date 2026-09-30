import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<ProgressBar className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
