import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { InfinitePlane } from "./infinite-plane";

function plane(element: ReactElement) {
  return render(element).container.querySelector("[data-infinite-plane]");
}

describe("InfinitePlane", () => {
  it("renders the children and propagates the pattern to a data attribute", () => {
    const node = plane(
      <InfinitePlane pattern="grid">
        <p>spatial child</p>
      </InfinitePlane>,
    );
    expect(screen.getByText("spatial child")).toBeInTheDocument();
    expect(node).toHaveAttribute("data-infinite-plane-pattern", "grid");
  });

  it("emits no background image when pattern is blank", () => {
    const node = plane(<InfinitePlane pattern="blank" />);
    expect(node?.getAttribute("style") ?? "").not.toContain("background-image");
  });

  it.each([
    [
      "scales the pattern by zoom",
      <InfinitePlane key="a" spacing={50} zoom={2} />,
      { "background-size": "100px 100px" },
    ],
    [
      "clamps an out-of-range zoom",
      <InfinitePlane key="b" spacing={32} zoom={50} />,
      { "background-size": "320px 320px" },
    ],
    [
      "uses the translate as the background-position",
      <InfinitePlane key="c" translate={{ x: 40, y: -20 }} />,
      { "background-position": "40px -20px" },
    ],
  ])("%s", (_name, element, style) => {
    expect(plane(element)).toHaveStyle(style);
  });
});
