import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SnapGuides } from "./snap-guides";

describe("SnapGuides", () => {
  it("renders one line per guide with the configured orientation", () => {
    const { container } = render(
      <SnapGuides
        guides={[
          { id: "x-200", orientation: "vertical", x: 200 },
          { id: "y-160", orientation: "horizontal", y: 160 },
        ]}
      />,
    );

    const vertical = container.querySelector("[data-snap-guide-id='x-200']");
    const horizontal = container.querySelector("[data-snap-guide-id='y-160']");

    expect(vertical).toHaveAttribute("data-snap-orientation", "vertical");
    expect(vertical).toHaveStyle({ left: "200px" });

    expect(horizontal).toHaveAttribute("data-snap-orientation", "horizontal");
    expect(horizontal).toHaveStyle({ top: "160px" });
  });

  it("emits the guide count via data-snap-guide-count", () => {
    const { container } = render(
      <SnapGuides
        guides={[
          { id: "a", orientation: "vertical", x: 10 },
          { id: "b", orientation: "horizontal", y: 20 },
          { id: "c", orientation: "vertical", x: 30 },
        ]}
      />,
    );

    expect(container.querySelector("[data-snap-guide-count]")).toHaveAttribute(
      "data-snap-guide-count",
      "3",
    );
  });

  it("renders nothing when guides is empty", () => {
    const { container } = render(<SnapGuides guides={[]} />);

    expect(container.querySelector("[data-snap-guide-id]")).toBeNull();
  });
});
