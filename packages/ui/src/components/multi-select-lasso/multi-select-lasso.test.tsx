import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MultiSelectLasso } from "./multi-select-lasso";

describe("MultiSelectLasso", () => {
  it("renders nothing when rect is null", () => {
    const { container } = render(<MultiSelectLasso rect={null} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the rect has zero area", () => {
    const { container } = render(
      <MultiSelectLasso rect={{ height: 0, width: 100, x: 0, y: 0 }} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("positions the lasso from the rect coordinates", () => {
    const { container } = render(
      <MultiSelectLasso rect={{ height: 80, width: 120, x: 50, y: 30 }} />,
    );

    const lasso = container.querySelector("[data-multi-select-lasso]");
    expect(lasso).toHaveStyle({
      height: "80px",
      left: "50px",
      top: "30px",
      width: "120px",
    });
  });

  it("normalizes a negative-direction drag", () => {
    const { container } = render(
      <MultiSelectLasso rect={{ height: -40, width: -60, x: 100, y: 80 }} />,
    );

    const lasso = container.querySelector("[data-multi-select-lasso]");
    expect(lasso).toHaveStyle({
      height: "40px",
      left: "40px",
      top: "40px",
      width: "60px",
    });
  });

  it("renders the count badge with pluralization", () => {
    render(
      <MultiSelectLasso
        count={3}
        rect={{ height: 60, width: 80, x: 0, y: 0 }}
      />,
    );

    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("uses the singular noun when count is 1", () => {
    render(
      <MultiSelectLasso
        count={1}
        rect={{ height: 60, width: 80, x: 0, y: 0 }}
      />,
    );

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });
});
