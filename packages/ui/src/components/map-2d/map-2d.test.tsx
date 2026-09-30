import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  type GeoJSONPolygon,
  Map2D,
  MapControls,
  MapLayer,
  MapMarker,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
} from "./map-2d";

const FRANCE: GeoJSONPolygon = {
  coordinates: [
    [-5, 51],
    [10, 51],
    [10, 41],
    [-5, 41],
    [-5, 51],
  ],
  id: "france-bbox",
  type: "polygon",
};

describe("Map2D", () => {
  it("renders a backdrop image when backdrop is set", () => {
    const { container } = render(
      <Map2D backdrop="/world.svg" backdropAlt="World map" center={[0, 0]} />,
    );
    const image = container.querySelector("image");
    expect(image).toHaveAttribute("href", "/world.svg");
    expect(image).toHaveAttribute("aria-label", "World map");
  });

  it("renders a marker button per MapMarker child and fires onSelect on click", () => {
    const onSelect = vi.fn();
    render(
      <Map2D center={[0, 0]}>
        <MapMarker onSelect={onSelect} popup="Paris" position={[2.35, 48.85]} />
        <MapMarker popup="London" position={[-0.13, 51.5]} />
      </Map2D>,
    );
    expect(screen.getByRole("button", { name: "London" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Paris" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders a standalone popup and polygon points for each GeoJSON polygon", () => {
    const { container } = render(
      <Map2D center={[0, 0]}>
        <MapLayer data={[FRANCE]} />
        <MapPopup position={[2.35, 48.85]}>
          <p>Selected: Paris</p>
        </MapPopup>
      </Map2D>,
    );
    expect(screen.getByText("Selected: Paris")).toBeInTheDocument();
    const polygon = container.querySelector("[data-shape-id='france-bbox']");
    expect(polygon).toBeInTheDocument();
    expect(polygon?.getAttribute("points")).toBeTruthy();
  });

  it("starts the SVG canvas at zoom 1 and zoom-in / zoom-out adjust data-zoom", () => {
    const { container } = render(
      <Map2D center={[0, 0]}>
        <MapControls>
          <MapZoomIn />
          <MapZoomOut />
        </MapControls>
      </Map2D>,
    );
    const readZoom = (): string | undefined =>
      container.querySelector<SVGElement>("svg[data-zoom]")?.dataset.zoom;
    expect(readZoom()).toBe("1");
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(readZoom()).toBe("1.5");
    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(readZoom()).toBe("1");
  });

  it("renders the SVG canvas with default zoom 1 without children", () => {
    const { container } = render(<Map2D center={[0, 0]} />);
    expect(container.querySelector("svg[data-zoom]")).toHaveAttribute(
      "data-zoom",
      "1",
    );
  });

  it("throws when subcomponents render outside the root", () => {
    expect(() => render(<MapZoomIn />)).toThrow(/Map2D subcomponent/);
  });
});
