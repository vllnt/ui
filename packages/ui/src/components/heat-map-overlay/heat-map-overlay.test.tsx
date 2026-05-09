import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeatMapOverlay, type HeatMapPoint } from "./heat-map-overlay";

const POINTS: HeatMapPoint[] = [
  { id: "ny", lat: 40.7, lng: -74, weight: 0.9 },
  { id: "ldn", lat: 51.5, lng: -0.13, weight: 0.6 },
  { id: "tok", lat: 35.7, lng: 139.7, weight: 0.4 },
];

describe("HeatMapOverlay", () => {
  describe("rendering", () => {
    it("renders one heat blob per data point", () => {
      const { container } = render(<HeatMapOverlay data={POINTS} />);

      expect(
        container.querySelector("[data-point-id='ny']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-point-id='ldn']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-point-id='tok']"),
      ).toBeInTheDocument();
    });

    it("emits the weight on each blob", () => {
      const { container } = render(<HeatMapOverlay data={POINTS} />);

      const ny = container.querySelector("[data-point-id='ny']");
      expect(ny).toHaveAttribute("data-weight", "0.9");
    });

    it("renders the data-summary fallback list with one entry per point", () => {
      render(<HeatMapOverlay data={POINTS} />);

      expect(screen.getByText(/3 points plotted/)).toBeInTheDocument();
    });

    it("clamps weight outside 0..1 to the valid range", () => {
      const { container } = render(
        <HeatMapOverlay
          data={[
            { id: "low", lat: 0, lng: 0, weight: -1 },
            { id: "high", lat: 0, lng: 0, weight: 5 },
          ]}
        />,
      );

      expect(container.querySelector("[data-point-id='low']")).toHaveAttribute(
        "data-weight",
        "0",
      );
      expect(container.querySelector("[data-point-id='high']")).toHaveAttribute(
        "data-weight",
        "1",
      );
    });
  });

  describe("backdrop", () => {
    it("renders a backdrop image when backdrop is set", () => {
      const { container } = render(
        <HeatMapOverlay
          backdrop="/world.svg"
          backdropAlt="World"
          data={POINTS}
        />,
      );

      const image = container.querySelector("image");
      expect(image).toHaveAttribute("href", "/world.svg");
      expect(image).toHaveAttribute("aria-label", "World");
    });

    it("omits the image element when backdrop is not set", () => {
      const { container } = render(<HeatMapOverlay data={POINTS} />);
      expect(container.querySelector("image")).toBeNull();
    });
  });

  describe("layer", () => {
    it("renders a heat layer with the configured opacity", () => {
      const { container } = render(
        <HeatMapOverlay data={POINTS} opacity={0.4} />,
      );

      const layer = container.querySelector("[data-heat-layer]");
      expect(layer).toHaveAttribute("opacity", "0.4");
    });

    it("renders the gradient defs", () => {
      const { container } = render(<HeatMapOverlay data={POINTS} />);

      expect(container.querySelector("radialGradient")).toBeInTheDocument();
      expect(container.querySelectorAll("stop").length).toBeGreaterThan(0);
    });
  });

  describe("info panel", () => {
    it("renders children inside the info panel slot", () => {
      render(
        <HeatMapOverlay data={POINTS}>
          <p>3 events · 2024</p>
        </HeatMapOverlay>,
      );

      expect(screen.getByText("3 events · 2024")).toBeInTheDocument();
    });
  });
});
