import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MultiSelectLasso } from "./multi-select-lasso";

describe("MultiSelectLasso", () => {
  it.each([
    ["rect is null", null],
    ["the rect has zero area", { height: 0, width: 100, x: 0, y: 0 }],
  ])("renders nothing when %s", (_case, rect) => {
    const { container } = render(<MultiSelectLasso rect={rect} />);
    expect(container.firstChild).toBeNull();
  });

  it.each([
    [
      "positions the lasso from the rect coordinates",
      { height: 80, width: 120, x: 50, y: 30 },
      { height: "80px", left: "50px", top: "30px", width: "120px" },
    ],
    [
      "normalizes a negative-direction drag",
      { height: -40, width: -60, x: 100, y: 80 },
      { height: "40px", left: "40px", top: "40px", width: "60px" },
    ],
  ])("%s", (_case, rect, style) => {
    const { container } = render(<MultiSelectLasso rect={rect} />);
    expect(container.querySelector("[data-multi-select-lasso]")).toHaveStyle(
      style,
    );
  });

  it.each([
    [3, "3 items"],
    [1, "1 item"],
  ])("renders the count badge for %i as %s", (count, text) => {
    render(
      <MultiSelectLasso
        count={count}
        rect={{ height: 60, width: 80, x: 0, y: 0 }}
      />,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
