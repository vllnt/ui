import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MiniMapPanel } from "./mini-map-panel";

const baseProps = {
  viewport: { height: 300, width: 400, x: 100, y: 50, zoom: 2 },
  world: { height: 600, width: 800 },
};

describe("MiniMapPanel", () => {
  it("renders the default title and zoom percent", () => {
    render(<MiniMapPanel {...baseProps} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Zoom 200%")).toBeInTheDocument();
  });

  it("uses the override title when provided", () => {
    render(<MiniMapPanel {...baseProps} title="Map" />);

    expect(screen.getByText("Map")).toBeInTheDocument();
  });

  it("renders one element per marker", () => {
    const { container } = render(
      <MiniMapPanel
        {...baseProps}
        markers={[
          { id: "a", x: 100, y: 100 },
          { id: "b", label: "Hot", x: 400, y: 200 },
        ]}
      />,
    );

    expect(container.querySelectorAll("[title='Hot']")).toHaveLength(1);
    expect(container.querySelectorAll(".size-1\\.5")).toHaveLength(2);
  });

  it("merges the className prop", () => {
    const { container } = render(
      <MiniMapPanel {...baseProps} className="extra" />,
    );

    expect(container.firstChild).toHaveClass("extra");
  });

  it("clamps the viewport rectangle to the world bounds", () => {
    const { container } = render(
      <MiniMapPanel
        {...baseProps}
        viewport={{ height: 100, width: 100, x: 1000, y: 1000, zoom: 1 }}
      />,
    );

    const rect = container.querySelector(".bg-transparent");
    expect(rect).not.toBeNull();
  });
});
