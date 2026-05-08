import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SelectionPresence } from "./selection-presence";

describe("SelectionPresence", () => {
  it("positions and sizes the rectangle from props", () => {
    const { container } = render(
      <SelectionPresence height={80} width={120} x={50} y={30} />,
    );

    const overlay = container.querySelector("[data-selection-presence]");
    expect(overlay).toHaveStyle({
      height: "80px",
      left: "50px",
      top: "30px",
      width: "120px",
    });
  });

  it("applies the accent color to the border", () => {
    const { container } = render(
      <SelectionPresence color="#5b8def" height={80} width={120} x={0} y={0} />,
    );

    expect(container.querySelector("[data-selection-presence]")).toHaveStyle({
      "border-color": "#5b8def",
    });
  });

  it("renders the name chip when name is provided", () => {
    render(
      <SelectionPresence height={80} name="Bea" width={120} x={0} y={0} />,
    );

    expect(screen.getByText("Bea")).toBeInTheDocument();
  });

  it("hides the chip when name is null", () => {
    const { container } = render(
      <SelectionPresence height={80} name={null} width={120} x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-selection-presence-chip]"),
    ).not.toBeInTheDocument();
  });

  it("includes the user name in the aria-label", () => {
    render(
      <SelectionPresence height={80} name="Bea" width={120} x={0} y={0} />,
    );

    expect(
      screen.getByLabelText("Selection presence: Bea"),
    ).toBeInTheDocument();
  });
});
