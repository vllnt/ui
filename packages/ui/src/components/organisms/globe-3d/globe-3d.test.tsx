import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Globe3D, GlobeArc, GlobeMarker } from "./globe-3d";

describe("Globe3D", () => {
  it("renders the sphere and graticule with rotation attributes on the SVG", () => {
    const { container } = render(
      <Globe3D autoRotate={false} initialPosition={{ lat: 30, lng: -45 }} />,
    );
    expect(container.querySelector("[data-globe-sphere]")).toBeInTheDocument();
    expect(
      container.querySelector("[data-globe-graticule]"),
    ).toBeInTheDocument();
    const svg = container.querySelector("svg[data-rotation-lng]");
    expect(svg).toHaveAttribute("data-rotation-lat", "30");
    expect(svg).toHaveAttribute("data-rotation-lng", "45");
  });

  it("renders visible markers, hides far-side markers, lists markers, and draws arcs", () => {
    const { container } = render(
      <Globe3D autoRotate={false} initialPosition={{ lat: 0, lng: 0 }}>
        <GlobeMarker color="blue" id="paris" lat={48.85} lng={2.35} />
        <GlobeMarker id="ny" label="New York" lat={40.71} lng={-74} />
        <GlobeMarker id="antipodal" lat={-30} lng={170} />
        <GlobeArc
          color="cyan"
          from={{ lat: 48.85, lng: 2.35 }}
          id="paris-ny"
          to={{ lat: 40.71, lng: -74 }}
        />
      </Globe3D>,
    );
    expect(
      container.querySelector("[data-marker-id='paris']"),
    ).toBeInTheDocument();
    expect(container.querySelector("[data-marker-id='antipodal']")).toBeNull();
    expect(screen.getByText(/3 marker/)).toBeInTheDocument();
    const arc = container.querySelector("[data-arc-id='paris-ny']");
    expect(arc).toBeInTheDocument();
    expect(arc?.getAttribute("d")).toMatch(/^M/);
  });

  it("throws when subcomponents render outside the root", () => {
    expect(() => render(<GlobeMarker lat={0} lng={0} />)).toThrow(
      /Globe3D subcomponent/,
    );
  });
});
