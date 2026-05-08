import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Globe3D, GlobeArc, GlobeMarker } from "./globe-3d";

describe("Globe3D", () => {
  describe("rendering", () => {
    it("renders the sphere and graticule", () => {
      const { container } = render(<Globe3D autoRotate={false} />);

      expect(
        container.querySelector("[data-globe-sphere]"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-globe-graticule]"),
      ).toBeInTheDocument();
    });

    it("emits the rotation attributes on the SVG", () => {
      const { container } = render(
        <Globe3D autoRotate={false} initialPosition={{ lat: 30, lng: -45 }} />,
      );

      const svg = container.querySelector("svg[data-rotation-lng]");
      expect(svg).toHaveAttribute("data-rotation-lat", "30");
      expect(svg).toHaveAttribute("data-rotation-lng", "45");
    });
  });

  describe("markers", () => {
    it("renders a marker for points on the visible hemisphere", () => {
      const { container } = render(
        <Globe3D autoRotate={false} initialPosition={{ lat: 0, lng: 0 }}>
          <GlobeMarker color="blue" id="paris" lat={48.85} lng={2.35} />
        </Globe3D>,
      );

      expect(
        container.querySelector("[data-marker-id='paris']"),
      ).toBeInTheDocument();
    });

    it("hides markers on the far side of the globe", () => {
      const { container } = render(
        <Globe3D autoRotate={false} initialPosition={{ lat: 0, lng: 0 }}>
          <GlobeMarker id="antipodal" lat={-30} lng={170} />
        </Globe3D>,
      );

      expect(
        container.querySelector("[data-marker-id='antipodal']"),
      ).toBeNull();
    });

    it("renders the data-summary fallback list with one entry per marker", () => {
      render(
        <Globe3D autoRotate={false} initialPosition={{ lat: 0, lng: 0 }}>
          <GlobeMarker id="paris" label="Paris" lat={48.85} lng={2.35} />
          <GlobeMarker id="ny" label="New York" lat={40.71} lng={-74} />
        </Globe3D>,
      );

      expect(screen.getByText(/2 marker/)).toBeInTheDocument();
    });
  });

  describe("arcs", () => {
    it("renders an arc path between two coordinates", () => {
      const { container } = render(
        <Globe3D autoRotate={false} initialPosition={{ lat: 0, lng: 0 }}>
          <GlobeArc
            color="cyan"
            from={{ lat: 48.85, lng: 2.35 }}
            id="paris-ny"
            to={{ lat: 40.71, lng: -74 }}
          />
        </Globe3D>,
      );

      const arc = container.querySelector("[data-arc-id='paris-ny']");
      expect(arc).toBeInTheDocument();
      expect(arc?.getAttribute("d")).toMatch(/^M/);
    });
  });

  describe("compound contract", () => {
    it("throws when subcomponents render outside the root", () => {
      const renderOrphan = (): void => {
        render(<GlobeMarker lat={0} lng={0} />);
      };

      expect(renderOrphan).toThrow(/Globe3D subcomponent/);
    });
  });
});
