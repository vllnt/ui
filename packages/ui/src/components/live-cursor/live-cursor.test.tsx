import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveCursor } from "./live-cursor";

describe("LiveCursor", () => {
  it("positions the cursor at the given coordinates", () => {
    const { container } = render(<LiveCursor x={120} y={80} />);

    expect(container.querySelector("[data-live-cursor]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
  });

  it("renders the name chip when name is provided", () => {
    render(<LiveCursor name="Bea" x={0} y={0} />);

    expect(screen.getByText("Bea")).toBeInTheDocument();
  });

  it("hides the chip when name is null", () => {
    const { container } = render(<LiveCursor name={null} x={0} y={0} />);

    expect(
      container.querySelector("[data-live-cursor-chip]"),
    ).not.toBeInTheDocument();
  });

  it("applies the color to the pointer and chip", () => {
    const { container } = render(
      <LiveCursor color="#5b8def" name="Bea" x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-live-cursor-pointer]"),
    ).toHaveAttribute("fill", "#5b8def");
    expect(container.querySelector("[data-live-cursor-chip]")).toHaveStyle({
      "background-color": "#5b8def",
    });
  });

  it("renders the optional status line", () => {
    render(<LiveCursor name="Bea" status="editing" x={0} y={0} />);

    expect(screen.getByText("editing")).toBeInTheDocument();
  });

  it("includes the user name in the aria-label", () => {
    render(<LiveCursor name="Bea" x={0} y={0} />);

    expect(screen.getByLabelText("Live cursor: Bea")).toBeInTheDocument();
  });
});
