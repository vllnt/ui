import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Pagination className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
