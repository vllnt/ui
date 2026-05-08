import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ChoroplethLegend,
  ChoroplethMap,
  type ChoroplethRegion,
  ChoroplethTooltip,
} from "./choropleth-map";

const REGIONS: ChoroplethRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
];

const DATA = { DE: 4082, FR: 2937 };

describe("ChoroplethMap", () => {
  describe("rendering", () => {
    it("renders one path per region with stable data attributes", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS} />,
      );

      expect(
        container.querySelector("[data-region-id='FR']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-region-id='DE']"),
      ).toBeInTheDocument();
    });

    it("renders the accessible data table fallback", () => {
      render(<ChoroplethMap data={DATA} regions={REGIONS} />);

      expect(screen.getByText("France")).toBeInTheDocument();
      expect(screen.getByText("4,082")).toBeInTheDocument();
    });

    it("uses the missing color when a region has no data", () => {
      const { container } = render(
        <ChoroplethMap
          data={{ FR: 100 }}
          missingColor="#ff00ff"
          regions={REGIONS}
        />,
      );

      const path = container.querySelector("[data-region-id='DE']");
      expect(path).toHaveAttribute("fill", "#ff00ff");
    });
  });

  describe("interaction", () => {
    it("fires onSelectRegion when a region is clicked", () => {
      const onSelectRegion = vi.fn();
      const { container } = render(
        <ChoroplethMap
          data={DATA}
          onSelectRegion={onSelectRegion}
          regions={REGIONS}
        />,
      );

      const path = container.querySelector("[data-region-id='FR']");
      expect(path).not.toBeNull();
      if (path) fireEvent.click(path);

      expect(onSelectRegion).toHaveBeenCalledWith(
        expect.objectContaining({ id: "FR" }),
      );
    });

    it("marks the clicked region with data-selected", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS} />,
      );

      const path = container.querySelector("[data-region-id='FR']");
      if (path) fireEvent.click(path);

      expect(container.querySelector("[data-region-id='FR']")).toHaveAttribute(
        "data-selected",
        "true",
      );
    });
  });

  describe("tooltip", () => {
    it("renders the default tooltip on hover with the region name and value", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS}>
          <ChoroplethTooltip />
        </ChoroplethMap>,
      );

      const path = container.querySelector("[data-region-id='FR']");
      if (path) fireEvent.mouseEnter(path);

      expect(screen.getAllByText(/France/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2,937/).length).toBeGreaterThan(0);
    });

    it("hides the tooltip on mouse leave", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS}>
          <ChoroplethTooltip />
        </ChoroplethMap>,
      );

      const path = container.querySelector("[data-region-id='FR']");
      if (path) fireEvent.mouseEnter(path);
      if (path) fireEvent.mouseLeave(path);

      expect(container.querySelector("[data-tooltip-region-id]")).toBeNull();
    });

    it("invokes the render-prop with region + value", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS}>
          <ChoroplethTooltip>
            {({ region, value }) => (
              <span>
                Custom: {region.name} = {value ?? "?"}
              </span>
            )}
          </ChoroplethTooltip>
        </ChoroplethMap>,
      );

      const path = container.querySelector("[data-region-id='DE']");
      if (path) fireEvent.mouseEnter(path);

      expect(screen.getByText(/Custom: Germany = 4082/)).toBeInTheDocument();
    });
  });

  describe("legend", () => {
    it("renders the legend with min and max labels from the domain", () => {
      const { container } = render(
        <ChoroplethMap data={DATA} regions={REGIONS}>
          <ChoroplethLegend title="GDP" />
        </ChoroplethMap>,
      );

      expect(screen.getByText("GDP")).toBeInTheDocument();
      expect(screen.getAllByText("2,937").length).toBeGreaterThan(0);
      expect(screen.getAllByText("4,082").length).toBeGreaterThan(0);
      expect(container.querySelector("[data-legend]")).toBeInTheDocument();
    });
  });
});
