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
  describe("rendering", () => {
    it("renders the SVG canvas with default zoom 1", () => {
      const { container } = render(<Map2D center={[0, 0]} />);

      const svg = container.querySelector("svg[data-zoom]");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("data-zoom", "1");
    });

    it("renders a backdrop image when backdrop is set", () => {
      const { container } = render(
        <Map2D backdrop="/world.svg" backdropAlt="World map" center={[0, 0]} />,
      );

      const image = container.querySelector("image");
      expect(image).toHaveAttribute("href", "/world.svg");
      expect(image).toHaveAttribute("aria-label", "World map");
    });
  });

  describe("markers", () => {
    it("renders a marker button for each MapMarker child", () => {
      render(
        <Map2D center={[0, 0]}>
          <MapMarker popup="Paris" position={[2.35, 48.85]} />
          <MapMarker popup="London" position={[-0.13, 51.5]} />
        </Map2D>,
      );

      expect(screen.getByRole("button", { name: "Paris" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "London" }),
      ).toBeInTheDocument();
    });

    it("fires onSelect when a marker is clicked", () => {
      const onSelect = vi.fn();
      render(
        <Map2D center={[0, 0]}>
          <MapMarker
            onSelect={onSelect}
            popup="Paris"
            position={[2.35, 48.85]}
          />
        </Map2D>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Paris" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("popups", () => {
    it("renders a standalone popup at the configured position", () => {
      render(
        <Map2D center={[0, 0]}>
          <MapPopup position={[2.35, 48.85]}>
            <p>Selected: Paris</p>
          </MapPopup>
        </Map2D>,
      );

      expect(screen.getByText("Selected: Paris")).toBeInTheDocument();
    });
  });

  describe("layers", () => {
    it("renders polygon points for each GeoJSON polygon", () => {
      const { container } = render(
        <Map2D center={[0, 0]}>
          <MapLayer data={[FRANCE]} />
        </Map2D>,
      );

      const polygon = container.querySelector("[data-shape-id='france-bbox']");
      expect(polygon).toBeInTheDocument();
      expect(polygon?.getAttribute("points")).toBeTruthy();
    });
  });

  describe("controls", () => {
    it("zoom-in and zoom-out adjust the data-zoom attribute", () => {
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
  });

  describe("compound contract", () => {
    it("throws when subcomponents render outside the root", () => {
      const renderOrphan = (): void => {
        render(<MapZoomIn />);
      };

      expect(renderOrphan).toThrow(/Map2D subcomponent/);
    });
  });
});
