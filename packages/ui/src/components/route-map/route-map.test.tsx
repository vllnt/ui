import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteMap, type RouteWaypoint } from "./route-map";

const SILK_ROAD: RouteWaypoint[] = [
  { id: "chang", label: "Chang'an", position: [108.94, 34.34] },
  { id: "kashgar", label: "Kashgar", position: [75.99, 39.47] },
  { id: "samarkand", label: "Samarkand", position: [66.97, 39.65] },
  { id: "constantinople", label: "Constantinople", position: [28.98, 41.01] },
];

describe("RouteMap", () => {
  it("renders ordinal waypoint dots, the polyline and a summary of every waypoint, without progress by default", () => {
    const { container } = render(<RouteMap waypoints={SILK_ROAD} />);
    expect(
      container.querySelector("[data-waypoint-id='chang']"),
    ).toHaveAttribute("data-waypoint-ordinal", "1");
    expect(
      container.querySelector("[data-waypoint-id='constantinople']"),
    ).toHaveAttribute("data-waypoint-ordinal", "4");
    expect(screen.getAllByText("Chang'an").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chang'an/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kashgar/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Samarkand/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Constantinople/).length).toBeGreaterThan(0);
    const line = container.querySelector("[data-route-line]");
    expect(line).toBeInTheDocument();
    expect(line?.querySelector("path")?.getAttribute("d")).toMatch(/^M/);
    expect(container.querySelector("[data-route-progress]")).toBeNull();
  });

  it("uses the provided order when set", () => {
    const { container } = render(
      <RouteMap
        waypoints={[
          { id: "a", label: "Start", order: 10, position: [0, 0] },
          { id: "b", label: "End", order: 20, position: [10, 10] },
        ]}
      />,
    );
    expect(container.querySelector("[data-waypoint-id='a']")).toHaveAttribute(
      "data-waypoint-ordinal",
      "10",
    );
    expect(container.querySelector("[data-waypoint-id='b']")).toHaveAttribute(
      "data-waypoint-ordinal",
      "20",
    );
  });

  it("renders the backdrop image and info panel children when set", () => {
    const { container } = render(
      <RouteMap backdrop="/world.svg" backdropAlt="World" waypoints={SILK_ROAD}>
        <p>4 waypoints · 7,500 km</p>
      </RouteMap>,
    );
    const image = container.querySelector("image");
    expect(image).toHaveAttribute("href", "/world.svg");
    expect(image).toHaveAttribute("aria-label", "World");
    expect(screen.getByText("4 waypoints · 7,500 km")).toBeInTheDocument();
  });

  it("renders the progress indicator when showProgressIndicator is true", () => {
    const { container } = render(
      <RouteMap showProgressIndicator waypoints={SILK_ROAD} />,
    );
    expect(
      container.querySelector("[data-route-progress]"),
    ).toBeInTheDocument();
  });

  it("renders the SVG <animate> element when animated is true", () => {
    const { container } = render(<RouteMap animated waypoints={SILK_ROAD} />);
    expect(container.querySelector("animate")).toBeInTheDocument();
  });
});
