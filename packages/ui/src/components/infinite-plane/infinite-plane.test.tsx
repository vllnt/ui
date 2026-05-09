import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfinitePlane } from "./infinite-plane";

describe("InfinitePlane", () => {
  it("renders the children inside the plane", () => {
    render(
      <InfinitePlane>
        <p>spatial child</p>
      </InfinitePlane>,
    );

    expect(screen.getByText("spatial child")).toBeInTheDocument();
  });

  it("propagates the pattern to a data attribute", () => {
    const { container } = render(<InfinitePlane pattern="grid" />);

    expect(container.querySelector("[data-infinite-plane]")).toHaveAttribute(
      "data-infinite-plane-pattern",
      "grid",
    );
  });

  it("emits no background image when pattern is blank", () => {
    const { container } = render(<InfinitePlane pattern="blank" />);

    const plane = container.querySelector("[data-infinite-plane]");
    expect(plane?.getAttribute("style") ?? "").not.toContain(
      "background-image",
    );
  });

  it("scales the pattern by zoom", () => {
    const { container } = render(<InfinitePlane spacing={50} zoom={2} />);

    expect(container.querySelector("[data-infinite-plane]")).toHaveStyle({
      "background-size": "100px 100px",
    });
  });

  it("clamps an out-of-range zoom", () => {
    const { container } = render(<InfinitePlane spacing={32} zoom={50} />);

    expect(container.querySelector("[data-infinite-plane]")).toHaveStyle({
      "background-size": "320px 320px",
    });
  });

  it("uses the translate as the background-position", () => {
    const { container } = render(
      <InfinitePlane translate={{ x: 40, y: -20 }} />,
    );

    expect(container.querySelector("[data-infinite-plane]")).toHaveStyle({
      "background-position": "40px -20px",
    });
  });
});
