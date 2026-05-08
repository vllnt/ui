import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveCursor } from "./live-cursor";

describe("LiveCursor", () => {
  it("positions absolutely from x/y props", () => {
    const { container } = render(<LiveCursor color="blue" x={120} y={80} />);

    const cursor = container.querySelector("[data-cursor-color]");
    expect(cursor).toHaveAttribute("data-cursor-color", "blue");
    expect(cursor).toHaveStyle({ left: "120px", top: "80px" });
  });

  it("renders the label chip when label is set", () => {
    render(<LiveCursor label="Sam" x={0} y={0} />);

    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("omits the label chip when label is not set", () => {
    const { container } = render(<LiveCursor x={0} y={0} />);

    expect(container.querySelector("span")).toBeNull();
  });

  it("emits the configured color theme via data-cursor-color", () => {
    const { container } = render(<LiveCursor color="emerald" x={0} y={0} />);

    expect(container.querySelector("[data-cursor-color]")).toHaveAttribute(
      "data-cursor-color",
      "emerald",
    );
  });
});
